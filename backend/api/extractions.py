from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import PlantMention, ReviewRecord, Document
from ..schemas.extraction import ExtractionReviewRequest

router = APIRouter(prefix="/extractions", tags=["Extractions"])

@router.get("")
def list_extractions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    language: Optional[str] = None,
    document_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PlantMention)
    if status:
        query = query.filter(PlantMention.validation_status.ilike(f"%{status}%"))
    if language:
        query = query.filter(PlantMention.language.ilike(f"%{language}%"))
    if document_id:
        query = query.filter(PlantMention.document_id == document_id)

    total = query.count()
    items = query.order_by(PlantMention.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for m in items:
        doc = db.query(Document).filter(Document.id == m.document_id).first()
        results.append({
            "id": m.id,
            "document_id": m.document_id,
            "document_title": doc.title if doc else "Unknown Source",
            "page_number": m.page_number,
            "raw_mention": m.raw_mention,
            "scientific_name": m.scientific_name,
            "plant_part": m.plant_part,
            "traditional_use": m.traditional_use,
            "preparation_method": m.preparation_method,
            "administration_route": m.administration_route,
            "community": m.community,
            "location": m.location,
            "language": m.language,
            "transliteration": m.transliteration,
            "supporting_passage": m.supporting_passage,
            "evidence_type": m.evidence_type,
            "validation_status": m.validation_status,
            "reviewer_notes": m.reviewer_notes,
            "created_at": m.created_at
        })
    return {"total": total, "items": results}

@router.get("/{id}")
def get_extraction(id: str, db: Session = Depends(get_db)):
    m = db.query(PlantMention).filter(PlantMention.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Extracted record not found.")
    doc = db.query(Document).filter(Document.id == m.document_id).first()
    return {
        "id": m.id,
        "document_id": m.document_id,
        "document_title": doc.title if doc else "Unknown Source",
        "page_number": m.page_number,
        "raw_mention": m.raw_mention,
        "scientific_name": m.scientific_name,
        "plant_part": m.plant_part,
        "traditional_use": m.traditional_use,
        "preparation_method": m.preparation_method,
        "administration_route": m.administration_route,
        "community": m.community,
        "location": m.location,
        "language": m.language,
        "transliteration": m.transliteration,
        "supporting_passage": m.supporting_passage,
        "evidence_type": m.evidence_type,
        "validation_status": m.validation_status,
        "reviewer_notes": m.reviewer_notes
    }

@router.post("/{id}/review")
def review_extraction(id: str, payload: ExtractionReviewRequest, db: Session = Depends(get_db)):
    m = db.query(PlantMention).filter(PlantMention.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Extracted record not found.")

    prev_state = f"Status: {m.validation_status}, Scientific: {m.scientific_name}, Use: {m.traditional_use}"

    if payload.action.lower() == "approved":
        m.validation_status = "Approved"
    elif payload.action.lower() == "rejected":
        m.validation_status = "Rejected"
    else:
        m.validation_status = "Edited"

    if payload.scientific_name:
        m.scientific_name = payload.scientific_name
    if payload.plant_part:
        m.plant_part = payload.plant_part
    if payload.traditional_use:
        m.traditional_use = payload.traditional_use
    if payload.preparation_method:
        m.preparation_method = payload.preparation_method
    if payload.administration_route:
        m.administration_route = payload.administration_route
    if payload.reviewer_notes:
        m.reviewer_notes = payload.reviewer_notes

    # Add audit review record
    audit = ReviewRecord(
        entity_type="plant_mention",
        entity_id=m.id,
        reviewer_name=payload.reviewer_name or "Botanical Specialist",
        previous_state=prev_state,
        updated_state=f"Status: {m.validation_status}, Scientific: {m.scientific_name}, Use: {m.traditional_use}",
        action=payload.action.lower(),
        comments=payload.reviewer_notes
    )
    db.add(audit)
    db.commit()

    return {"message": "Review recorded successfully.", "id": m.id, "status": m.validation_status}

@router.post("/{id}/approve")
def approve_extraction(id: str, db: Session = Depends(get_db)):
    m = db.query(PlantMention).filter(PlantMention.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Extracted record not found.")
    m.validation_status = "Approved"
    db.commit()
    return {"message": "Extraction approved.", "id": id}

@router.post("/{id}/reject")
def reject_extraction(id: str, db: Session = Depends(get_db)):
    m = db.query(PlantMention).filter(PlantMention.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Extracted record not found.")
    m.validation_status = "Rejected"
    db.commit()
    return {"message": "Extraction marked as rejected.", "id": id}
