from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import ScientificEvidenceRecord, BotanicalEntity, TraditionalUseReport, KnowledgeGapRecord
from ..evidence.classifier import EvidenceClassifier

router = APIRouter(prefix="/evidence", tags=["Evidence Intelligence"])

@router.get("")
def list_evidence(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    tier: Optional[str] = None,
    botanical_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ScientificEvidenceRecord)
    if tier:
        query = query.filter(ScientificEvidenceRecord.evidence_tier.ilike(f"%{tier}%"))
    if botanical_id:
        query = query.filter(ScientificEvidenceRecord.botanical_id == botanical_id)

    total = query.count()
    records = query.order_by(ScientificEvidenceRecord.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for r in records:
        plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == r.botanical_id).first()
        results.append({
            "id": r.id,
            "botanical_id": r.botanical_id,
            "botanical_name": plant.accepted_scientific_name if plant else "Unknown",
            "claim_description": r.claim_description,
            "evidence_tier": r.evidence_tier,
            "study_methodology": r.study_methodology,
            "publication_title": r.publication_title,
            "publication_year": r.publication_year,
            "doi": r.doi,
            "pmid": r.pmid,
            "plant_identity_certainty": r.plant_identity_certainty,
            "extraction_confidence": r.extraction_confidence,
            "contradictory_evidence": r.contradictory_evidence,
            "limitations": r.limitations,
            "validation_status": r.validation_status
        })

    return {"total": total, "items": results}

@router.get("/compare")
def compare_plant_evidence(botanical_id: str = Query(...), db: Session = Depends(get_db)):
    plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == botanical_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Botanical entity not found.")

    uses = db.query(TraditionalUseReport).filter(TraditionalUseReport.botanical_id == botanical_id).all()
    evidence = db.query(ScientificEvidenceRecord).filter(ScientificEvidenceRecord.botanical_id == botanical_id).all()

    use_strings = [u.condition_or_disease for u in uses]
    exp_dicts = [
        {
            "id": e.id,
            "claim_description": e.claim_description,
            "evidence_tier": e.evidence_tier,
            "publication_title": e.publication_title,
            "contradictory_evidence": e.contradictory_evidence
        }
        for e in evidence
    ]

    comparison = EvidenceClassifier.compare_claims(use_strings, exp_dicts)

    return {
        "botanical_id": plant.id,
        "botanical_name": plant.accepted_scientific_name,
        "family": plant.botanical_family,
        "traditional_use_count": len(uses),
        "experimental_record_count": len(evidence),
        "traditional_uses": [{"id": u.id, "condition": u.condition_or_disease, "community": u.community_name, "passage": u.supporting_passage} for u in uses],
        "evidence_records": exp_dicts,
        "comparison_analysis": comparison
    }

@router.get("/gaps")
def list_knowledge_gaps(db: Session = Depends(get_db)):
    gaps = db.query(KnowledgeGapRecord).all()
    results = []
    for g in gaps:
        plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == g.botanical_id).first()
        results.append({
            "id": g.id,
            "botanical_id": g.botanical_id,
            "plant_name": g.plant_name,
            "family": plant.botanical_family if plant else "Unknown",
            "traditional_report_count": g.traditional_report_count,
            "in_vitro_count": g.in_vitro_count,
            "in_vivo_count": g.in_vivo_count,
            "clinical_trial_count": g.clinical_trial_count,
            "gap_severity": g.gap_severity,
            "underrepresented_region": g.underrepresented_region,
            "notes": g.notes
        })
    return {"total": len(results), "items": results}

@router.get("/{id}")
def get_evidence_detail(id: str, db: Session = Depends(get_db)):
    r = db.query(ScientificEvidenceRecord).filter(ScientificEvidenceRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Evidence record not found.")
    plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == r.botanical_id).first()
    return {
        "id": r.id,
        "botanical_id": r.botanical_id,
        "botanical_name": plant.accepted_scientific_name if plant else "Unknown",
        "claim_description": r.claim_description,
        "evidence_tier": r.evidence_tier,
        "study_methodology": r.study_methodology,
        "publication_title": r.publication_title,
        "publication_year": r.publication_year,
        "doi": r.doi,
        "pmid": r.pmid,
        "plant_identity_certainty": r.plant_identity_certainty,
        "extraction_confidence": r.extraction_confidence,
        "contradictory_evidence": r.contradictory_evidence,
        "limitations": r.limitations,
        "validation_status": r.validation_status
    }
