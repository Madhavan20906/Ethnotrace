import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Document, DocumentPage, PlantMention
from ..schemas.extraction import DocumentResponse, DocumentDetailResponse
from ..agents.orchestrator import EthnoTraceOrchestrator, WorkflowState

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".doc", ".csv", ".json"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

def run_background_pipeline(doc_id: str, file_path: str, filename: str):
    from ..database.connection import SessionLocal
    db = SessionLocal()
    try:
        state = WorkflowState(doc_id, file_path, filename)
        EthnoTraceOrchestrator.execute_pipeline(state, db)
    finally:
        db.close()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}")

    saved_path = os.path.join(UPLOAD_DIR, file.filename)
    # Save uploaded file
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds maximum permissible size of 25MB.")
    
    with open(saved_path, "wb") as f:
        f.write(contents)

    doc_record = Document(
        filename=file.filename,
        title=os.path.splitext(file.filename)[0].replace("_", " ").title(),
        language="English",
        processing_status="processing",
        file_path=saved_path,
        file_size=len(contents),
        file_type=ext.replace(".", "")
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # Trigger autonomous agent pipeline in background
    background_tasks.add_task(run_background_pipeline, doc_record.id, saved_path, file.filename)

    return DocumentResponse(
        id=doc_record.id,
        filename=doc_record.filename,
        title=doc_record.title,
        authors=doc_record.authors,
        publication_year=doc_record.publication_year,
        doi=doc_record.doi,
        language=doc_record.language,
        processing_status=doc_record.processing_status,
        file_size=doc_record.file_size,
        file_type=doc_record.file_type,
        upload_timestamp=doc_record.upload_timestamp,
        error_message=doc_record.error_message,
        mention_count=0
    )

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if status:
        query = query.filter(Document.processing_status == status)
    docs = query.order_by(Document.upload_timestamp.desc()).offset(skip).limit(limit).all()
    
    results = []
    for d in docs:
        m_count = db.query(PlantMention).filter(PlantMention.document_id == d.id).count()
        results.append(DocumentResponse(
            id=d.id,
            filename=d.filename,
            title=d.title,
            authors=d.authors,
            publication_year=d.publication_year,
            doi=d.doi,
            language=d.language,
            processing_status=d.processing_status,
            file_size=d.file_size,
            file_type=d.file_type,
            upload_timestamp=d.upload_timestamp,
            error_message=d.error_message,
            mention_count=m_count
        ))
    return results

@router.get("/{id}", response_model=DocumentDetailResponse)
def get_document(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    pages = db.query(DocumentPage).filter(DocumentPage.document_id == id).order_by(DocumentPage.page_number.asc()).all()
    mentions = db.query(PlantMention).filter(PlantMention.document_id == id).all()

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        title=doc.title,
        authors=doc.authors,
        publication_year=doc.publication_year,
        doi=doc.doi,
        language=doc.language,
        processing_status=doc.processing_status,
        file_size=doc.file_size,
        file_type=doc.file_type,
        upload_timestamp=doc.upload_timestamp,
        error_message=doc.error_message,
        mention_count=len(mentions),
        extracted_text=doc.extracted_text,
        pages=[{"id": p.id, "page_number": p.page_number, "text": p.text, "paragraph_count": p.paragraph_count} for p in pages],
        plant_mentions=[{
            "id": m.id,
            "raw_mention": m.raw_mention,
            "scientific_name": m.scientific_name,
            "plant_part": m.plant_part,
            "traditional_use": m.traditional_use,
            "preparation_method": m.preparation_method,
            "administration_route": m.administration_route,
            "community": m.community,
            "location": m.location,
            "page_number": m.page_number,
            "supporting_passage": m.supporting_passage,
            "validation_status": m.validation_status
        } for m in mentions]
    )

@router.post("/{id}/process")
def reprocess_document(id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc.processing_status = "processing"
    doc.error_message = None
    db.commit()

    background_tasks.add_task(run_background_pipeline, doc.id, doc.file_path, doc.filename)
    return {"message": "Document reprocessing initiated in background.", "id": doc.id}

@router.get("/{id}/status")
def get_document_status(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    m_count = db.query(PlantMention).filter(PlantMention.document_id == id).count()
    return {
        "id": doc.id,
        "filename": doc.filename,
        "processing_status": doc.processing_status,
        "mention_count": m_count,
        "error_message": doc.error_message,
        "upload_timestamp": doc.upload_timestamp
    }

@router.delete("/{id}")
def delete_document(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document successfully deleted.", "id": id}
