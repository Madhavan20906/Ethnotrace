from typing import Optional, List
from pydantic import BaseModel, Field

class ScientificEvidenceSchema(BaseModel):
    id: str
    botanical_id: str
    botanical_name: Optional[str] = None
    claim_description: str
    evidence_tier: str
    study_methodology: Optional[str] = None
    publication_title: str
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    extracted_from_url: Optional[str] = None
    plant_identity_certainty: str = "High"
    extraction_confidence: float = 0.9
    contradictory_evidence: Optional[str] = None
    limitations: Optional[str] = None
    validation_status: str = "Peer-reviewed"

    class Config:
        from_attributes = True

class EvidenceComparisonSchema(BaseModel):
    botanical_id: str
    botanical_name: str
    traditional_claims: List[dict]
    experimental_records: List[ScientificEvidenceSchema]
    clinical_records: List[ScientificEvidenceSchema]
    concordance_summary: str
    contradictions_identified: List[str]
    evidence_gap_rating: str  # Critical, Moderate, Well-documented
