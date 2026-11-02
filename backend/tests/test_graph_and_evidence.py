import pytest
from backend.graph.graph_store import EthnoGraphStore
from backend.evidence.classifier import EvidenceClassifier

def test_graph_store_node_and_edge_traversal():
    store = EthnoGraphStore()
    store.add_node("plant_01", "Azadirachta indica", "Plant", {"family": "Meliaceae"})
    store.add_node("use_01", "Malarial fever", "TraditionalUse")
    store.add_edge("edge_01", "plant_01", "use_01", "DOCUMENTED_FOR")

    subgraph = store.get_subgraph("plant_01", depth=1)
    assert len(subgraph["nodes"]) == 2
    assert len(subgraph["edges"]) == 1
    assert subgraph["edges"][0]["type"] == "DOCUMENTED_FOR"

def test_evidence_classification_clinical():
    text = "In a randomized, double-blind, placebo-controlled clinical trial involving 120 patients with acute fever..."
    res = EvidenceClassifier.classify_text(text)
    assert res["evidence_tier"] == "Clinical trials"
    assert res["is_clinical"] is True

def test_evidence_classification_traditional():
    text = "An ethnobotanical field survey was conducted among the indigenous tribal healers who documented traditional recipes..."
    res = EvidenceClassifier.classify_text(text)
    assert res["evidence_tier"] == "Traditional knowledge documentation"
    assert res["is_clinical"] is False
