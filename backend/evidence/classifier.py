import re
from typing import Dict, Any, List, Optional

class EvidenceClassifier:
    """
    Scientific Evidence Classification and Comparison Engine.
    Distinguishes traditional knowledge documentation from experimental, preclinical, and clinical research.
    Performs contradiction detection and research gap analysis without arbitrary efficacy scoring.
    """

    EVIDENCE_TIERS = [
        "Traditional knowledge documentation",
        "Historical documentation",
        "In-vitro laboratory research",
        "In-vivo preclinical research",
        "Animal-model studies",
        "Observational human research",
        "Clinical trials",
        "Systematic reviews and meta-analyses"
    ]

    # Keyword indicators for evidence tiers
    TIER_INDICATORS = {
        "Systematic reviews and meta-analyses": [
            "systematic review", "meta-analysis", "cochrane", "pooled analysis", "prism statement"
        ],
        "Clinical trials": [
            "randomized controlled trial", "rct", "double-blind", "placebo-controlled",
            "clinical trial", "phase i", "phase ii", "phase iii", "human volunteers", "patients"
        ],
        "Observational human research": [
            "cohort study", "cross-sectional", "case-control", "epidemiological", "survey of patients"
        ],
        "Animal-model studies": [
            "wistar rats", "sprague-dawley", "mice", "murine model", "streptozotocin-induced",
            "in vivo animal", "rodent", "paw edema", "animal ethics"
        ],
        "In-vivo preclinical research": [
            "in vivo", "preclinical assay", "xenograft", "pharmacokinetics", "bioavailability"
        ],
        "In-vitro laboratory research": [
            "in vitro", "cell line", "hela", "raw 264.7", "mcf-7", "ic50", "radical scavenging",
            "dpph", "agar well diffusion", "mic value", "spectrophotometric", "enzyme inhibition"
        ],
        "Historical documentation": [
            "materia medica", "hortus malabaricus", "charaka samhita", "sushruta", "dioscorides",
            "16th century", "17th century", "18th century", "ancient text", "manuscript"
        ],
        "Traditional knowledge documentation": [
            "ethnobotanical survey", "traditional healer", "folk medicine", "indigenous knowledge",
            "tribal community", "informant consensus", "use value", "fidelity level"
        ]
    }

    @classmethod
    def classify_text(cls, text: str) -> Dict[str, Any]:
        """
        Classifies passage or abstract into the appropriate scientific evidence category.
        """
        lower = text.lower()
        matched_tier = "Traditional knowledge documentation"  # default baseline
        confidence = 0.70
        detected_keywords = []

        # Check in descending order of methodological specificity
        for tier, kws in cls.TIER_INDICATORS.items():
            matches = [kw for kw in kws if kw in lower]
            if matches:
                matched_tier = tier
                detected_keywords = matches
                confidence = min(0.98, 0.75 + (len(matches) * 0.08))
                break

        return {
            "evidence_tier": matched_tier,
            "confidence": round(confidence, 2),
            "matched_indicators": detected_keywords,
            "is_clinical": matched_tier in ["Clinical trials", "Systematic reviews and meta-analyses"],
            "is_experimental": matched_tier in ["In-vitro laboratory research", "In-vivo preclinical research", "Animal-model studies"]
        }

    @classmethod
    def compare_claims(cls, traditional_uses: List[str], experimental_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compares documented traditional indications against indexed experimental evidence.
        Identifies areas of concordance, research gaps, and contradictory findings.
        """
        concordant = []
        gaps = []
        contradictions = []

        exp_texts = " ".join([r.get("claim_description", "").lower() for r in experimental_records])

        for use in traditional_uses:
            u_clean = use.lower()
            # Check for keyword matches in experimental literature
            words = [w for w in re.split(r'\W+', u_clean) if len(w) > 3]
            matched = any(w in exp_texts for w in words)
            
            if matched:
                concordant.append(use)
            else:
                gaps.append(use)

        # Check for potential contradictions (e.g. toxicity or inactive reports)
        for rec in experimental_records:
            desc = rec.get("claim_description", "").lower()
            if any(term in desc for term in ["inactive", "no significant effect", "toxic at therapeutic dose", "failed to replicate", "adverse hepatic"]):
                contradictions.append(f"Publication '{rec.get('publication_title')}' noted: {rec.get('claim_description')}")

        rating = "Critical" if len(traditional_uses) > 3 and len(experimental_records) < 2 else (
            "Well-documented" if len(experimental_records) >= 5 else "Moderate"
        )

        return {
            "concordant_indications": concordant,
            "untested_traditional_indications": gaps,
            "contradictions_identified": contradictions,
            "evidence_gap_rating": rating,
            "summary": f"{len(concordant)} documented traditional use(s) have correlating indexed experimental reports; {len(gaps)} use(s) lack indexed laboratory validation in the current repository."
        }
