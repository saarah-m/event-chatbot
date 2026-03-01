# 🎪 Version One of Event-Chatbot AI

> A conversational AI assistant that helps event planners calculate guest capacity, table configurations, and room layouts — powered by Google Gemini and a custom Python calculator API.


---

# Ideal End Product

Instead of manually inputting numbers into a calculator, users can simply *talk* to the assistant:

> *"I have a 40x60 foot room. How many 72-inch round tables can I fit, and how many guests will that seat?"*

The AI understands the request, calls the calculator in the background, and responds in plain English.

---

## Current TO-DO

* Currently working with a mathematical logic calculator (rather than event based one), needs to be fixed 
* Frontend UI needs to be updated 
* Needs to be styled 
* If testing with mathemaic logic: need to replace event prompts and function 
* If testing with event planning logic: need to replace mathematical logic



## 🗂 Project Structure

```
event-planner-chatbot/
│
├── frontend/
│   ├── index.html          # Chat UI shell
│   ├── chat-widget.js      # Sends/receives messages, renders chat bubbles
│   └── styles.css          # Chat widget styling
│
├── backend/
│   ├── server.js           # Express server — receives messages from frontend
│   ├── ai/
│   │   ├── agent.js            # Core AI loop — talks to Gemini, handles tool calls
│   │   ├── systemPrompt.js     # Defines the AI's personality and behavior
│   │   └── toolDefinitions.js  # Describes available calculator tools to the AI
│   └── tools/
│       └── toolRouter.js       # Routes AI tool calls to the correct function
│
├── calculator/
│   └── api.py              # FastAPI wrapper around the core calculator logic
│
├── config/
│   └── .env                # API keys and environment variables (never commit this)
│
├── tests/
│   ├── tools.test.js
│   └── agent.test.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ How It Works

```
User types a message
        ↓
  chat-widget.js        → POST /api/chat → server.js
        ↓
  agent.js              → sends message + history to Gemini API
        ↓
  Gemini picks a tool   → toolDefinitions.js (the AI's "menu" of tools)
        ↓
  toolRouter.js         → calls the right function
        ↓
  calculator/api.py     → runs the math, returns result
        ↓
  Gemini formulates     → natural language response
        ↓
  User sees the answer
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.8+
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/event-planner-chatbot.git
cd event-planner-chatbot
```

### 2. Set up environment variables

Create `config/.env`:

```
GEMINI_API_KEY=your-key-here
CALCULATOR_API_URL=http://localhost:8000
PORT=3000
```

### 3. Install dependencies

**Python (calculator API):**
```bash
pip install fastapi uvicorn
```

**Node.js (backend):**
```bash
cd backend
npm install
```

### 4. Run the project

You'll need **three terminal windows** running simultaneously:

**Terminal 1 — Calculator API:**
```bash
cd calculator
uvicorn api:app --reload
# runs on http://localhost:8000
```

**Terminal 2 — Chatbot Backend:**
```bash
cd backend
node server.js
# runs on http://localhost:3000
```

**Terminal 3 — Frontend:**
```bash
open frontend/index.html
# or: npx serve frontend
```

---

## 🧪 Testing

### Test the calculator API directly:
```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "2+2"}'
```

Expected response:
```json
{ "expression": "2+2", "result": 4.0 }
```

### Test the chatbot backend directly:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "what is 10 times 25?", "sessionId": "test123"}'
```

Expected response:
```json
{ "reply": "10 times 25 equals 250!" }
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| AI Model | Google Gemini 2.0 Flash |
| Backend | Node.js + Express |
| Calculator API | Python + FastAPI |
| Frontend | Vanilla HTML/CSS/JS |
| Environment | dotenv |

---
