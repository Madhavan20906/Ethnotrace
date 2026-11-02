import pytest
from backend.resolution.botanical_resolver import BotanicalResolver

def test_exact_scientific_resolution():
    res = BotanicalResolver.resolve_name("Azadirachta indica")
    assert res["resolved"] is True
    assert res["accepted_species"]["accepted_scientific_name"] == "Azadirachta indica"
    assert res["accepted_species"]["botanical_family"] == "Meliaceae"
    assert res["is_ambiguous"] is False

def test_synonym_resolution():
    res = BotanicalResolver.resolve_name("Ocimum sanctum")
    assert res["resolved"] is True
    assert res["accepted_species"]["accepted_scientific_name"] == "Ocimum tenuiflorum"
    assert res["is_ambiguous"] is False

def test_vernacular_tamil_resolution():
    res = BotanicalResolver.resolve_name("வேம்பு")
    assert res["resolved"] is True
    assert res["accepted_species"]["accepted_scientific_name"] == "Azadirachta indica"

def test_ambiguous_name_detection():
    # Shankhpushpi and Brahmi must trigger ambiguity flags and pause automated assignment
    res = BotanicalResolver.resolve_name("brahmi")
    assert res["resolved"] is False
    assert res["is_ambiguous"] is True
    assert len(res["candidates"]) >= 2
    candidate_names = [c["candidate_name"] for c in res["candidates"]]
    assert any("Bacopa monnieri" in cn for cn in candidate_names)
    assert any("Centella asiatica" in cn for cn in candidate_names)
