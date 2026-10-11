# 🩺 MediBot — AI Symptom Checker

> A chat-based medical symptom triage app powered by **LLaMA 3** (via Groq) and a structured symptom knowledge base. Built as a CSE mini project.

---

## ✨ Features

- 💬 **Natural language symptom input** — describe how you feel in plain text
- 🧠 **AI-powered triage** — LLaMA 3 (70B) analyzes symptoms with medical reasoning
- 📚 **Knowledge base cross-reference** — 20+ pre-mapped symptom-condition entries
- 🚦 **Urgency scoring** — LOW / MODERATE / HIGH / EMERGENCY with color coding
- 👤 **Patient profile** — age and gender context for better results
- ⚡ **Quick symptom chips** — one-tap common symptoms
- 📄 **PDF report export** — download a session summary
- ⚠️ **Built-in disclaimers** — ethical medical AI guardrails

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Python, FastAPI |
| AI Engine | Groq API (LLaMA 3 70B) — **free tier available** |
| PDF | jsPDF |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- A free **Groq API key** → [console.groq.com](https://console.groq.com)

---

### 1. Backend Setup

```bash
cd ai-symptom-checker/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set your Groq API key
# Copy .env.example to .env and fill in your key
copy .env.example .env
# Edit .env: GROQ_API_KEY=gsk_your_key_here

# Run the server
python main.py
# API runs at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd ai-symptom-checker/frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env

# Run dev server
npm run dev
# App runs at http://localhost:5173
```

---

## 📁 Project Structure

```
ai-symptom-checker/
├── backend/
│   ├── main.py              # FastAPI app, REST endpoints
│   ├── symptom_engine.py    # Groq LLM integration + triage logic
│   ├── knowledge_base.json  # 20+ symptom-condition mappings
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Landing / profile screen
│   │   ├── ChatWindow.jsx   # Chat UI with triage display
│   │   ├── UrgencyBadge.jsx # Color-coded urgency component
│   │   └── reportGenerator.js # PDF export logic
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | Server status |
| POST | `/chat` | Send symptoms, get triage response |
| GET | `/quick-symptoms` | Fetch quick-select symptom chips |

### POST `/chat` — Request Body
```json
{
  "messages": [
    { "role": "user", "content": "I have a bad headache and fever since yesterday" }
  ],
  "patient_age": 25,
  "patient_gender": "female"
}
```

### POST `/chat` — Response
```json
{
  "reply": "I'm sorry to hear you're not feeling well...",
  "conditions": ["Influenza", "Tension Headache", "COVID-19"],
  "urgency": "MODERATE",
  "urgency_color": "yellow",
  "action": "Rest, stay hydrated, take paracetamol. See a doctor if fever persists beyond 3 days.",
  "disclaimer": "This is not a medical diagnosis. Please consult a licensed healthcare professional."
}
```

---

## 🎓 How It Works (Architecture)

```
User Input (React)
      │
      ▼
POST /chat  (FastAPI)
      │
      ├── Knowledge Base cross-reference (JSON lookup)
      │
      └── Groq LLM (LLaMA 3 70B)
              │  System prompt: medical triage instructions
              │  Multi-turn conversation history
              ▼
         Structured JSON response
              │
              ▼
    Triage Card displayed in React
    (Urgency badge + Conditions + Action + Disclaimer)
```

---

## ⚠️ Disclaimer

This project is for **educational purposes only**. MediBot is **not a medical professional** and its outputs should never replace proper medical consultation. Always consult a licensed doctor for health concerns.

---

## 👨‍💻 Built With

- [Groq](https://groq.com) — ultra-fast LLM inference
- [FastAPI](https://fastapi.tiangolo.com) — Python web framework
- [React](https://react.dev) — UI library
- [Tailwind CSS](https://tailwindcss.com) — styling

---

*CSE Mini Project — AI Symptom Checker*
