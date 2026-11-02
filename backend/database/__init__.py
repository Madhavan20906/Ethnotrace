from .connection import Base, engine, SessionLocal, get_db
from .models import (
    Document,
    DocumentPage,
    PlantMention,
    BotanicalEntity,
    LocalName,
    BotanicalCandidate,
    TraditionalUseReport,
    ScientificEvidenceRecord,
    HistoricalTerminologyMapping,
    KnowledgeGapRecord,
    ReviewRecord,
    DataSource,
)

def init_db():
    Base.metadata.create_all(bind=engine)
