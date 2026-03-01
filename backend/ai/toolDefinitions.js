//File that helps show the API the tools that are available, what to call them, and what parameters it needs (from user)


const tools = [
{
  "name": "calculate",
  "description": "Evaluates a mathematical expression and returns the result. Use this when the user asks you to compute, calculate, or solve any math problem.",
  "parameters": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "The mathematical expression to evaluate, e.g. 'sin(45) + 2**3'"
      }
    },
    "required": ["expression"]
  }
}
]; 

module.exports = tools;



