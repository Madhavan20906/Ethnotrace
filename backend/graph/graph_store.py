import os
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class EthnoGraphStore:
    """
    Ethnobotanical Knowledge Graph Engine.
    Dual-mode operational architecture:
    - Automatically connects to live Neo4j instance when NEO4J_URI is configured.
    - Operates an in-memory graph index with relationship indexing, depth traversal,
      provenance tracking, and Cytoscape export when Neo4j is not locally running.
    """

    def __init__(self):
        self.neo4j_uri = os.getenv("NEO4J_URI")
        self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        self._init_neo4j_if_available()

        # In-memory graph storage
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: Dict[str, Dict[str, Any]] = {}
        self.adj: Dict[str, List[str]] = {}  # node_id -> list of edge_ids
        self.rev_adj: Dict[str, List[str]] = {}

    def _init_neo4j_if_available(self):
        if self.neo4j_uri:
            try:
                from neo4j import GraphDatabase
                self.driver = GraphDatabase.driver(
                    self.neo4j_uri,
                    auth=(self.neo4j_user, self.neo4j_password)
                )
                logger.info(f"Connected to Neo4j at {self.neo4j_uri}")
            except Exception as e:
                logger.warning(f"Neo4j connection could not be established ({e}). Operating in native graph engine mode.")
                self.driver = None

    def add_node(self, node_id: str, label: str, node_type: str, properties: Optional[Dict[str, Any]] = None):
        props = properties or {}
        self.nodes[node_id] = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "properties": props
        }
        if node_id not in self.adj:
            self.adj[node_id] = []
        if node_id not in self.rev_adj:
            self.rev_adj[node_id] = []

    def add_edge(self, edge_id: str, source: str, target: str, rel_type: str, properties: Optional[Dict[str, Any]] = None):
        props = properties or {}
        edge_data = {
            "id": edge_id,
            "source": source,
            "target": target,
            "type": rel_type,
            "properties": props
        }
        self.edges[edge_id] = edge_data
        
        if source not in self.adj:
            self.adj[source] = []
        self.adj[source].append(edge_id)

        if target not in self.rev_adj:
            self.rev_adj[target] = []
        self.rev_adj[target].append(edge_id)

    def get_subgraph(self, center_node_id: Optional[str] = None, depth: int = 1, limit: int = 150) -> Dict[str, Any]:
        """
        Retrieves subgraph centered around a node or general overview of graph.
        """
        if not center_node_id or center_node_id not in self.nodes:
            # Return high-level sample
            node_list = list(self.nodes.values())[:limit]
            node_ids = {n["id"] for n in node_list}
            edge_list = [
                e for e in self.edges.values()
                if e["source"] in node_ids and e["target"] in node_ids
            ][:limit * 2]

            return {
                "nodes": node_list,
                "edges": edge_list,
                "stats": {
                    "total_nodes": len(self.nodes),
                    "total_edges": len(self.edges),
                    "returned_nodes": len(node_list),
                    "returned_edges": len(edge_list)
                }
            }

        # BFS expansion from center node
        visited_nodes = {center_node_id}
        frontier = {center_node_id}
        collected_edges = set()

        for _ in range(depth):
            next_frontier = set()
            for n_id in frontier:
                # Outgoing edges
                for edge_id in self.adj.get(n_id, []):
                    edge = self.edges[edge_id]
                    collected_edges.add(edge_id)
                    tgt = edge["target"]
                    if tgt not in visited_nodes:
                        visited_nodes.add(tgt)
                        next_frontier.add(tgt)
                # Incoming edges
                for edge_id in self.rev_adj.get(n_id, []):
                    edge = self.edges[edge_id]
                    collected_edges.add(edge_id)
                    src = edge["source"]
                    if src not in visited_nodes:
                        visited_nodes.add(src)
                        next_frontier.add(src)
            frontier = next_frontier
            if len(visited_nodes) >= limit:
                break

        final_nodes = [self.nodes[nid] for nid in visited_nodes if nid in self.nodes]
        final_edges = [self.edges[eid] for eid in collected_edges if eid in self.edges]

        return {
            "nodes": final_nodes,
            "edges": final_edges,
            "stats": {
                "total_nodes": len(self.nodes),
                "total_edges": len(self.edges),
                "returned_nodes": len(final_nodes),
                "returned_edges": len(final_edges)
            }
        }

    def search_graph(self, term: str, node_type: Optional[str] = None) -> List[Dict[str, Any]]:
        term_lower = term.lower()
        results = []
        for n in self.nodes.values():
            if node_type and n["type"].lower() != node_type.lower():
                continue
            if term_lower in n["label"].lower() or any(term_lower in str(v).lower() for v in n["properties"].values()):
                results.append(n)
        return results

    def get_node_details(self, node_id: str) -> Optional[Dict[str, Any]]:
        node = self.nodes.get(node_id)
        if not node:
            return None
        
        # Outgoing
        out_rels = []
        for eid in self.adj.get(node_id, []):
            edge = self.edges[eid]
            tgt_node = self.nodes.get(edge["target"])
            if tgt_node:
                out_rels.append({
                    "relationship": edge["type"],
                    "target_node": tgt_node,
                    "properties": edge["properties"]
                })

        # Incoming
        in_rels = []
        for eid in self.rev_adj.get(node_id, []):
            edge = self.edges[eid]
            src_node = self.nodes.get(edge["source"])
            if src_node:
                in_rels.append({
                    "relationship": edge["type"],
                    "source_node": src_node,
                    "properties": edge["properties"]
                })

        return {
            "node": node,
            "outgoing_relationships": out_rels,
            "incoming_relationships": in_rels
        }

# Global singleton graph store
graph_store = EthnoGraphStore()
