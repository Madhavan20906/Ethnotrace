import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .connection import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    title = Column(String(500), nullable=True)
    authors = Column(String(500), nullable=True)
    publication_year = Column(Integer, nullable=True)
    doi = Column(String(255), nullable=True)
    source_url = Column(String(1000), nullable=True)
    language = Column(String(50), default="English")
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    upload_timestamp = Column(DateTime, default=utc_now)
    file_path = Column(String(1000), nullable=True)
    file_size = Column(Integer, default=0)
    file_type = Column(String(20), default="pdf")
    extracted_text = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    plant_mentions = relationship("PlantMention", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    paragraph_count = Column(Integer, default=1)

    document = relationship("Document", back_populates="pages")


class PlantMention(Base):
    __tablename__ = "plant_mentions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, default=1)
    raw_mention = Column(String(255), nullable=False)
    scientific_name = Column(String(255), nullable=True)
    plant_part = Column(String(100), nullable=True)
    traditional_use = Column(Text, nullable=True)
    preparation_method = Column(String(255), nullable=True)
    administration_route = Column(String(100), nullable=True)
    community = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    language = Column(String(50), default="English")
    transliteration = Column(String(255), nullable=True)
    supporting_passage = Column(Text, nullable=False)
    evidence_type = Column(String(100), default="Traditional documentation")
    validation_status = Column(String(50), default="Pending review")  # Pending review, Approved, Rejected, Edited
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="plant_mentions")
    candidates = relationship("BotanicalCandidate", back_populates="mention", cascade="all, delete-orphan")


class BotanicalEntity(Base):
    __tablename__ = "botanical_entities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    accepted_scientific_name = Column(String(255), unique=True, nullable=False)
    botanical_family = Column(String(100), nullable=False)
    authorship = Column(String(255), nullable=True)
    taxonomic_rank = Column(String(50), default="Species")
    status = Column(String(50), default="accepted")  # accepted, synonym, unresolved
    powo_id = Column(String(100), nullable=True)
    gbif_id = Column(String(100), nullable=True)
    mpns_id = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    native_range = Column(String(500), nullable=True)
    verification_status = Column(String(50), default="verified")  # verified, provisional, under_review
    identity_confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=utc_now)

    local_names = relationship("LocalName", back_populates="botanical_entity", cascade="all, delete-orphan")
    use_reports = relationship("TraditionalUseReport", back_populates="botanical_entity", cascade="all, delete-orphan")
    evidence_records = relationship("ScientificEvidenceRecord", back_populates="botanical_entity", cascade="all, delete-orphan")


