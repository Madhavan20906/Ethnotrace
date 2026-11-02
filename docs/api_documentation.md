# EthnoTrace API Documentation

Interactive OpenAPI / Swagger documentation is available at `/docs` when the backend is running.

## Base URL
`/api/v1`

---

## Document Intelligence APIs

### `POST /documents/upload`
Uploads a document (PDF, DOCX, TXT, CSV, JSON) and initiates the autonomous LangGraph extraction pipeline.
- **Request**: Multipart form-data with `file`
- **Response**: `DocumentResponse`

### `GET /documents`
Lists indexed documents with pagination and status filters.
- **Parameters**: `skip` (int), `limit` (int), `status` (str)
- **Response**: List of `DocumentResponse`

### `GET /documents/{id}`
Returns document metadata, page text chunks, and all extracted plant mentions.

### `POST /documents/{id}/process`
Re-runs or retries the autonomous agent pipeline on a failed or updated document.

---

## Botanical Entity Resolution APIs

### `GET /plants`
Retrieves indexed botanical species with taxonomic hierarchy, vernaculars, and counts.
- **Parameters**: `family` (str), `search` (str)

### `GET /plants/{id}`
Returns detailed botanical profile, including POWO/GBIF keys, native range, traditional uses, and connected compounds.

### `POST /plants/resolve`
Real-time entity resolution against POWO & Kew MPNS.
- **Request**: `{ "query": "வேம்பு", "language": "Tamil" }`
- **Response**: `BotanicalResolveResponse` (includes accepted species, candidate taxa, and ambiguity explanation)

---

## Knowledge Graph APIs

### `GET /graph`
Returns nodes and edges in Cytoscape-compatible JSON format.
- **Parameters**: `center_node_id` (str), `depth` (int), `limit` (int)

### `GET /graph/nodes/{id}`
Returns incoming and outgoing relationships for a specific graph node.

---

## Evidence Intelligence APIs

### `GET /evidence`
Lists peer-reviewed evidence records with filters for methodological tiers.

### `GET /evidence/compare`
Compares traditional uses against experimental research for a specific taxon.
- **Parameters**: `botanical_id` (str)

### `GET /evidence/gaps`
Returns research gap matrix comparing traditional usage volume vs indexed clinical trials.

---

## Research Copilot APIs

### `POST /copilot/query`
Conversational RAG assistant query grounded in primary passages and graph links.
- **Request**: `{ "query": "What are the documented medicinal plants in Tamil Nadu for fever?" }`
- **Response**: `CopilotResponse` (direct answer, verified citations with page numbers, related graph nodes, uncertainties)
