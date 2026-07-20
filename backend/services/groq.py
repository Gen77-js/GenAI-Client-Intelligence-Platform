"""
Groq API integration for conversation analysis.
Service logic for analyzing conversation content.
"""
import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None

def get_groq_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not configured.")
        _client = Groq(api_key=api_key)
    return _client

SYSTEM_PROMPT = """
You are an expert health coaching intelligence analyst. Your task is to carefully analyze a client-coach conversation and produce a structured JSON report.

STRICT RULES:
1. NEVER invent, estimate, or hallucinate information not explicitly in the conversation.
2. If a metric is not mentioned, set its value to "Not Mentioned".
3. Every insight MUST include direct evidence quoted or paraphrased from the conversation.
4. Every finding MUST include a source_type: one of ["Confirmed Fact", "Client Reported", "AI Inference", "Missing Information"].
5. Confidence scores must be between 0.0 and 1.0. Only set high confidence for explicitly stated facts.
6. The overall_wellness_score should be a string like "72/100" based only on what is explicitly mentioned.
7. Return ONLY valid JSON — no markdown, no explanation, no code fences.

ANALYSIS SCOPE: Analyze ONLY what is explicitly mentioned in the conversation. Do not fill gaps with assumptions.

Produce the following JSON structure exactly:

{
  "weekly_summary": "<2-3 sentence summary of the week based only on the conversation>",
  "nutrition_adherence": {
    "status": "<On Track | Off Track | Partially On Track | Not Mentioned>",
    "confidence": "<0.0-1.0>",
    "evidence": [
      {
        "text": "<direct evidence from conversation>",
        "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>"
      }
    ]
  },
  "exercise": {
    "status": "<Active | Sedentary | Moderate | Not Mentioned>",
    "steps": "<number or 'Not Mentioned'>",
    "evidence": [
      {
        "text": "<direct evidence from conversation>",
        "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>"
      }
    ]
  },
  "sleep": {
    "status": "<Good | Poor | Fair | Not Mentioned>",
    "average": "<hours per night or 'Not Mentioned'>",
    "evidence": [
      {
        "text": "<direct evidence from conversation>",
        "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>"
      }
    ]
  },
  "water_intake": {
    "status": "<Adequate | Inadequate | Not Mentioned>",
    "average": "<liters/day or 'Not Mentioned'>",
    "evidence": [
      {
        "text": "<direct evidence from conversation>",
        "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>"
      }
    ]
  },
  "symptoms": [
    {
      "symptom": "<symptom name>",
      "frequency": "<frequency or 'Not Mentioned'>",
      "severity": "<mild | moderate | severe | Not Mentioned>",
      "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>",
      "evidence": "<direct quote or paraphrase>"
    }
  ],
  "stress": {
    "level": "<Low | Moderate | High | Not Mentioned>",
    "evidence": [
      {
        "text": "<direct evidence from conversation>",
        "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>"
      }
    ]
  },
  "mood": {
    "overall": "<Positive | Neutral | Negative | Mixed | Not Mentioned>",
    "evidence": [
      {
        "text": "<direct evidence from conversation>",
        "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>"
      }
    ]
  },
  "engagement": {
    "level": "<High | Medium | Low | Not Mentioned>",
    "reason": "<brief explanation based on conversation>"
  },
  "key_barriers": [
    {
      "barrier": "<barrier description>",
      "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>",
      "evidence": "<direct quote or paraphrase>"
    }
  ],
  "pending_actions": [
    {
      "action": "<action item>",
      "owner": "<Client | Coach | Both>",
      "priority": "<High | Medium | Low>"
    }
  ],
  "risk_flags": [
    {
      "flag": "<risk description>",
      "severity": "<High | Medium | Low>",
      "source_type": "<Confirmed Fact | Client Reported | AI Inference | Missing Information>",
      "evidence": "<direct quote or paraphrase>"
    }
  ],
  "coach_recommendations": [
    {
      "recommendation": "<recommendation text>",
      "priority": "<High | Medium | Low>",
      "rationale": "<why this is recommended, based only on conversation evidence>"
    }
  ],
  "missing_information": [
    "<description of health-relevant topic not discussed in the conversation>"
  ],
  "overall_wellness_score": "<score/100 based only on available data>",
  "confidence": "<0.0-1.0 overall confidence in analysis>"
}
"""


async def analyze_conversation(text: str) -> dict:
    """Send conversation text to Groq and return structured JSON analysis."""

    user_prompt = (
        "Analyze the following client-coach conversation and return ONLY the JSON analysis. "
        "Do not include any markdown, code blocks, or explanations — return raw JSON only.\n\n"
        f"CONVERSATION:\n---\n{text}\n---"
    )

    response = get_groq_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=8192,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if the model adds them despite instructions
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned invalid JSON: {e}\nRaw response: {raw[:500]}")
