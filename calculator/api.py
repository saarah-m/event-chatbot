# api.py
# Event Planning Calculator API
# Wraps event planning logic in a FastAPI endpoint
# Note: spacing/sqft values below are estimates for testing purposes
# and should be replaced with actual formulas

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import math

app = FastAPI()


# ---------------------------------------------------------------
# TABLE CONFIGURATIONS
# Each table type has:
#   - sqft_per_table: how much floor space one table+chairs takes up
#   - default_seats: the default number of seats (matches your dropdown defaults)
# ---------------------------------------------------------------

TABLE_CONFIGS = {
    "theater_reception": {
        "label": "Theater/Reception",
        "sqft_per_guest": 8,        # theater style = no tables, just chairs
        "default_seats": None,      # no seats per table — calculated differently
        "is_theater": True
    },
    "classroom_6x18": {
        "label": "Classroom 6'x18\"",
        "sqft_per_table": 20,       # estimated floor space per table
        "default_seats": 3,
        "is_theater": False
    },
    "classroom_8x18": {
        "label": "Classroom 8'x18\"",
        "sqft_per_table": 24,
        "default_seats": 4,
        "is_theater": False
    },
    "crescent_round_72": {
        "label": "72\" Crescent Round",
        "sqft_per_table": 38,
        "default_seats": 6,
        "is_theater": False
    },
    "round_72": {
        "label": "72\" Round",
        "sqft_per_table": 38,
        "default_seats": 10,
        "is_theater": False
    },
    "crescent_round_66": {
        "label": "66\" Crescent Round",
        "sqft_per_table": 32,
        "default_seats": 4,
        "is_theater": False
    },
    "round_66": {
        "label": "66\" Round",
        "sqft_per_table": 32,
        "default_seats": 8,
        "is_theater": False
    },
    "crescent_round_60": {
        "label": "60\" Crescent Round",
        "sqft_per_table": 28,
        "default_seats": 4,
        "is_theater": False
    },
}


# ---------------------------------------------------------------
# REQUEST / RESPONSE MODELS
# ---------------------------------------------------------------

class RoomRequest(BaseModel):
    length_ft: float                        # room length in feet
    width_ft: float                         # room width in feet
    set_type: str                           # key from TABLE_CONFIGS e.g. "round_72"
    seats_per_table: Optional[int] = None  # override default if provided
    quantity: Optional[int] = None         # if provided, calculate guests for this many tables


class RoomResponse(BaseModel):
    set_type: str
    label: str
    room_sqft: float
    tables_that_fit: int
    seats_per_table: int
    total_guests: int


class ListSetsResponse(BaseModel):
    available_sets: list


# ---------------------------------------------------------------
# CORE CALCULATOR FUNCTIONS
# ---------------------------------------------------------------

def calculate_room_sqft(length: float, width: float) -> float:
    return length * width


def calculate_tables_that_fit(room_sqft: float, sqft_per_table: float) -> int:
    # simple division — your client's real formula may account for
    # walkways, staging areas, etc.
    return math.floor(room_sqft / sqft_per_table)


def calculate_theater_guests(room_sqft: float, sqft_per_guest: float) -> int:
    return math.floor(room_sqft / sqft_per_guest)


# ---------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------

@app.post("/calculate-set", response_model=RoomResponse)
def calculate_set(request: RoomRequest):
    """
    Main endpoint. Given room dimensions and a set/table type,
    returns how many tables fit and how many guests can be seated.
    """

    if request.set_type not in TABLE_CONFIGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown set type: '{request.set_type}'. Call /list-sets to see available options."
        )

    config = TABLE_CONFIGS[request.set_type]
    room_sqft = calculate_room_sqft(request.length_ft, request.width_ft)

    # Theater/Reception is calculated differently — no tables, just chairs
    if config["is_theater"]:
        total_guests = calculate_theater_guests(room_sqft, config["sqft_per_guest"])
        return RoomResponse(
            set_type=request.set_type,
            label=config["label"],
            room_sqft=room_sqft,
            tables_that_fit=0,
            seats_per_table=1,
            total_guests=total_guests
        )

    # Use provided seats_per_table or fall back to default
    seats = request.seats_per_table if request.seats_per_table else config["default_seats"]

    # If quantity is provided, use that instead of calculating how many fit
    if request.quantity:
        tables = request.quantity
    else:
        tables = calculate_tables_that_fit(room_sqft, config["sqft_per_table"])

    total_guests = tables * seats

    return RoomResponse(
        set_type=request.set_type,
        label=config["label"],
        room_sqft=room_sqft,
        tables_that_fit=tables,
        seats_per_table=seats,
        total_guests=total_guests
    )


@app.get("/list-sets", response_model=ListSetsResponse)
def list_sets():
    """
    Returns all available set types so the AI knows what to pass
    as set_type in calculate-set requests.
    """
    sets = [
        {"key": key, "label": val["label"]}
        for key, val in TABLE_CONFIGS.items()
    ]
    return {"available_sets": sets}


@app.get("/")
def root():
    return {"message": "Event Planning Calculator API is running."}

#Version for testing with mathematics
# # modified calculator file with fastAPI integrated (for calling functions)

# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# import sys
# import math

# app = FastAPI()

# # --- Your original calc() function, unchanged ---

# def calc(term):
#     term = term.replace(' ', '')
#     term = term.replace('^', '**')
#     term = term.replace('=', '')
#     term = term.replace('?', '')
#     term = term.replace('%', '/100.00')
#     term = term.replace('rad', 'radians')
#     term = term.replace('mod', '%')
#     term = term.replace('aval', 'abs')

#     functions = ['sin', 'cos', 'tan', 'pow', 'cosh', 'sinh', 'tanh', 'sqrt', 'pi', 'radians', 'e']

#     term = term.lower()

#     for func in functions:
#         if func in term:
#             withmath = 'math.' + func
#             term = term.replace(func, withmath)

#     try:
#         term = eval(term)
#     except ZeroDivisionError:
#         raise HTTPException(status_code=400, detail="Can't divide by 0")
#     except NameError:
#         raise HTTPException(status_code=400, detail="Invalid input")
#     except AttributeError:
#         raise HTTPException(status_code=400, detail="Please check usage method")
#     except TypeError:
#         raise HTTPException(status_code=400, detail="Incorrect datatype")
#     except Exception:
#         raise HTTPException(status_code=400, detail="Wrong operator")

#     return term


# # --- New additions below ---

# class CalcRequest(BaseModel):     # defines what the incoming JSON should look like
#     expression: str               # e.g. { "expression": "sin(45) + 2^3" }

# class CalcResponse(BaseModel):    # defines what we send back
#     expression: str
#     result: float

# @app.post("/calculate", response_model=CalcResponse)
# def calculate(request: CalcRequest):
#     result = calc(request.expression)
#     return CalcResponse(expression=request.expression, result=result)