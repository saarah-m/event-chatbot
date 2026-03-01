from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Define a data model for user input
class EventInput(BaseModel):
    square_feet: int
    layout_type: str

@app.post("/calculate")
def calculate(event: EventInput):
    # Your calculation logic here
    capacity = calculate_capacity(event.square_feet, event.layout_type)
    return {"capacity": capacity}

# Run the server (run `uvicorn filename:app --reload` in terminal)