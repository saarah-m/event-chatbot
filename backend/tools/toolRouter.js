// toolRouter.js

async function routeTool(toolName, toolArgs) {
    if (toolName === "calculate") {
        const response = await fetch("http://localhost:8000/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression: toolArgs.expression })  // ← dynamic, from the AI
        });
        const data = await response.json();
        return data.result;
    }
}
module.exports = { routeTool };