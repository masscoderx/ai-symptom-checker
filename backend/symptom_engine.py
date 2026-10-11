import os
import json
import re
from typing import List, Dict, Optional
from groq import AsyncGroq

SYSTEM_PROMPT = """You are MediBot, an empathetic AI medical triage assistant. Your job is to help users understand their symptoms and decide what kind of care they may need.

When a user describes their symptoms, you must respond in the following strict JSON format:
{
  "reply": "<conversational, empathetic reply to the user>",
  "conditions": ["<condition 1>", "<condition 2>", "<condition 3>"],
  "urgency": "<LOW | MODERATE | HIGH | EMERGENCY>",
  "action": "<clear recommended action, e.g. 'Rest at home, stay hydrated' or 'Visit a clinic within 24 hours' or 'Go to the ER immediately'>",
  "disclaimer": "This is not a medical diagnosis. Please consult a licensed healthcare professional for proper evaluation."
}

Urgency levels:
- LOW: Minor symptoms, manageable at home (cold, mild headache, fatigue)
- MODERATE: Symptoms that need attention soon but not urgent (persistent fever, moderate pain)
- HIGH: Symptoms needing prompt medical attention within hours (high fever, severe pain)
- EMERGENCY: Life-threatening symptoms — call 911 or go to the ER immediately (chest pain, difficulty breathing, stroke symptoms)

Rules:
- Always be empathetic and calm.
- Never definitively diagnose — say "possible" or "may suggest".
- Always include the disclaimer in the JSON.
- If the user shares non-medical info, gently redirect to symptoms.
- Consider patient age and gender if provided.
- If symptoms are EMERGENCY, make that extremely clear and urgent.
- Respond ONLY with the JSON object, nothing else."""


URGENCY_COLOR_MAP = {
    "LOW": "green",
    "MODERATE": "yellow",
    "HIGH": "orange",
    "EMERGENCY": "red",
}


class SymptomEngine:
    def __init__(self):
        # Load .env file if present
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip()

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GROQ_API_KEY environment variable not set. "
                "Get a free key at https://console.groq.com"
            )
        self.client = AsyncGroq(api_key=api_key)
        self.model = "openai/gpt-oss-120b"

        # Load knowledge base for cross-reference
        kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.json")
        with open(kb_path, "r") as f:
            self.knowledge_base = json.load(f)

    def _build_context_header(self, age: Optional[int], gender: Optional[str]) -> str:
        parts = []
        if age:
            parts.append(f"Patient age: {age}")
        if gender:
            parts.append(f"Patient gender: {gender}")
        if parts:
            return "Patient profile — " + ", ".join(parts) + ".\n\n"
        return ""

    def _cross_reference_kb(self, symptoms_text: str) -> str:
        """Check knowledge base for matching symptoms and append hints."""
        hints = []
        lower_text = symptoms_text.lower()
        for entry in self.knowledge_base:
            for symptom in entry["symptoms"]:
                if symptom.lower() in lower_text:
                    hints.append(entry["condition"])
                    break
        if hints:
            return f"\n\n[Knowledge base cross-reference: consider {', '.join(hints[:3])}]"
        return ""

    async def triage(
        self,
        messages: List[Dict],
        patient_age: Optional[int] = None,
        patient_gender: Optional[str] = None,
    ) -> Dict:
        context_header = self._build_context_header(patient_age, patient_gender)

        llm_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for i, msg in enumerate(messages):
            content = msg["content"]
            if msg["role"] == "user" and i == 0 and context_header:
                content = context_header + content
            if msg["role"] == "user" and i == len(messages) - 1:
                content += self._cross_reference_kb(content)
            llm_messages.append({"role": msg["role"], "content": content})

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=llm_messages,
            temperature=0.3,
            max_tokens=800,
        )

        raw = response.choices[0].message.content.strip()

        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not json_match:
            raise ValueError(f"LLM did not return valid JSON. Raw: {raw}")

        data = json.loads(json_match.group())

        urgency = data.get("urgency", "LOW").upper()
        return {
            "reply": data.get("reply", ""),
            "conditions": data.get("conditions", []),
            "urgency": urgency,
            "urgency_color": URGENCY_COLOR_MAP.get(urgency, "green"),
            "action": data.get("action", ""),
            "disclaimer": data.get(
                "disclaimer",
                "This is not a medical diagnosis. Please consult a licensed healthcare professional.",
            ),
        }
