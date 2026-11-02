from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from ..graph.graph_store import graph_store
from ..schemas.graph import GraphDataResponse, GraphQueryRequest

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

@router.get("", response_model=GraphDataResponse)
def get_graph(
    center_node_id: Optional[str] = Query(None, description="Center node ID for ego network expansion"),
    depth: int = Query(1, ge=1, le=3),
    limit: int = Query(150, ge=10, le=500)
):
    subgraph = graph_store.get_subgraph(center_node_id=center_node_id, depth=depth, limit=limit)
    return GraphDataResponse(
        nodes=subgraph["nodes"],
        edges=subgraph["edges"],
        stats=subgraph["stats"]
    )

@router.get("/nodes/{id}")
def get_graph_node(id: str):
    details = graph_store.get_node_details(id)
    if not details:
        raise HTTPException(status_code=404, detail="Graph node not found.")
    return details

@router.get("/relationships")
def get_graph_relationship_summary():
    rel_counts = {}
    for e in graph_store.edges.values():
        t = e["type"]
        rel_counts[t] = rel_counts.get(t, 0) + 1
    return {"relationship_counts": rel_counts, "total_edges": len(graph_store.edges)}

@router.post("/query")
def query_graph(payload: GraphQueryRequest):
    if payload.search_term:
        matches = graph_store.search_graph(payload.search_term, node_type=payload.node_type)
        return {"results": matches, "count": len(matches)}
    return graph_store.get_subgraph(limit=payload.limit)
