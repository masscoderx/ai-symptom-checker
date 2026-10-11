from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from symptom_engine import SymptomEngine
import uvicorn

app = FastAPI(
    title="AI Symptom Checker API",
    description="Chat-based medical symptom triage using LLM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = None

@app.on_event("startup")
async def startup_event():
    global engine
    engine = SymptomEngine()


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    patient_age: int = None
    patient_gender: str = None


class TriageResponse(BaseModel):
    reply: str
    conditions: List[str]
    urgency: str          # LOW | MODERATE | HIGH | EMERGENCY
    urgency_color: str    # green | yellow | orange | red
    action: str
    disclaimer: str


@app.get("/")
def root():
    return {"status": "AI Symptom Checker API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=TriageResponse)
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    last_user_msg = next(
        (m.content for m in reversed(req.messages) if m.role == "user"), None
    )
    if not last_user_msg:
        raise HTTPException(status_code=400, detail="No user message found")

    try:
        result = await engine.triage(
            messages=[m.dict() for m in req.messages],
            patient_age=req.patient_age,
            patient_gender=req.patient_gender,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quick-symptoms")
def quick_symptoms():
    """Return quick-select symptom chips for the UI."""
    return {
        "symptoms": [
            "Headache", "Fever", "Nausea", "Fatigue", "Chest pain",
            "Shortness of breath", "Sore throat", "Cough", "Stomach ache",
            "Dizziness", "Rash", "Back pain", "Joint pain", "Vomiting"
        ]
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
