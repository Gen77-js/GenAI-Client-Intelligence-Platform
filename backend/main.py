"""
FastAPI backend for GenAI Client Intelligence Platform.
Endpoints: GET /health, POST /upload, POST /analyze
"""
import os
import uuid
import logging
from typing import Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from models import UploadResponse, AnalyzeRequest, AnalyzeResponse, HealthResponse
from services.extractor import extract_text
from services.groq import analyze_conversation

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GenAI Client Intelligence Platform",
    description="AI-powered health coaching conversation analysis using Groq",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (maps session_id -> extracted text)
# For production, replace with Redis or a database.
session_store: Dict[str, str] = {}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if the backend and Groq API key are configured."""
    api_key = os.getenv("GROQ_API_KEY", "")
    return HealthResponse(
        status="ok",
        groq_configured=bool(api_key and api_key != "your_groq_api_key_here"),
    )


@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a conversation file (PDF, DOCX, TXT).
    Extracts text and stores in session. Returns metadata.
    """
    # Validate extension
    ext = file.filename.lower().split(".")[-1] if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file bytes
    file_bytes = await file.read()

    # Validate size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is 20MB.",
        )

    # Extract text
    try:
        text, pages, characters, word_count = extract_text(file_bytes, file.filename)
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        raise HTTPException(status_code=422, detail=f"Could not extract text: {str(e)}")

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="The file appears to be empty or contains no extractable text.",
        )

    # Store in session
    session_id = str(uuid.uuid4())
    session_store[session_id] = text

    logger.info(f"File uploaded: {file.filename}, session={session_id}, pages={pages}, chars={characters}")

    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        pages=pages,
        characters=characters,
        word_count=word_count,
        text_preview=text[:300],
    )


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze the uploaded conversation using Groq.
    Requires a valid session_id from /upload.
    """
    text = session_store.get(request.session_id)
    if not text:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a conversation file first.",
        )

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "your_groq_api_key_here":
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Please set it in backend/.env",
        )

    try:
        logger.info(f"Starting Groq analysis for session={request.session_id}")
        analysis = await analyze_conversation(text)
        logger.info(f"Analysis complete for session={request.session_id}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Groq analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Groq analysis failed: {str(e)}",
        )

    return AnalyzeResponse(session_id=request.session_id, analysis=analysis)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
