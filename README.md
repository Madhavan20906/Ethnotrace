# EthnoTrace

> **Tagline:** From Traditional Knowledge to Scientific Intelligence.  
> **Hackathon:** EthnoHack 2026  
> **Track:** Track 1 — Traditional Knowledge Mining  
> **Product Category:** AI-powered ethnobotanical knowledge extraction, multilingual NLP, botanical entity resolution, scientific knowledge graphs, and evidence intelligence.

---

## 1. Product Vision & Problem Statement

Traditional medicinal knowledge is distributed across historical texts, ethnobotanical publications, regional-language documents, folklore, research articles, and biodiversity databases. Researchers encounter critical challenges:
1. **Taxonomic Ambiguity**: The same regional name refers to multiple distinct botanical species (e.g., *Brahmi* referring to *Bacopa monnieri* in North India vs *Centella asiatica* in South India; *Shankhpushpi* referring to *Convolvulus prostratus* vs *Evolvulus alsinoides*).
2. **Unlinked Evidence**: Traditional medicinal claims are disconnected from modern experimental, preclinical, and clinical research.
3. **Loss of Provenance**: Automated scrapers discard vital preparation methods, ethnic communities, and page-level source references.
4. **Lack of Unified Intelligence**: Researchers lack a cohesive environment to evaluate concordance, contradictions, and knowledge gaps between traditional uses and peer-reviewed trials.

**EthnoTrace** addresses these challenges through a unified, provenance-preserving, ambiguity-aware ethnobotanical research intelligence platform.

---

## 2. Complete Application Modules

1. **Ethnodocument Intelligence**: Drag-and-drop document upload (PDF, DOCX, TXT, CSV, JSON), page segmentation, paragraph boundaries, and source metadata extraction.
2. **Multilingual Ethnobotanical NLP Engine**: Detects botanical binomials, vernacular names in native scripts (Tamil, Hindi, Sanskrit, English), plant parts, traditional uses, preparations, administration routes, and ethnic communities. Strictly preserves original script and transliteration.
3. **Botanical Entity Resolution Engine**: Resolves plant mentions against Kew Plants of the World Online (POWO), MPNS, and GBIF backbones. Detects homonyms and ambiguities, pausing automated conversion for expert human review.
4. **Ethnobotanical Knowledge Graph**: True graph store linking `Plant`, `LocalName`, `TraditionalUse`, `PlantPart`, `Compound`, `PlantFamily`, `Community`, `Publication`, and `Evidence`.
5. **Scientific Evidence Intelligence**: Classifies evidence across 8 methodological tiers, detecting contradictions and concordance between traditional claims and clinical trials.
6. **Historical Knowledge Mapper**: Bridges pre-Linnaean terminology (e.g. *Hortus Malabaricus*, *Charaka Samhita*, *Materia Medica*) with accepted taxa.
7. **Knowledge Gap Discovery**: Highlights under-researched traditional remedies and underrepresented regions.
8. **Geographical Ethnobotanical Explorer**: Interactive Leaflet maps rendering spatial provenance while protecting confidential indigenous boundary coordinates.
9. **EthnoTrace Research Copilot**: Zero-hallucination conversational research assistant grounded in exact passage citations, page numbers, and DOIs.
10. **Agentic AI Orchestration**: 8-agent workflow with state checkpoints and human-in-the-loop review.
11. **Human-in-the-Loop Review**: Traceable scientific audit trail distinguishing machine extractions from expert approval.

---

## 3. Quickstart & Installation Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### Step 1: Clone or Navigate to Directory
```bash
cd D:\ethnotrace
```

### Step 2: Set Up Python Virtual Environment
```bash
python -m venv venv
.\venv\Scripts\pip install -r backend/requirements.txt
# Or run with the pre-installed packages in venv:
# fastapi, uvicorn, pydantic, sqlalchemy, pymupdf, python-docx, httpx, pytest
```

### Step 3: Build the Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 4: Run the Backend & Application Server
```bash
.\venv\Scripts\python -m backend.main
```
The application will start on: **`http://127.0.0.1:8000`**  
- **Web Research Workspace**: `http://127.0.0.1:8000/`
- **Interactive OpenAPI / Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Backend Health Check**: `http://127.0.0.1:8000/health`

*(Optional)* For frontend development with Hot Module Replacement (HMR):
```bash
cd frontend
npm run dev
# Accessible at http://localhost:5173 (proxies /api to 8000)
```

---

## 4. Running Automated Tests

To run the complete test suite verifying botanical resolution, multilingual NLP extraction, knowledge graph traversal, and evidence tier classification:

```bash
cd D:\ethnotrace
.\venv\Scripts\python -m pytest backend/tests -v
```

**Results:**
- `test_exact_scientific_resolution`: PASSED
- `test_synonym_resolution`: PASSED
- `test_vernacular_tamil_resolution`: PASSED
- `test_ambiguous_name_detection`: PASSED
- `test_graph_store_node_and_edge_traversal`: PASSED
- `test_evidence_classification_clinical`: PASSED
- `test_evidence_classification_traditional`: PASSED
- `test_multilingual_extraction_english`: PASSED
- `test_multilingual_extraction_tamil_script`: PASSED

---

## 5. Repository Structure

```
D:\ethnotrace/
├── backend/
│   ├── api/             # REST API routers (documents, botanical, graph, evidence, copilot, sources)
│   ├── database/        # SQLAlchemy models and connection
│   ├── schemas/         # Pydantic V2 validation schemas
│   ├── extraction/      # PyMuPDF parser and Multilingual NLP engine
│   ├── resolution/      # POWO/GBIF/MPNS botanical resolver
│   ├── evidence/        # Evidence classifier and claim comparison
│   ├── graph/           # Neo4j and native graph store
│   ├── retrieval/       # Semantic index and Research Copilot RAG service
│   ├── agents/          # LangGraph-style agentic orchestrator
│   ├── services/        # Preloaded authentic scientific dataset loader
│   ├── tests/           # Automated pytest suite
│   └── main.py          # FastAPI application entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Navigation sidebar and UI elements
│   │   ├── pages/       # 11 Research modules and Product Landing Page
│   │   ├── services/    # Typed API client
│   │   └── types/       # TypeScript interfaces
│   ├── dist/            # Production built web bundle
│   └── package.json
├── data/samples/        # Attributed sample ethnobotanical publications
├── docs/                # Architecture, methodology, limitations, and API docs
├── docker-compose.yml   # Multi-service container orchestration
└── README.md
```

---

## 6. Scientific Attributions & License Compliance

EthnoTrace complies with attribution requirements for open biodiversity databases:
- **Kew Plants of the World Online (POWO)** (CC BY 3.0)
- **Kew Medicinal Plant Names Services (MPNS)** (Kew Scientific Licensing)
- **Global Biodiversity Information Facility (GBIF)** (CC0 / CC BY 4.0)
- **PubMed Central / NCBI E-Utilities** (Public Domain)
- **Indian Himalayan Ethnobotanical Dataset** (Dryad Data Repository, CC0 1.0)
"# Ethnotrace" 
