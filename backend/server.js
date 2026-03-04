require("dotenv").config({ path: "../config/.env" });
const express = require("express");
const cors = require("cors");          // ← just once up here
const { runAgent } = require("./ai/agent");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"      // ← replace the old app.use(cors()) with this
}));

app.use(express.json());

// Store conversation history per session (simple in-memory version)
const sessions = {};

app.post("/api/chat", async (req, res) => {
    const { message, sessionId } = req.body;

    if (!sessions[sessionId]) sessions[sessionId] = [];

    try {
        const reply = await runAgent(message, sessions[sessionId]);
        res.json({ reply });
    } catch (err) {
        console.error("Agent error:", err.message);
        res.status(500).json({ reply: "Something went wrong: " + err.message });
    }
});


app.listen(3000, () => console.log("Server running on port 3000"));