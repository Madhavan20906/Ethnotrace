from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CopilotCitation(BaseModel):
    source_title: str
    document_id: Optional[str] = None
    page_number: Optional[int] = None
    doi_or_url: Optional[str] = None
    exact_passage: str
    evidence_category: str
    plant_identity_confidence: str

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., description="Research inquiry regarding medicinal plants, uses, compounds, or gaps")
    context_filter: Optional[str] = None  # e.g., "Tamil Nadu", "digestive", "anti-inflammatory"

class CopilotResponse(BaseModel):
    query: str
    direct_answer: str
    citations: List[CopilotCitation] = []
    related_graph_entities: List[Dict[str, Any]] = []
    uncertainties_and_limitations: List[str] = []
    research_gaps_identified: List[str] = []
