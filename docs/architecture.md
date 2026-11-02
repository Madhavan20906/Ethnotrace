# EthnoTrace Architecture Specification

## Overview

**EthnoTrace** is a full-stack, ambiguity-aware ethnobotanical research intelligence platform engineered for **EthnoHack 2026 (Track 1: Traditional Knowledge Mining)**. It translates unstructured historical manuscripts, regional ethnobotanical surveys, and traditional medicinal lore into structured, scientifically traceable, and verified intelligence.

---

## High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                EthnoTrace UI                                    |
|   (React 19 + TypeScript + Vite + Tailwind CSS + Cytoscape.js + Leaflet Maps)  |
+---------------------------------------------------------------------------------+
                                      |  REST API & WebSockets
                                      v
+---------------------------------------------------------------------------------+
|                              FastAPI Gateway                                    |
|             (Pydantic V2 Schemas + CORS + Background Task Workers)              |
+---------------------------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
+------------------+        +-------------------+        +--------------------+
| Document Engine  |        | NLP Engine        |        | Botanical Resolver |
| (PyMuPDF, docx,  |        | (Multilingual NER,|        | (POWO, Kew MPNS,   |
| CSV, JSON, TXT)  |        | Tamil script,     |        | GBIF taxonomic     |
|                  |        | passage linking)  |        | backbone matching) |
+------------------+        +-------------------+        +--------------------+
         |                            |                            |
         +----------------------------+----------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                       LangGraph-Style Agent Orchestrator                        |
|  (Orchestrator -> DocIntel -> NLP -> Resolution -> Evidence -> Graph -> QA)    |
+---------------------------------------------------------------------------------+
         |                            |                            |
         v                            v                            v
+------------------+        +-------------------+        +--------------------+
| Relational DB    |        | Knowledge Graph   |        | Semantic Index     |
| (PostgreSQL /    |        | (Neo4j / In-Memory|        | (Qdrant / BM25     |
| SQLite Engine)   |        | Cypher Store)     |        | Vector Memory)     |
+------------------+        +-------------------+        +--------------------+
```

---

## Core Modules

1. **Ethnodocument Intelligence**: Drag-and-drop document upload (PDF, DOCX, TXT, CSV, JSON), page segmentation, paragraph boundaries, and source metadata extraction.
2. **Multilingual Ethnobotanical NLP Engine**: Detects botanical binomials, vernacular names (Tamil, Hindi, Sanskrit, English), plant parts, traditional uses, preparations, administration routes, and ethnic communities. Strictly preserves original script and transliteration.
3. **Botanical Entity Resolution Engine**: Resolves plant mentions against Kew Plants of the World Online (POWO), MPNS, and GBIF backbones. Detects homonyms and ambiguities (e.g. *Brahmi*, *Shankhpushpi*) and pauses automated conversion for human review.
4. **Ethnobotanical Knowledge Graph**: True graph store linking `Plant`, `LocalName`, `TraditionalUse`, `PlantPart`, `Compound`, `PlantFamily`, `Community`, `Publication`, and `Evidence`.
5. **Scientific Evidence Intelligence**: Classifies evidence across 8 methodological tiers, detecting contradictions and concordance between traditional claims and clinical trials.
6. **Historical Knowledge Mapper**: Bridges pre-Linnaean terminology (e.g. *Hortus Malabaricus*, *Charaka Samhita*, *Materia Medica*) with accepted taxa.
7. **Knowledge Gap Discovery**: Highlights under-researched traditional remedies and underrepresented regions.
8. **Geographical Ethnobotanical Explorer**: Interactive Leaflet maps rendering spatial provenance while protecting confidential indigenous boundary coordinates.
9. **EthnoTrace Research Copilot**: Zero-hallucination conversational research assistant grounded in exact passage citations, page numbers, and DOIs.
10. **Agentic AI Orchestration**: 8-agent workflow with state checkpoints and human-in-the-loop review.
11. **Human-in-the-Loop Review**: Traceable scientific audit trail distinguishing machine extractions from expert approval.
