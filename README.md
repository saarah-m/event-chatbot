# 🎪 Event Planner AI Chatbot

> A conversational AI assistant that helps event planners calculate guest capacity, table configurations, and room layouts — powered by Google Gemini and a custom Python calculator API.

---

## 📐 What It Does

Instead of manually inputting numbers into a calculator, users can simply *talk* to the assistant:

> *"I have a 40x60 foot room. How many 72-inch round tables can I fit, and how many guests will that seat?"*

The AI understands the request, calls the calculator in the background, and responds in plain English.

---

## 🗂 Project Structure

```
event-planner-chatbot/
│
├── frontend/                   # React/Vite app
│   ├── src/
│   │   ├── App.jsx             # Root component — mounts ChatWidget
│   │   ├── ChatWidget.jsx      # Chat UI — messages, input, suggestion chips
│   │   └── index.css           # Global reset (overflow, box-sizing, full height)
│   ├── index.html
│   ├── package.json            # Separate from backend's package.json
│   └── vite.config.js
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

**React (frontend):**
```bash
cd frontend
npm install
```

### 4. Run the project

You'll need **three terminal windows** running simultaneously:

**Terminal 1 — Calculator API:**
```bash
cd calculator
python3 -m uvicorn api:app --reload
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
cd frontend
npm run dev
# opens on http://localhost:5173
```

---

## 🧪 Testing

### Test the calculator API directly:
```bash
curl -X POST http://localhost:8000/calculate-set \
  -H "Content-Type: application/json" \
  -d '{"length_ft": 40, "width_ft": 60, "set_type": "round_72"}'
```

Expected response:
```json
{
  "set_type": "round_72",
  "label": "72\" Round",
  "room_sqft": 2400.0,
  "tables_that_fit": 63,
  "seats_per_table": 10,
  "total_guests": 630
}
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

## 🔒 Security Notes

- Never commit your `config/.env` file — it's listed in `.gitignore`
- The calculator uses `eval()` internally which is safe for internal use, but **do not expose the calculator API publicly** without replacing `eval()` with a safe math parser like `asteval`

---

## 📈 Potential Improvements

- Replace `eval()` with `asteval` or `sympy` for safer math parsing
- Add persistent conversation storage (currently in-memory only)
- Add user authentication
- Deploy calculator API and backend as separate services
- Add more tools (e.g. room layout visualizer, cost estimator)

---

## 📄 License

MIT