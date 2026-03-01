# modified calculator file with fastAPI integrated (for calling functions)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sys
import math

app = FastAPI()

# --- Your original calc() function, unchanged ---

def calc(term):
    term = term.replace(' ', '')
    term = term.replace('^', '**')
    term = term.replace('=', '')
    term = term.replace('?', '')
    term = term.replace('%', '/100.00')
    term = term.replace('rad', 'radians')
    term = term.replace('mod', '%')
    term = term.replace('aval', 'abs')

    functions = ['sin', 'cos', 'tan', 'pow', 'cosh', 'sinh', 'tanh', 'sqrt', 'pi', 'radians', 'e']

    term = term.lower()

    for func in functions:
        if func in term:
            withmath = 'math.' + func
            term = term.replace(func, withmath)

    try:
        term = eval(term)
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Can't divide by 0")
    except NameError:
        raise HTTPException(status_code=400, detail="Invalid input")
    except AttributeError:
        raise HTTPException(status_code=400, detail="Please check usage method")
    except TypeError:
        raise HTTPException(status_code=400, detail="Incorrect datatype")
    except Exception:
        raise HTTPException(status_code=400, detail="Wrong operator")

    return term


# --- New additions below ---

class CalcRequest(BaseModel):     # defines what the incoming JSON should look like
    expression: str               # e.g. { "expression": "sin(45) + 2^3" }

class CalcResponse(BaseModel):    # defines what we send back
    expression: str
    result: float

@app.post("/calculate", response_model=CalcResponse)
def calculate(request: CalcRequest):
    result = calc(request.expression)
    return CalcResponse(expression=request.expression, result=result)