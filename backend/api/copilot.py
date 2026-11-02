from typing import List, Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Document, TraditionalUseReport, ScientificEvidenceRecord
from ..retrieval.copilot_service import CopilotService
from ..schemas.copilot import CopilotQueryRequest, CopilotResponse

router = APIRouter(prefix="/copilot", tags=["Research Copilot"])

# Session history store
copilot_history: List[dict] = []

@router.post("/query", response_model=CopilotResponse)
def query_copilot(payload: CopilotQueryRequest):
    response = CopilotService.answer_query(payload.query, context_filter=payload.context_filter)
    
    # Record to session history
    copilot_history.append({
        "query": payload.query,
        "answer": response.direct_answer,
        "citation_count": len(response.citations),
        "entities_count": len(response.related_graph_entities)
    })

    return response

@router.get("/history")
def get_copilot_history():
    return {"history": copilot_history[-20:]}

@router.get("/sources")
def get_copilot_sources(db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.processing_status == "completed").all()
    evidence_count = db.query(ScientificEvidenceRecord).count()
    use_count = db.query(TraditionalUseReport).count()

    return {
        "indexed_documents": [
            {
                "id": d.id,
                "title": d.title,
                "authors": d.authors,
                "year": d.publication_year,
                "doi": d.doi
            }
            for d in docs
        ],
        "indexed_traditional_records": use_count,
        "indexed_scientific_evidence_records": evidence_count
    }
