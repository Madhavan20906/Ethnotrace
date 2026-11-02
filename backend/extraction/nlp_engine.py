import re
from typing import List, Dict, Any, Optional
from ..schemas.extraction import ExtractedPlantSchema

class MultilingualNLPEngine:
    """
    Multilingual Ethnobotanical NLP Engine.
    Detects botanical names (scientific, common, vernacular in Tamil, Hindi, Sanskrit, English),
    anatomical plant parts, traditional medicinal indications, preparations, routes, and communities.
    Strictly preserves provenance, original script, transliteration, and supporting passages.
    """

    # Botanical binomial regex (Genus species or Genus species var./subsp. taxon)
    BINOMIAL_REGEX = re.compile(
        r'\b([A-Z][a-z]{2,20}\s+[a-z]{3,25}(?:\s+(?:var\.|subsp\.|f\.)\s+[a-z]{3,20})?)\b'
    )

    # Multilingual Plant Dictionary (Verified ethnobotanical flora)
    MULTILINGUAL_DICTIONARY = {
        # Azadirachta indica
        "azadirachta indica": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Latin", "translit": "Azadirachta indica"},
        "neem": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "English", "translit": "Neem"},
        "வேம்பு": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Tamil", "translit": "Vembu"},
        "vembu": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Tamil (transliterated)", "translit": "Vembu"},
        "veppam": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Tamil (transliterated)", "translit": "Veppam"},
        "नीम": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Hindi", "translit": "Neem"},
        "nimba": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Sanskrit", "translit": "Nimba"},
        "arishta": {"scientific": "Azadirachta indica", "family": "Meliaceae", "lang": "Sanskrit", "translit": "Arishta"},

        # Ocimum sanctum / tenuiflorum
        "ocimum sanctum": {"scientific": "Ocimum sanctum", "family": "Lamiaceae", "lang": "Latin", "translit": "Ocimum sanctum"},
        "ocimum tenuiflorum": {"scientific": "Ocimum tenuiflorum", "family": "Lamiaceae", "lang": "Latin", "translit": "Ocimum tenuiflorum"},
        "holy basil": {"scientific": "Ocimum tenuiflorum", "family": "Lamiaceae", "lang": "English", "translit": "Holy Basil"},
        "tulsi": {"scientific": "Ocimum tenuiflorum", "family": "Lamiaceae", "lang": "Hindi/English", "translit": "Tulsi"},
        "துளசி": {"scientific": "Ocimum tenuiflorum", "family": "Lamiaceae", "lang": "Tamil", "translit": "Thulasi"},
        "thulasi": {"scientific": "Ocimum tenuiflorum", "family": "Lamiaceae", "lang": "Tamil (transliterated)", "translit": "Thulasi"},
        "तुलसी": {"scientific": "Ocimum tenuiflorum", "family": "Lamiaceae", "lang": "Hindi", "translit": "Tulsi"},

        # Curcuma longa
        "curcuma longa": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "lang": "Latin", "translit": "Curcuma longa"},
        "turmeric": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "lang": "English", "translit": "Turmeric"},
        "மஞ்சள்": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "lang": "Tamil", "translit": "Manjal"},
        "manjal": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "lang": "Tamil (transliterated)", "translit": "Manjal"},
        "हल्दी": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "lang": "Hindi", "translit": "Haldi"},
        "haridra": {"scientific": "Curcuma longa", "family": "Zingiberaceae", "lang": "Sanskrit", "translit": "Haridra"},

        # Withania somnifera
        "withania somnifera": {"scientific": "Withania somnifera", "family": "Solanaceae", "lang": "Latin", "translit": "Withania somnifera"},
        "ashwagandha": {"scientific": "Withania somnifera", "family": "Solanaceae", "lang": "Sanskrit/English", "translit": "Ashwagandha"},
        "அமுக்கரா": {"scientific": "Withania somnifera", "family": "Solanaceae", "lang": "Tamil", "translit": "Amukkara"},
        "amukkara": {"scientific": "Withania somnifera", "family": "Solanaceae", "lang": "Tamil (transliterated)", "translit": "Amukkara"},
        "indian ginseng": {"scientific": "Withania somnifera", "family": "Solanaceae", "lang": "English", "translit": "Indian Ginseng"},
        "अश्वगंधा": {"scientific": "Withania somnifera", "family": "Solanaceae", "lang": "Hindi", "translit": "Ashwagandha"},

        # Andrographis paniculata
        "andrographis paniculata": {"scientific": "Andrographis paniculata", "family": "Acanthaceae", "lang": "Latin", "translit": "Andrographis paniculata"},
        "நிலவேம்பு": {"scientific": "Andrographis paniculata", "family": "Acanthaceae", "lang": "Tamil", "translit": "Nilavembu"},
        "nilavembu": {"scientific": "Andrographis paniculata", "family": "Acanthaceae", "lang": "Tamil (transliterated)", "translit": "Nilavembu"},
        "king of bitters": {"scientific": "Andrographis paniculata", "family": "Acanthaceae", "lang": "English", "translit": "King of Bitters"},
        "kalmegh": {"scientific": "Andrographis paniculata", "family": "Acanthaceae", "lang": "Hindi", "translit": "Kalmegh"},

        # Rauvolfia serpentina
        "rauvolfia serpentina": {"scientific": "Rauvolfia serpentina", "family": "Apocynaceae", "lang": "Latin", "translit": "Rauvolfia serpentina"},
        "sarpagandha": {"scientific": "Rauvolfia serpentina", "family": "Apocynaceae", "lang": "Sanskrit/Hindi", "translit": "Sarpagandha"},
        "சர்ப்பகந்தி": {"scientific": "Rauvolfia serpentina", "family": "Apocynaceae", "lang": "Tamil", "translit": "Sarpagandhi"},
        "snakeroot": {"scientific": "Rauvolfia serpentina", "family": "Apocynaceae", "lang": "English", "translit": "Snakeroot"},

        # Zingiber officinale
        "zingiber officinale": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "lang": "Latin", "translit": "Zingiber officinale"},
        "ginger": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "lang": "English", "translit": "Ginger"},
        "இஞ்சி": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "lang": "Tamil", "translit": "Inji"},
        "சுக்கு": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "lang": "Tamil (dry ginger)", "translit": "Chukku"},
        "adrak": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "lang": "Hindi", "translit": "Adrak"},
        "shunthi": {"scientific": "Zingiber officinale", "family": "Zingiberaceae", "lang": "Sanskrit", "translit": "Shunthi"},

        # Adhatoda vasica / Justicia adhatoda
        "adhatoda vasica": {"scientific": "Justicia adhatoda", "family": "Acanthaceae", "lang": "Latin (synonym)", "translit": "Adhatoda vasica"},
        "justicia adhatoda": {"scientific": "Justicia adhatoda", "family": "Acanthaceae", "lang": "Latin", "translit": "Justicia adhatoda"},
        "ஆடாதோடை": {"scientific": "Justicia adhatoda", "family": "Acanthaceae", "lang": "Tamil", "translit": "Adhatodai"},
        "adathodai": {"scientific": "Justicia adhatoda", "family": "Acanthaceae", "lang": "Tamil (transliterated)", "translit": "Adathodai"},
        "vasaka": {"scientific": "Justicia adhatoda", "family": "Acanthaceae", "lang": "Sanskrit", "translit": "Vasaka"}
    }

    PLANT_PARTS = [
        "leaves", "leaf", "bark", "root", "rhizome", "stem", "seed", "seeds",
        "fruit", "fruits", "flower", "flowers", "whole plant", "gum", "resin",
        "tuber", "aerial parts", "latex", "bulb", "wood"
    ]

    TRADITIONAL_USES = [
        "digestive disorders", "dyspepsia", "indigestion", "fever", "pyrexia", "malaria",
        "cough", "respiratory ailments", "asthma", "bronchitis", "wound healing", "skin diseases",
        "eczema", "psoriasis", "jaundice", "hepatoprotective", "rheumatism", "joint pain",
        "arthritis", "diabetes", "hyperglycemia", "dysentery", "diarrhea", "snakebite",
        "antidote", "headache", "hypertension", "nervous debility", "insomnia", "anti-inflammatory",
        "antibacterial", "ulcer", "gastritis", "piles", "hemorrhoids"
    ]

    PREPARATIONS = [
        "decoction", "paste", "powder", "infusion", "fresh juice", "poultice",
        "maceration", "oil extract", "medicated ghee", "ash (bhasma)", "tablet",
        "extract", "crude extract", "boiled with water"
    ]

    ADMINISTRATIONS = [
        "oral", "topical", "external application", "nasal drops", "ocular",
        "inhalation", "gargle", "local application", "taken with warm milk",
        "taken with honey", "taken with water"
    ]

    COMMUNITIES = [
        "Irula", "Toda", "Kota", "Kurumba", "Kani", "Malayali", "Badaga",
        "Paliyan", "Kadar", "Gond", "Santhal", "Baiga", "Bhil", "Munda",
        "Oraon", "Bhutia", "Lepcha", "Tibetan Amchi", "Siddha Traditional Practitioners",
        "Ayurvedic Vaidyas", "Folk Healers"
    ]

    REGIONS = [
        "Western Ghats", "Eastern Ghats", "Nilgiri Hills", "Tamil Nadu", "Kerala",
        "Karnataka", "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir",
        "Assam", "Arunachal Pradesh", "Sikkim", "Central India", "Himalayan Foothills",
        "Kodaikanal", "Shevaroy Hills", "Kolli Hills", "Anamalai Hills"
    ]

    @classmethod
    def extract_from_pages(cls, pages: List[Dict[str, Any]], source_id: Optional[str] = None) -> List[ExtractedPlantSchema]:
        """
        Processes document pages and returns validated ExtractedPlantSchema instances.
        Each extracted record is tied to its originating page and exact sentence/passage.
        """
        results: List[ExtractedPlantSchema] = []
        seen_keys = set()

        for page in pages:
            page_num = page.get("page_number", 1)
            text = page.get("text", "")
            if not text:
                continue

            # Split into sentences or passages
            sentences = re.split(r'(?<=[.!?])\s+', text)
            
            for sentence in sentences:
                clean_sentence = sentence.strip()
                if len(clean_sentence) < 15:
                    continue

                lower_sent = clean_sentence.lower()

                # 1. Check for dictionary plant mentions (including vernacular / Tamil)
                matched_plant = None
                matched_meta = None
                
                for term, meta in cls.MULTILINGUAL_DICTIONARY.items():
                    if term in lower_sent:
                        matched_plant = term
                        matched_meta = meta
                        break

                # 2. Check for scientific binomial regex if not in dictionary
                if not matched_plant:
                    binomial_match = cls.BINOMIAL_REGEX.search(clean_sentence)
                    if binomial_match:
                        raw_species = binomial_match.group(1)
                        # Filter out common false positives like "Figure 1", "Table 2"
                        if not raw_species.startswith(("Figure", "Table", "Author", "Section", "Chapter")):
                            matched_plant = raw_species
                            matched_meta = {
                                "scientific": raw_species,
                                "family": "Unknown",
                                "lang": "Latin",
                                "translit": raw_species
                            }

                if matched_plant and matched_meta:
                    # Extract associated attributes from the supporting passage
                    # Plant Part
                    part_found = None
                    for p in cls.PLANT_PARTS:
                        if re.search(r'\b' + re.escape(p) + r'\b', lower_sent):
                            part_found = p.capitalize()
                            break

                    # Traditional Use
                    use_found = None
                    for u in cls.TRADITIONAL_USES:
                        if u in lower_sent:
                            use_found = u.capitalize()
                            break

                    # Preparation
                    prep_found = None
                    for pr in cls.PREPARATIONS:
                        if pr in lower_sent:
                            prep_found = pr.capitalize()
                            break

                    # Administration Route
                    admin_found = None
                    for adm in cls.ADMINISTRATIONS:
                        if adm in lower_sent:
                            admin_found = adm.capitalize()
                            break

                    # Community
                    comm_found = None
                    for c in cls.COMMUNITIES:
                        if re.search(r'\b' + re.escape(c) + r'\b', clean_sentence, re.IGNORECASE):
                            comm_found = c
                            break

                    # Location
                    loc_found = None
                    for r in cls.REGIONS:
                        if re.search(r'\b' + re.escape(r) + r'\b', clean_sentence, re.IGNORECASE):
                            loc_found = r
                            break

                    # De-duplicate per page & plant
                    dedup_key = f"{page_num}:{matched_meta['scientific']}:{use_found or 'general'}"
                    if dedup_key in seen_keys:
                        continue
                    seen_keys.add(dedup_key)

                    schema_instance = ExtractedPlantSchema(
                        plant_mention=matched_plant,
                        scientific_name=matched_meta.get("scientific"),
                        plant_part=part_found,
                        traditional_use=use_found,
                        preparation_method=prep_found,
                        administration_route=admin_found,
                        community=comm_found,
                        location=loc_found,
                        language=matched_meta.get("lang", "English"),
                        transliteration=matched_meta.get("translit"),
                        source_id=source_id,
                        page_number=page_num,
                        supporting_passage=clean_sentence,
                        evidence_type="Traditional documentation",
                        validation_status="Pending review"
                    )
                    results.append(schema_instance)

        return results
