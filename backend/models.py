"""
Pydantic models for request/response schemas.
"""
from pydantic import BaseModel
from typing import Any, Optional


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    pages: int
    characters: int
    word_count: int
    text_preview: str  # first 300 chars


class AnalyzeRequest(BaseModel):
    session_id: str


class AnalyzeResponse(BaseModel):
    session_id: str
    analysis: dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    groq_configured: bool
