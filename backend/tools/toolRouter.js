// toolRouter.js

const CALCULATOR_URL = process.env.CALCULATOR_URL.API; 

async function routeTool(toolName, toolArgs) {
    if (toolName === "calculate") {
        const response = await fetch(`${CALCULATOR_URL}/calculate-set`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression: toolArgs.expression })  // ← dynamic, from the AI
        });
        const data = await response.json();
        return data.result;
    }
}
module.exports = { routeTool };