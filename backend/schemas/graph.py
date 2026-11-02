from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # Plant, LocalName, ScientificName, PlantFamily, TraditionalUse, PlantPart, Community, Location, Compound, BiologicalTarget, Publication
    properties: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # REFERS_TO, BELONGS_TO, HAS_PART, DOCUMENTED_FOR, REPORTED_BY, DOCUMENTED_IN, FOUND_IN, CONTAINS_REPORTED, ASSOCIATED_WITH, SUPPORTED_BY
    properties: Dict[str, Any] = {}

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, int] = {}

class GraphQueryRequest(BaseModel):
    cypher: Optional[str] = None
    node_type: Optional[str] = None
    search_term: Optional[str] = None
    limit: int = 100
