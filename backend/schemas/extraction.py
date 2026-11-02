from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ExtractedPlantSchema(BaseModel):
    plant_mention: str = Field(..., description="Source-reported plant name")
    scientific_name: Optional[str] = Field(None, description="Inferred or direct scientific binomial")
    plant_part: Optional[str] = Field(None, description="Leaves, Bark, Root, Whole plant, etc.")
    traditional_use: Optional[str] = Field(None, description="Source-reported medicinal/traditional use")
    preparation_method: Optional[str] = Field(None, description="Decoction, paste, powder, infusion, etc.")
    administration_route: Optional[str] = Field(None, description="Oral, topical, inhalation, etc.")
    community: Optional[str] = Field(None, description="Reporting ethnic group or indigenous community")
    location: Optional[str] = Field(None, description="Geographic locality, district, or region")
    language: str = Field("English", description="Source text language or script")
    transliteration: Optional[str] = Field(None, description="Latin transliteration if non-Latin script")
    source_id: Optional[str] = Field(None, description="Document ID")
    page_number: int = Field(1, description="Page number of supporting passage")
    supporting_passage: str = Field(..., description="Exact extracted textual passage")
    evidence_type: str = Field("Traditional documentation", description="Evidence category")
    validation_status: str = Field("Pending review", description="Scientific validation status")

class ExtractionReviewRequest(BaseModel):
    action: str = Field(..., description="'approved', 'rejected', or 'edited'")
    scientific_name: Optional[str] = None
    plant_part: Optional[str] = None
    traditional_use: Optional[str] = None
    preparation_method: Optional[str] = None
    administration_route: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewer_name: Optional[str] = "Ethnobotanist Specialist"

class DocumentResponse(BaseModel):
    id: str
    filename: str
    title: Optional[str]
    authors: Optional[str]
    publication_year: Optional[int]
    doi: Optional[str]
    language: str
    processing_status: str
    file_size: int
    file_type: str
    upload_timestamp: datetime
    error_message: Optional[str] = None
    mention_count: Optional[int] = 0

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    extracted_text: Optional[str]
    pages: List[dict] = []
    plant_mentions: List[dict] = []
