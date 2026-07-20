"""
Text extraction service for PDF, DOCX, and TXT files.
"""
import io
import pdfplumber
from docx import Document
from typing import Tuple


def extract_text(file_bytes: bytes, filename: str) -> Tuple[str, int, int, int]:
    """
    Extract text from uploaded file.
    Returns: (text, pages, characters, word_count)
    """
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        return _extract_pdf(file_bytes)
    elif ext == "docx":
        return _extract_docx(file_bytes)
    elif ext == "txt":
        return _extract_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_pdf(file_bytes: bytes) -> Tuple[str, int, int, int]:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = len(pdf.pages)
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    text = "\n\n".join(text_parts)
    return text, pages, len(text), len(text.split())


def _extract_docx(file_bytes: bytes) -> Tuple[str, int, int, int]:
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    text = "\n".join(paragraphs)
    # DOCX doesn't have a standard page count; estimate ~500 words/page
    word_count = len(text.split())
    pages = max(1, round(word_count / 500))
    return text, pages, len(text), word_count


def _extract_txt(file_bytes: bytes) -> Tuple[str, int, int, int]:
    text = file_bytes.decode("utf-8", errors="replace")
    word_count = len(text.split())
    pages = max(1, round(word_count / 500))
    return text, pages, len(text), word_count
