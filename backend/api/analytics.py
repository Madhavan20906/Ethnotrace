from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database.connection import get_db
from ..database.models import (
    Document, PlantMention, BotanicalEntity, TraditionalUseReport,
    ScientificEvidenceRecord, ReviewRecord
)
from ..graph.graph_store import graph_store

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_docs = db.query(Document).count()
    completed_docs = db.query(Document).filter(Document.processing_status == "completed").count()
    total_mentions = db.query(PlantMention).count()
    total_botanical = db.query(BotanicalEntity).count()
    
    # Unresolved plant names
    unresolved_count = db.query(PlantMention).filter(
        (PlantMention.validation_status == "Pending review") | (PlantMention.scientific_name == None)
    ).count()

    total_traditional_uses = db.query(TraditionalUseReport).count()
    total_evidence_records = db.query(ScientificEvidenceRecord).count()
    pending_reviews = db.query(ReviewRecord).filter(ReviewRecord.action == "flagged").count()

    # Family distribution
    family_counts = (
        db.query(BotanicalEntity.botanical_family, func.count(BotanicalEntity.id))
        .group_by(BotanicalEntity.botanical_family)
        .all()
    )
    families_dist = [{"family": f[0], "count": f[1]} for f in family_counts]

    # Evidence tier distribution
    tier_counts = (
        db.query(ScientificEvidenceRecord.evidence_tier, func.count(ScientificEvidenceRecord.id))
        .group_by(ScientificEvidenceRecord.evidence_tier)
        .all()
    )
    tiers_dist = [{"tier": t[0], "count": t[1]} for t in tier_counts]

    # Language distribution
    lang_counts = (
        db.query(PlantMention.language, func.count(PlantMention.id))
        .group_by(PlantMention.language)
        .all()
    )
    lang_dist = [{"language": l[0], "count": l[1]} for l in lang_counts]

    # Geographical distribution (for Leaflet map)
    geo_reports = db.query(TraditionalUseReport).filter(
        TraditionalUseReport.latitude != None,
        TraditionalUseReport.longitude != None
    ).all()

    geo_locations = []
    for gr in geo_reports:
        bot = db.query(BotanicalEntity).filter(BotanicalEntity.id == gr.botanical_id).first()
        geo_locations.append({
            "id": gr.id,
            "plant_name": bot.accepted_scientific_name if bot else "Documented Plant",
            "family": bot.botanical_family if bot else "",
            "condition": gr.condition_or_disease,
            "plant_part": gr.plant_part,
            "preparation": gr.preparation_method,
            "community": gr.community_name,
            "location_name": gr.geographic_location,
            "latitude": gr.latitude,
            "longitude": gr.longitude,
            "supporting_passage": gr.supporting_passage
        })

    return {
        "metrics": {
            "total_documents": total_docs,
            "processed_documents": completed_docs,
            "extracted_plant_mentions": total_mentions,
            "verified_botanical_identities": total_botanical,
            "unresolved_plant_names": unresolved_count,
            "traditional_use_reports": total_traditional_uses,
            "evidence_records": total_evidence_records,
            "pending_reviews": pending_reviews,
            "knowledge_graph_nodes": len(graph_store.nodes),
            "knowledge_graph_edges": len(graph_store.edges)
        },
        "distributions": {
            "plant_families": families_dist,
            "evidence_categories": tiers_dist,
            "languages": lang_dist
        },
        "geographical_records": geo_locations
    }
