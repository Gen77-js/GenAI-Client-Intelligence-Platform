# GenAI Client Intelligence Platform (Groq-Powered)

An enterprise-grade, evidence-grounded health coaching analytics platform built to automatically analyze multi-day client-coach conversation logs, extract wellness metrics, manage risk flags, and provide structured, hallucination-free insights.

## Project Overview
This application serves as an analytics prototype for health coaching companies. It ingests chat conversations, extracts structured wellness metrics (nutrition, exercise, sleep, water intake, symptoms, stress, mood, engagement), presents findings in an interactive dashboard, and implements a Human-in-the-Loop (HITL) system allowing coaches to edit, approve, or reject AI-generated analysis.

## Problem Statement
Health coaching platforms accumulate thousands of chat logs containing vital client data (sleep patterns, barriers, mood changes, nutrition trends). Manually auditing these chats is time-consuming. However, relying on standard GenAI summaries is risky due to "AI hallucinations"—where the model invents client data or estimates metrics without evidence. This can lead to incorrect coaching strategies and compromised client safety.

## Solution Overview
The **GenAI Client Intelligence Platform** addresses this challenge by combining high-performance text processing with a strict, evidence-grounded prompt strategy using **Groq** and the **llama-3.3-70b-versatile** model. 
Every extracted insight is strictly mapped to an evidence quote, a confidence score, and a classified source tag (`Confirmed Fact`, `Client Reported`, `AI Inference`, or `Missing Information`). If a metric is not mentioned, it is marked as `Not Mentioned` to eliminate fabrications. The dashboard includes interactive charts and a Human-in-the-Loop review panel to verify all data before exporting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite + Tailwind CSS + Lucide Icons |
| **Backend** | Python 3.10+ FastAPI + Uvicorn |
| **AI Engine** | Groq Cloud SDK (`llama-3.3-70b-versatile`) |
| **Text Extraction** | `pdfplumber` (PDF), `python-docx` (DOCX), UTF-8 Decoders (TXT) |
| **Data Visualizer** | Recharts |
| **Export Engines** | jsPDF (PDF reports) & JSON Downloader |

---

## Features
- **Strict Hallucination Control**: Checks and prints `"Not Mentioned"` rather than inventing numbers.
- **Evidence Grounding**: Submits direct quotes for every metric back to the dashboard.
- **Source Classification**: Labels facts as `Confirmed Fact`, `Client Reported`, `AI Inference`, or `Missing Information`.
- **Human-in-the-Loop (HITL) Workflow**: Allows coaches to edit or reject AI-generated fields before exporting.
- **Dynamic Dashboard**: Interactive Radar charts and bar charts mapping wellness domains.
- **Multi-Format Ingestion**: Supports PDF, DOCX, and TXT upload files up to 20MB with real-time progress indicators.
- **Export Capabilities**: Export approved reports as formatted PDF documents or raw JSON.

---

## System Architecture

```
+--------------------------------------------------------+
|                      React Frontend                    |
|  - Ingestion UI  - Recharts Dashboard  - HITL Panel    |
+---------------------------+----------------------------+
                            | HTTP POST /upload & /analyze
                            v
+--------------------------------------------------------+
|                      FastAPI Backend                   |
|  - Main Router   - Pydantic Models   - Text Extractor  |
+---------------------------+----------------------------+
                            | API Requests
                            v
+--------------------------------------------------------+
|                       Groq Cloud                       |
|           (Model: llama-3.3-70b-versatile)             |
+--------------------------------------------------------+
```

---

## Folder Structure

```
genaiintern/
├── backend/
│   ├── main.py                 # FastAPI endpoints & CORS
│   ├── models.py               # Pydantic schemas (HealthResponse, AnalyzeRequest, etc.)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── extractor.py        # PDF/DOCX/TXT text parsing
│   │   └── groq.py             # Groq SDK Integration & System Prompt
│   ├── requirements.txt        # Backend dependencies
│   ├── venv/                   # Python Virtual Environment
│   └── .env                    # Environment secrets (GROQ_API_KEY)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Axios API client
│   │   ├── components/
│   │   │   ├── FileUpload.jsx  # Drag & Drop File Upload with Progress
│   │   │   ├── Dashboard.jsx   # Core analytics layout container
│   │   │   ├── SummaryCards.jsx # High-level summary badges
│   │   │   ├── AnalysisSection.jsx # Core categories editor
│   │   │   ├── EvidencePanel.jsx  # Highlighted citations and source type
│   │   │   ├── ReviewControls.jsx # Approve/Reject status controls
│   │   │   ├── RiskBadges.jsx    # Flagged severity indicators
│   │   │   ├── ExportPanel.jsx   # JSON / PDF Export action buttons
│   │   │   └── Charts.jsx        # Recharts Radar and Bar graphs
│   │   ├── App.jsx             # Main routing & state controller
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Styling system & dark mode theme
│   ├── index.html
│   ├── vite.config.js          # Proxy and port configuration
│   ├── tailwind.config.js
│   └── package.json            # Node dependencies
│
├── .env.example                # Configuration template
└── README.md                   # This file
```

---

## Installation Steps

### Prerequisites
- **Python** (version 3.10 or higher)
- **Node.js** (version 18 or higher)
- **Groq API Key** (Get one at [Groq Console](https://console.groq.com/))

### 1. Clone & Set Up Environment Template
Clone the repository or navigate to the workspace directory:
```bash
cd genaiintern
```

### 2. Configure Environment Variables
Copy the configuration template:
```bash
cp .env.example backend/.env
```
Open `backend/.env` and paste your Groq API key:
```env
GROQ_API_KEY=gsk_...
```

---

## Running Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Uvicorn development server:
   ```bash
   python main.py
   ```
   * The backend will run on **http://localhost:8000**
   * API documentation is accessible at **http://localhost:8000/docs**

---

## Running Frontend

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * The frontend will run on **http://localhost:5173**

---

## Groq API Setup
To set up Groq for this application:
1. Log in to the [Groq Console](https://console.groq.com/).
2. Navigate to **API Keys** and generate a new key.
3. Paste the key under `GROQ_API_KEY` in `backend/.env`.
4. Ensure the backend starts up successfully. The health status badge in the top right of the frontend UI should display **Groq Connected**.

---

## Deployment Instructions

### Backend Deployment (e.g., Render, Railway, AWS EC2)
- Configure the build command: `pip install -r requirements.txt`
- Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set the environment variable: `GROQ_API_KEY` in the environment settings of your hosting provider.

### Frontend Deployment (e.g., Vercel, Netlify, Cloudflare Pages)
- Set the build command: `npm run build`
- Set the output directory: `dist`
- If hosting on a separate domain than the backend, configure `vite.config.js` or set a base URL variable in `frontend/src/api/client.js`.

---

## Future Improvements
- **Multi-file Ingestion**: Merge and compare multiple files across weeks to show client progression charts.
- **Audio Transcript Analysis**: Support direct upload of audio call recordings (.mp3, .wav) with automatic transcription.
- **Custom System Prompts**: Allow coaches to toggle specific analysis categories on/off from the frontend UI.
- **Database Persistence**: Replace in-memory session stores with a SQL/NoSQL database to persist sessions.
