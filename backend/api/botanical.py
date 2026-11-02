from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import BotanicalEntity, LocalName, TraditionalUseReport, ScientificEvidenceRecord
from ..resolution.botanical_resolver import BotanicalResolver
from ..schemas.botanical import BotanicalResolveRequest, BotanicalResolveResponse
from ..graph.graph_store import graph_store

router = APIRouter(prefix="/plants", tags=["Botanical"])

@router.get("")
def list_plants(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    family: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BotanicalEntity)
    if family:
        query = query.filter(BotanicalEntity.botanical_family.ilike(f"%{family}%"))
    if search:
        query = query.filter(BotanicalEntity.accepted_scientific_name.ilike(f"%{search}%"))
    
    total = query.count()
    plants = query.offset(skip).limit(limit).all()

    results = []
    for p in plants:
        vernaculars = db.query(LocalName).filter(LocalName.botanical_id == p.id).all()
        uses_count = db.query(TraditionalUseReport).filter(TraditionalUseReport.botanical_id == p.id).count()
        evid_count = db.query(ScientificEvidenceRecord).filter(ScientificEvidenceRecord.botanical_id == p.id).count()

        results.append({
            "id": p.id,
            "accepted_scientific_name": p.accepted_scientific_name,
            "botanical_family": p.botanical_family,
            "authorship": p.authorship,
            "taxonomic_rank": p.taxonomic_rank,
            "status": p.status,
            "powo_id": p.powo_id,
            "gbif_id": p.gbif_id,
            "mpns_id": p.mpns_id,
            "description": p.description,
            "native_range": p.native_range,
            "verification_status": p.verification_status,
            "identity_confidence": p.identity_confidence,
            "local_names": [{"name": ln.name, "language": ln.language, "transliteration": ln.transliteration} for ln in vernaculars],
            "traditional_use_count": uses_count,
            "evidence_record_count": evid_count
        })

    return {"total": total, "items": results}

@router.get("/search")
def search_plants(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    res = BotanicalResolver.resolve_name(q)
    return res

@router.post("/resolve", response_model=BotanicalResolveResponse)
def resolve_plant_name(payload: BotanicalResolveRequest):
    res = BotanicalResolver.resolve_name(payload.query, language=payload.language or "English", regional_context=payload.regional_context)
    return BotanicalResolveResponse(
        query=res["query"],
        resolved=res["resolved"],
        accepted_species=res.get("accepted_species"),
        candidates=res.get("candidates", []),
        is_ambiguous=res.get("is_ambiguous", False),
        ambiguity_explanation=res.get("ambiguity_explanation")
    )

@router.get("/{id}")
def get_plant_detail(id: str, db: Session = Depends(get_db)):
    plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Botanical entity not found.")

    local_names = db.query(LocalName).filter(LocalName.botanical_id == id).all()
    uses = db.query(TraditionalUseReport).filter(TraditionalUseReport.botanical_id == id).all()
    evidence = db.query(ScientificEvidenceRecord).filter(ScientificEvidenceRecord.botanical_id == id).all()

    # Retrieve related graph nodes
    p_graph_id = f"plant_{plant.id}"
    graph_rels = graph_store.get_node_details(p_graph_id)

    return {
        "id": plant.id,
        "accepted_scientific_name": plant.accepted_scientific_name,
        "botanical_family": plant.botanical_family,
        "authorship": plant.authorship,
        "taxonomic_rank": plant.taxonomic_rank,
        "status": plant.status,
        "powo_id": plant.powo_id,
        "gbif_id": plant.gbif_id,
        "mpns_id": plant.mpns_id,
        "description": plant.description,
        "native_range": plant.native_range,
        "verification_status": plant.verification_status,
        "identity_confidence": plant.identity_confidence,
        "local_names": [{"id": ln.id, "name": ln.name, "language": ln.language, "transliteration": ln.transliteration, "region": ln.region} for ln in local_names],
        "traditional_uses": [{
            "id": u.id,
            "condition": u.condition_or_disease,
            "plant_part": u.plant_part,
            "preparation_method": u.preparation_method,
            "administration_route": u.administration_route,
            "community": u.community_name,
            "location": u.geographic_location,
            "latitude": u.latitude,
            "longitude": u.longitude,
            "supporting_passage": u.supporting_passage
        } for u in uses],
        "scientific_evidence": [{
            "id": e.id,
            "claim": e.claim_description,
            "tier": e.evidence_tier,
            "methodology": e.study_methodology,
            "publication_title": e.publication_title,
            "publication_year": e.publication_year,
            "doi": e.doi,
            "pmid": e.pmid,
            "limitations": e.limitations,
            "contradictory_evidence": e.contradictory_evidence
        } for e in evidence],
        "graph_connections": graph_rels
    }

@router.get("/{id}/relationships")
def get_plant_relationships(id: str, db: Session = Depends(get_db)):
    plant = db.query(BotanicalEntity).filter(BotanicalEntity.id == id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Botanical entity not found.")
    p_graph_id = f"plant_{plant.id}"
    graph_rels = graph_store.get_node_details(p_graph_id)
    return {
        "plant_id": plant.id,
        "accepted_scientific_name": plant.accepted_scientific_name,
        "relationships": graph_rels or {"outgoing_relationships": [], "incoming_relationships": []}
    }
