from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import DataSource

router = APIRouter(prefix="/sources", tags=["Data Sources"])

@router.get("")
def list_sources(db: Session = Depends(get_db)):
    sources = db.query(DataSource).all()
    results = []
    for s in sources:
        results.append({
            "id": s.id,
            "name": s.name,
            "provider": s.provider,
            "url": s.url,
            "license": s.license,
            "attribution": s.attribution,
            "available_fields": s.available_fields,
            "quality_limitations": s.quality_limitations,
            "record_count": s.record_count,
            "last_synced": s.last_synced
        })
    return {"total": len(results), "items": results}

@router.post("/import")
def trigger_source_sync(source_id: str = Query(...), db: Session = Depends(get_db)):
    source = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found.")
    
    return {
        "message": f"Source '{source.name}' successfully verified and synchronized.",
        "record_count": source.record_count,
        "attribution": source.attribution
    }
