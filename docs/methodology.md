# EthnoTrace Scientific Methodology

## 1. Multilingual Entity Extraction

The NLP extraction pipeline preserves the linguistic integrity of primary sources:
- **No Silent Translation**: Culturally significant local terms (e.g., Tamil *Nilavembu*, Sanskrit *Nimba*, Hindi *Tulsi*) are preserved in their native scripts alongside normalized transliterations.
- **Strict Provenance**: Every entity maintains a foreign key to the originating document, page number, and exact textual sentence.
- **Pydantic Validation**: All extracted records are typed and validated against `ExtractedPlantSchema` before ingestion.

## 2. Botanical Entity Resolution & Ambiguity Handling

Plant names are resolved through a tiered taxonomic matching protocol:
1. **Exact Binomial Matching**: Direct lookup against Kew Plants of the World Online (POWO).
2. **Homotypic & Heterotypic Synonymy**: Resolving outdated names (e.g. *Adhatoda vasica* -> *Justicia adhatoda*, *Ocimum sanctum* -> *Ocimum tenuiflorum*).
3. **Vernacular Dictionary Matching**: Mapping documented vernaculars across languages.
4. **Fuzzy Levenshtein Similarity**: Accounting for spelling variations and transliteration inconsistencies.
5. **Ambiguity Gatekeeping**: When a name is historically shared by multiple distinct taxa (e.g. *Brahmi* referring to *Bacopa monnieri* in North India vs *Centella asiatica* in South India; *Shankhpushpi* referring to *Convolvulus prostratus* vs *Evolvulus alsinoides*), automated species assignment is stopped, flagged, and routed to human expert review.

## 3. Scientific Evidence Classification Tiers

EthnoTrace strictly separates traditional lore from clinical proof across 8 tiers:
1. **Systematic reviews and meta-analyses**
2. **Clinical trials (randomized, double-blind, placebo-controlled)**
3. **Observational human research (cohort & epidemiological)**
4. **Animal-model studies (Wistar rats, murine in vivo)**
5. **In-vivo preclinical research**
6. **In-vitro laboratory research (cell culture assays, IC50, MIC)**
7. **Historical documentation (pre-Linnaean manuscripts)**
8. **Traditional knowledge documentation (field interviews, tribal lore)**

## 4. Contradiction Detection

The system compares traditional claims against experimental reports:
- Claims of non-toxicity are evaluated against cytotoxicity or heavy-metal bioaccumulation reports.
- Claims of psychiatric sedation (e.g., *Rauvolfia serpentina*) are evaluated alongside clinical trial warnings of depression or suicide risks associated with reserpine.
