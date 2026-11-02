from typing import Optional, List
from pydantic import BaseModel, Field

class LocalNameSchema(BaseModel):
    id: Optional[str] = None
    name: str
    script: str = "Latin"
    transliteration: Optional[str] = None
    language: str
    region: Optional[str] = None
    certainty_score: float = 0.95

class BotanicalCandidateSchema(BaseModel):
    id: Optional[str] = None
    candidate_name: str
    candidate_family: str
    match_score: float
    match_type: str  # exact, synonym, fuzzy, historical
    confidence: float
    resolution_status: str
    resolution_notes: Optional[str] = None

class BotanicalEntitySchema(BaseModel):
    id: str
    accepted_scientific_name: str
    botanical_family: str
    authorship: Optional[str] = None
    taxonomic_rank: str = "Species"
    status: str = "accepted"
    powo_id: Optional[str] = None
    gbif_id: Optional[str] = None
    mpns_id: Optional[str] = None
    description: Optional[str] = None
    native_range: Optional[str] = None
    verification_status: str = "verified"
    identity_confidence: float = 1.0
    local_names: List[LocalNameSchema] = []
    candidates: List[BotanicalCandidateSchema] = []

    class Config:
        from_attributes = True

class BotanicalResolveRequest(BaseModel):
    query: str = Field(..., description="Plant name in any language or transliteration")
    language: Optional[str] = "English"
    regional_context: Optional[str] = None

class BotanicalResolveResponse(BaseModel):
    query: str
    resolved: bool
    accepted_species: Optional[BotanicalEntitySchema] = None
    candidates: List[BotanicalCandidateSchema] = []
    is_ambiguous: bool = False
    ambiguity_explanation: Optional[str] = None
