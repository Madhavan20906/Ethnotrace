from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import HistoricalTerminologyMapping, BotanicalEntity

router = APIRouter(prefix="/historical", tags=["Historical Knowledge Mapper"])

@router.get("/search")
def search_historical(
    q: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(HistoricalTerminologyMapping)
    if q:
        query = query.filter(HistoricalTerminologyMapping.historical_name.ilike(f"%{q}%"))
    if source:
        query = query.filter(HistoricalTerminologyMapping.historical_source.ilike(f"%{source}%"))

    mappings = query.all()
    results = []
    for m in mappings:
        modern_plant = None
        if m.modern_botanical_id:
            modern_plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == m.modern_botanical_id).first()

        results.append({
            "id": m.id,
            "historical_name": m.historical_name,
            "historical_source": m.historical_source,
            "modern_candidate_name": m.modern_candidate_name,
            "modern_botanical_id": m.modern_botanical_id,
            "modern_family": modern_plant.botanical_family if modern_plant else None,
            "match_confidence": m.match_confidence,
            "temporal_period": m.temporal_period,
            "geographical_context": m.geographical_context,
            "ambiguity_notes": m.ambiguity_notes,
            "verification_status": m.verification_status
        })

    return {"total": len(results), "items": results}

@router.post("/resolve")
def resolve_historical_term(
    historical_name: str = Query(...),
    historical_source: str = Query(...),
    modern_name: str = Query(...),
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    new_mapping = HistoricalTerminologyMapping(
        historical_name=historical_name,
        historical_source=historical_source,
        modern_candidate_name=modern_name,
        match_confidence=0.90,
        temporal_period="Historical Manuscript",
        ambiguity_notes=notes,
        verification_status="Verified"
    )
    db.add(new_mapping)
    db.commit()
    db.refresh(new_mapping)
    return {"message": "Historical terminology mapping recorded.", "id": new_mapping.id}