class LocalName(Base):
    __tablename__ = "local_names"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    botanical_id = Column(String(36), ForeignKey("botanical_entities.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    script = Column(String(100), default="Latin")
    transliteration = Column(String(255), nullable=True)
    language = Column(String(50), nullable=False)
    region = Column(String(255), nullable=True)
    certainty_score = Column(Float, default=0.95)

    botanical_entity = relationship("BotanicalEntity", back_populates="local_names")


class BotanicalCandidate(Base):
    __tablename__ = "botanical_candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plant_mention_id = Column(String(36), ForeignKey("plant_mentions.id", ondelete="CASCADE"), nullable=False)
    botanical_id = Column(String(36), ForeignKey("botanical_entities.id", ondelete="SET NULL"), nullable=True)
    candidate_name = Column(String(255), nullable=False)
    candidate_family = Column(String(100), nullable=False)
    match_score = Column(Float, default=0.0)
    match_type = Column(String(50), default="fuzzy")  # exact, synonym, fuzzy, historical
    confidence = Column(Float, default=0.0)
    resolution_status = Column(String(50), default="candidate")  # candidate, selected, rejected
    resolution_notes = Column(Text, nullable=True)

    mention = relationship("PlantMention", back_populates="candidates")


class TraditionalUseReport(Base):
    __tablename__ = "traditional_use_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    botanical_id = Column(String(36), ForeignKey("botanical_entities.id", ondelete="CASCADE"), nullable=False)
    condition_or_disease = Column(String(255), nullable=False)
    plant_part = Column(String(100), nullable=True)
    preparation_method = Column(String(255), nullable=True)
    administration_route = Column(String(100), nullable=True)
    community_name = Column(String(255), nullable=True)
    geographic_location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    historical_period = Column(String(100), nullable=True)
    supporting_passage = Column(Text, nullable=False)
    validation_status = Column(String(50), default="Verified")

    botanical_entity = relationship("BotanicalEntity", back_populates="use_reports")


class ScientificEvidenceRecord(Base):
    __tablename__ = "scientific_evidence_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    botanical_id = Column(String(36), ForeignKey("botanical_entities.id", ondelete="CASCADE"), nullable=False)
    claim_description = Column(Text, nullable=False)
    evidence_tier = Column(String(100), nullable=False)  
    # traditional_documentation, historical_documentation, in_vitro, in_vivo_preclinical, 
    # animal_model, observational_human, clinical_trial, systematic_review
    study_methodology = Column(Text, nullable=True)
    publication_title = Column(String(500), nullable=False)
    publication_year = Column(Integer, nullable=True)
    doi = Column(String(255), nullable=True)
    pmid = Column(String(50), nullable=True)
    extracted_from_url = Column(String(500), nullable=True)
    plant_identity_certainty = Column(String(50), default="High")
    extraction_confidence = Column(Float, default=0.92)
    contradictory_evidence = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
    validation_status = Column(String(50), default="Peer-reviewed")
    created_at = Column(DateTime, default=utc_now)

    botanical_entity = relationship("BotanicalEntity", back_populates="evidence_records")


class HistoricalTerminologyMapping(Base):
    __tablename__ = "historical_terminology_mappings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    historical_name = Column(String(255), nullable=False)
    historical_source = Column(String(255), nullable=False)  # e.g., Hortus Malabaricus, Charaka Samhita, Materia Medica
    modern_candidate_name = Column(String(255), nullable=False)
    modern_botanical_id = Column(String(36), ForeignKey("botanical_entities.id", ondelete="SET NULL"), nullable=True)
    match_confidence = Column(Float, default=0.85)
    temporal_period = Column(String(100), default="17th Century")
    geographical_context = Column(String(255), nullable=True)
    ambiguity_notes = Column(Text, nullable=True)
    verification_status = Column(String(50), default="Resolved")


class KnowledgeGapRecord(Base):
    __tablename__ = "knowledge_gap_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    botanical_id = Column(String(36), ForeignKey("botanical_entities.id", ondelete="CASCADE"), nullable=False)
    plant_name = Column(String(255), nullable=False)
    traditional_report_count = Column(Integer, default=0)
    in_vitro_count = Column(Integer, default=0)
    in_vivo_count = Column(Integer, default=0)
    clinical_trial_count = Column(Integer, default=0)
    unresolved_identity = Column(Boolean, default=False)
    underrepresented_region = Column(String(255), nullable=True)
    gap_severity = Column(String(50), default="High")  # Critical, High, Moderate, Well-researched
    notes = Column(Text, nullable=True)


class ReviewRecord(Base):
    __tablename__ = "review_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), nullable=False)  # plant_mention, botanical_candidate, evidence_record
    entity_id = Column(String(36), nullable=False)
    reviewer_name = Column(String(100), default="Ethnobotanist Reviewer")
    previous_state = Column(Text, nullable=True)
    updated_state = Column(Text, nullable=True)
    action = Column(String(50), nullable=False)  # approved, rejected, edited
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    license = Column(String(255), nullable=False)
    attribution = Column(Text, nullable=False)
    available_fields = Column(String(500), nullable=False)
    quality_limitations = Column(Text, nullable=True)
    record_count = Column(Integer, default=0)
    last_synced = Column(DateTime, default=utc_now)
