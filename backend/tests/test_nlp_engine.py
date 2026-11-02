import pytest
from backend.extraction.nlp_engine import MultilingualNLPEngine

def test_multilingual_extraction_english():
    pages = [{
        "page_number": 1,
        "text": "The fresh leaves of Azadirachta indica were prepared as a decoction and administered orally for malarial fever by the Irula community."
    }]
    results = MultilingualNLPEngine.extract_from_pages(pages, source_id="test_doc_01")
    assert len(results) >= 1
    item = results[0]
    assert item.scientific_name == "Azadirachta indica"
    assert item.plant_part == "Leaves"
    assert item.traditional_use == "Fever"
    assert item.preparation_method == "Decoction"
    assert item.administration_route == "Oral"
    assert item.community == "Irula"
    assert "fresh leaves of Azadirachta indica" in item.supporting_passage

def test_multilingual_extraction_tamil_script():
    pages = [{
        "page_number": 2,
        "text": "The traditional healers prepared வேம்பு paste for skin diseases."
    }]
    results = MultilingualNLPEngine.extract_from_pages(pages, source_id="test_doc_02")
    assert len(results) >= 1
    item = results[0]
    assert item.plant_mention == "வேம்பு"
    assert item.scientific_name == "Azadirachta indica"
    assert item.language == "Tamil"
    assert item.transliteration == "Vembu"
