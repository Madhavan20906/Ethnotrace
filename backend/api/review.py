from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import ReviewRecord, PlantMention

router = APIRouter(prefix="/review", tags=["Human-in-the-Loop Review"])

@router.get("/pending")
def list_pending_reviews(db: Session = Depends(get_db)):
    mentions = db.query(PlantMention).filter(
        PlantMention.validation_status.in_(["Pending review", "Provisional"])
    ).all()
    
    flagged_records = db.query(ReviewRecord).filter(ReviewRecord.action == "flagged").all()

    return {
        "pending_mentions_count": len(mentions),
        "pending_mentions": [
            {
                "id": m.id,
                "document_id": m.document_id,
                "page_number": m.page_number,
                "raw_mention": m.raw_mention,
                "scientific_name": m.scientific_name,
                "traditional_use": m.traditional_use,
                "supporting_passage": m.supporting_passage,
                "language": m.language,
                "validation_status": m.validation_status,
                "reviewer_notes": m.reviewer_notes
            }
            for m in mentions
        ],
        "system_flags": [
            {
                "id": f.id,
                "entity_id": f.entity_id,
                "entity_type": f.entity_type,
                "comments": f.comments,
                "created_at": f.created_at
            }
            for f in flagged_records
        ]
    }

@router.get("/audit")
def list_audit_trail(db: Session = Depends(get_db)):
    records = db.query(ReviewRecord).order_by(ReviewRecord.created_at.desc()).all()
    return {
        "total_audit_events": len(records),
        "events": [
            {
                "id": r.id,
                "entity_type": r.entity_type,
                "entity_id": r.entity_id,
                "reviewer_name": r.reviewer_name,
                "previous_state": r.previous_state,
                "updated_state": r.updated_state,
                "action": r.action,
                "comments": r.comments,
                "created_at": r.created_at
            }
            for r in records
        ]
    }
