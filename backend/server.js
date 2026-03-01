require("dotenv").config({ path: "../config/.env" });
const express = require("express");
const cors = require("cors");
const { runAgent } = require("./ai/agent");

const app = express();
app.use(cors());
app.use(express.json());

// Store conversation history per session (simple in-memory version)
const sessions = {};

app.post("/api/chat", async (req, res) => {
    const { message, sessionId } = req.body;

    // Get or create history for this session
    if (!sessions[sessionId]) sessions[sessionId] = [];

    const reply = await runAgent(message, sessions[sessionId]);
    res.json({ reply });
});

app.listen(3000, () => console.log("Server running on port 3000"));