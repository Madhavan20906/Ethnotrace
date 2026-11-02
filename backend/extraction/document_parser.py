import os
import json
import csv
from typing import List, Dict, Any, Optional

try:
    import pymupdf  # PyMuPDF
except ImportError:
    try:
        import fitz as pymupdf
    except ImportError:
        pymupdf = None

try:
    import docx
except ImportError:
    docx = None

class DocumentParser:
    """
    Robust ethnobotanical document ingestion service.
    Extracts structured page-level text, paragraph bounds, and metadata from PDF, DOCX, TXT, CSV, JSON.
    Maintains strict source provenance for scientific auditing.
    """

    @staticmethod
    def parse_file(file_path: str, original_filename: str) -> Dict[str, Any]:
        ext = os.path.splitext(original_filename)[1].lower()
        if ext == ".pdf":
            return DocumentParser._parse_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return DocumentParser._parse_docx(file_path)
        elif ext == ".csv":
            return DocumentParser._parse_csv(file_path)
        elif ext == ".json":
            return DocumentParser._parse_json(file_path)
        else:
            return DocumentParser._parse_txt(file_path)

    @staticmethod
    def _parse_pdf(file_path: str) -> Dict[str, Any]:
        if not pymupdf:
            # Fallback if pymupdf not present
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
            return {
                "pages": [{"page_number": 1, "text": raw, "paragraph_count": len(raw.split("\n\n"))}],
                "total_text": raw,
                "ocr_performed": False,
                "metadata": {"title": None, "author": None}
            }

        doc = pymupdf.open(file_path)
        pages_data = []
        total_text_parts = []
        meta = doc.metadata or {}

        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            
            # Paragraph segmentation
            paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
            if not paragraphs and page_text:
                paragraphs = [page_text]

            pages_data.append({
                "page_number": page_idx + 1,
                "text": page_text,
                "paragraph_count": len(paragraphs)
            })
            total_text_parts.append(page_text)

        doc.close()
        full_text = "\n\n--- PAGE BREAK ---\n\n".join(total_text_parts)
        return {
            "pages": pages_data,
            "total_text": full_text,
            "ocr_performed": False,  # Explicitly preserve honesty as required by specification
            "metadata": {
                "title": meta.get("title") or None,
                "author": meta.get("author") or None,
                "year": None
            }
        }

    @staticmethod
    def _parse_docx(file_path: str) -> Dict[str, Any]:
        if not docx:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
            return {"pages": [{"page_number": 1, "text": raw, "paragraph_count": 1}], "total_text": raw, "ocr_performed": False, "metadata": {}}

        doc = docx.Document(file_path)
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        
        # Approximate 500 words per page for DOCX
        words = full_text.split()
        page_size = 500
        pages_data = []
        
        if not words:
            pages_data.append({"page_number": 1, "text": "", "paragraph_count": 0})
        else:
            for i in range(0, len(words), page_size):
                chunk = " ".join(words[i:i + page_size])
                pages_data.append({
                    "page_number": (i // page_size) + 1,
                    "text": chunk,
                    "paragraph_count": max(1, len(chunk.split("\n\n")))
                })

        return {
            "pages": pages_data,
            "total_text": full_text,
            "ocr_performed": False,
            "metadata": {"title": None, "author": None, "year": None}
        }

    @staticmethod
    def _parse_txt(file_path: str) -> Dict[str, Any]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw = f.read()
        
        paragraphs = [p.strip() for p in raw.split("\n\n") if p.strip()]
        return {
            "pages": [{"page_number": 1, "text": raw, "paragraph_count": max(1, len(paragraphs))}],
            "total_text": raw,
            "ocr_performed": False,
            "metadata": {"title": None, "author": None, "year": None}
        }

    @staticmethod
    def _parse_csv(file_path: str) -> Dict[str, Any]:
        rows_text = []
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            for row in reader:
                rows_text.append(" | ".join(row))
        full_text = "\n".join(rows_text)
        return {
            "pages": [{"page_number": 1, "text": full_text, "paragraph_count": len(rows_text)}],
            "total_text": full_text,
            "ocr_performed": False,
            "metadata": {"title": os.path.basename(file_path), "author": None, "year": None}
        }

    @staticmethod
    def _parse_json(file_path: str) -> Dict[str, Any]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            data = json.load(f)
        full_text = json.dumps(data, indent=2, ensure_ascii=False)
        return {
            "pages": [{"page_number": 1, "text": full_text, "paragraph_count": len(data) if isinstance(data, list) else 1}],
            "total_text": full_text,
            "ocr_performed": False,
            "metadata": {"title": os.path.basename(file_path), "author": None, "year": None}
        }
