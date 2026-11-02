import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..extraction.document_parser import DocumentParser
from ..extraction.nlp_engine import MultilingualNLPEngine
from ..resolution.botanical_resolver import BotanicalResolver
from ..evidence.classifier import EvidenceClassifier
from ..graph.graph_store import graph_store
from ..retrieval.semantic_index import semantic_index
from ..database.models import (
    Document, DocumentPage, PlantMention, BotanicalCandidate,
    ReviewRecord
)

logger = logging.getLogger(__name__)

class WorkflowState:
    def __init__(self, document_id: str, file_path: str, filename: str):
        self.document_id = document_id
        self.file_path = file_path
        self.filename = filename
        self.status = "initialized"
        self.parsed_pages: List[Dict[str, Any]] = []
        self.extracted_mentions: List[Any] = []
        self.resolved_entities: List[Dict[str, Any]] = []
        self.graph_nodes_created = 0
        self.graph_edges_created = 0
        self.requires_human_review = False
        self.review_reasons: List[str] = []
        self.logs: List[str] = []

    def log(self, message: str):
        timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        self.logs.append(entry)
        logger.info(entry)


class EthnoTraceOrchestrator:
    """
    LangGraph-style Agentic AI Orchestrator.
    Executes a structured 8-agent scientific extraction and validation pipeline:
    Orchestrator -> Document Intelligence -> NLP Extraction -> Botanical Resolution ->
    Evidence Classification -> Knowledge Graph Construction -> Research Indexing -> Quality Assurance.
    """

    @classmethod
    def execute_pipeline(cls, state: WorkflowState, db: Session) -> WorkflowState:
        state.log("Commencing EthnoTrace Agentic Pipeline execution.")

        try:
            # 1. Document Intelligence Agent
            cls._agent_document_intelligence(state, db)

            # 2. NLP Extraction Agent
            cls._agent_nlp_extraction(state, db)

            # 3. Botanical Resolution Agent
            cls._agent_botanical_resolution(state, db)

            # 4. Evidence Classification Agent
            cls._agent_evidence_classification(state)

            # 5. Knowledge Graph Agent
            cls._agent_knowledge_graph(state)

            # 6. Research Retrieval & Indexing Agent
            cls._agent_research_retrieval(state)

            # 7. Quality Assurance & HITL Gatekeeper Agent
            cls._agent_quality_assurance(state, db)

            state.status = "completed"
            state.log("Pipeline successfully completed with full provenance preservation.")

            # Update document status in DB
            doc_rec = db.query(Document).filter(Document.id == state.document_id).first()
            if doc_rec:
                doc_rec.processing_status = "completed"
                db.commit()

        except Exception as e:
            state.status = "failed"
            state.log(f"Pipeline error: {str(e)}")
            doc_rec = db.query(Document).filter(Document.id == state.document_id).first()
            if doc_rec:
                doc_rec.processing_status = "failed"
                doc_rec.error_message = str(e)
                db.commit()

        return state

    @classmethod
    def _agent_document_intelligence(cls, state: WorkflowState, db: Session):
        state.log("Agent [Document Intelligence]: Ingesting document and segmenting pages.")
        parsed = DocumentParser.parse_file(state.file_path, state.filename)
        state.parsed_pages = parsed["pages"]
        
        doc_rec = db.query(Document).filter(Document.id == state.document_id).first()
        if doc_rec:
            doc_rec.extracted_text = parsed["total_text"]
            if parsed["metadata"].get("title"):
                doc_rec.title = parsed["metadata"]["title"]
            if parsed["metadata"].get("author"):
                doc_rec.authors = parsed["metadata"]["author"]

            # Save pages
            for p in state.parsed_pages:
                page_entry = DocumentPage(
                    document_id=state.document_id,
                    page_number=p["page_number"],
                    text=p["text"],
                    paragraph_count=p["paragraph_count"]
                )
                db.add(page_entry)
            db.commit()

        state.log(f"Agent [Document Intelligence]: Extracted {len(state.parsed_pages)} page(s) and {len(parsed['total_text'])} characters.")

    @classmethod
    def _agent_nlp_extraction(cls, state: WorkflowState, db: Session):
        state.log("Agent [NLP Extraction]: Running multilingual ethnobotanical entity recognition.")
        extracted = MultilingualNLPEngine.extract_from_pages(state.parsed_pages, source_id=state.document_id)
        state.extracted_mentions = extracted
        state.log(f"Agent [NLP Extraction]: Discovered {len(extracted)} candidate botanical mentions.")

        # Persist extracted mentions
        for em in extracted:
            mention_rec = PlantMention(
                document_id=state.document_id,
                page_number=em.page_number,
                raw_mention=em.plant_mention,
                scientific_name=em.scientific_name,
                plant_part=em.plant_part,
                traditional_use=em.traditional_use,
                preparation_method=em.preparation_method,
                administration_route=em.administration_route,
                community=em.community,
                location=em.location,
                language=em.language,
                transliteration=em.transliteration,
                supporting_passage=em.supporting_passage,
                evidence_type=em.evidence_type,
                validation_status=em.validation_status
            )
            db.add(mention_rec)
        db.commit()

    @classmethod
    def _agent_botanical_resolution(cls, state: WorkflowState, db: Session):
        state.log("Agent [Botanical Resolution]: Resolving mentions against POWO/GBIF backbone.")
        for em in state.extracted_mentions:
            term = em.scientific_name or em.plant_mention
            res = BotanicalResolver.resolve_name(term, language=em.language)
            state.resolved_entities.append({
                "mention": em,
                "resolution": res
            })

            # Check for ambiguity
            if res.get("is_ambiguous"):
                state.requires_human_review = True
                state.review_reasons.append(f"Ambiguous botanical entity '{term}' detected.")

    @classmethod
    def _agent_evidence_classification(cls, state: WorkflowState):
        state.log("Agent [Evidence Classification]: Evaluating methodological tiers of supporting passages.")
        for item in state.resolved_entities:
            em = item["mention"]
            classification = EvidenceClassifier.classify_text(em.supporting_passage)
            item["evidence_classification"] = classification

    @classmethod
    def _agent_knowledge_graph(cls, state: WorkflowState):
        state.log("Agent [Knowledge Graph]: Updating graph topology with provenance edges.")
        for item in state.resolved_entities:
            em = item["mention"]
            res = item["resolution"]
            species = res.get("accepted_species")

            if species:
                plant_id = f"plant_{species['accepted_scientific_name'].replace(' ', '_').lower()}"
                graph_store.add_node(
                    plant_id,
                    species["accepted_scientific_name"],
                    "Plant",
                    {"family": species["botanical_family"], "powo_id": species.get("powo_id")}
                )

                # Local Name node
                local_id = f"local_{em.plant_mention.replace(' ', '_').lower()}"
                graph_store.add_node(
                    local_id,
                    em.plant_mention,
                    "LocalName",
                    {"language": em.language, "transliteration": em.transliteration}
                )
                graph_store.add_edge(f"edge_{local_id}_refers_{plant_id}", local_id, plant_id, "REFERS_TO")

                # Traditional Use node
                if em.traditional_use:
                    use_id = f"use_{em.traditional_use.replace(' ', '_').lower()}"
                    graph_store.add_node(use_id, em.traditional_use, "TraditionalUse")
                    graph_store.add_edge(f"edge_{plant_id}_use_{use_id}", plant_id, use_id, "DOCUMENTED_FOR")

                # Plant Part
                if em.plant_part:
                    part_id = f"part_{em.plant_part.lower()}"
                    graph_store.add_node(part_id, em.plant_part, "PlantPart")
                    graph_store.add_edge(f"edge_{plant_id}_part_{part_id}", plant_id, part_id, "HAS_PART")

                state.graph_nodes_created += 2
                state.graph_edges_created += 2

    @classmethod
    def _agent_research_retrieval(cls, state: WorkflowState):
        state.log("Agent [Research Retrieval]: Indexing passages into semantic retrieval memory.")
        for item in state.resolved_entities:
            em = item["mention"]
            res = item["resolution"]
            species = res.get("accepted_species")
            sci = species.get("accepted_scientific_name") if isinstance(species, dict) else (em.scientific_name or em.plant_mention)
            
            semantic_index.add_passage(
                passage_id=f"{state.document_id}_p{em.page_number}_{em.plant_mention}",
                text=em.supporting_passage,
                metadata={
                    "document_id": state.document_id,
                    "page_number": em.page_number,
                    "source_title": state.filename,
                    "plant_mention": em.plant_mention,
                    "scientific_name": sci,
                    "evidence_tier": em.evidence_type,
                    "identity_confidence": "Verified" if not res.get("is_ambiguous") else "Provisional"
                }
            )

    @classmethod
    def _agent_quality_assurance(cls, state: WorkflowState, db: Session):
        state.log("Agent [Quality Assurance]: Auditing extraction confidence and data integrity.")
        if state.requires_human_review:
            state.log(f"Agent [QA]: Gatekeeper triggered Human-in-the-Loop review for {len(state.review_reasons)} item(s).")
            # Create review record in DB
            for reason in state.review_reasons:
                rev = ReviewRecord(
                    entity_type="plant_mention",
                    entity_id=state.document_id,
                    reviewer_name="System QA Gatekeeper",
                    previous_state="Unreviewed",
                    updated_state="Pending Review",
                    action="flagged",
                    comments=reason
                )
                db.add(rev)
            db.commit()
        else:
            state.log("Agent [QA]: All entities cleared validation thresholds.")
