// agent.js
require("dotenv").config({ path: "../../config/.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const tools = require("./toolDefinitions");
const systemPrompt = require("./systemPrompt");
const { routeTool } = require("../tools/toolRouter");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runAgent(userMessage, conversationHistory) {

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",    
        systemInstruction: systemPrompt,
        tools: [{
            functionDeclarations: tools   // ← Gemini wraps tools differently
        }]
    });

    // Gemini uses "parts" instead of "content" for messages
    const history = conversationHistory.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",  // ← Gemini says "model" not "assistant"
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });

    // 1. Send user message
    const response = await chat.sendMessage(userMessage);
    const aiMessage = response.response;

    // 2. Did the AI want to use a tool?
    const functionCall = aiMessage.functionCalls()?.[0];

    if (functionCall) {
        const toolName = functionCall.name;
        const toolArgs = functionCall.args;

        // 3. Run the tool through your router
        const toolResult = await routeTool(toolName, toolArgs);

        // 4. Send result back to Gemini
        const finalResponse = await chat.sendMessage([{
            functionResponse: {
                name: toolName,
                response: { result: String(toolResult) }
            }
        }]);

        // 5. Update conversation history
        conversationHistory.push({ role: "user", content: userMessage });
        conversationHistory.push({ role: "assistant", content: finalResponse.response.text() });

        return finalResponse.response.text();
    }

    // No tool needed
    const replyText = aiMessage.text();
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: replyText });

    return replyText;
}

module.exports = { runAgent };