if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "../config/.env" });
}
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

const path = require("path");

//needed for deploying a demo version 

// Serve the React frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Handle any other route by returning the React app
app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(process.env.PORT || 3000, () => 
    console.log(`Server running on port ${process.env.PORT || 3000}`)
);