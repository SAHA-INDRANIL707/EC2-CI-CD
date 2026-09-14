"""
Calculator Core Module
Pure Python calculation logic isolated from API layer.
"""

from typing import Union, Tuple


class CalculatorError(Exception):
    """Custom exception for calculation errors."""
    pass


def add(a: float, b: float) -> float:
    """Add two numbers."""
    return a + b


def subtract(a: float, b: float) -> float:
    """Subtract b from a."""
    return a - b


def multiply(a: float, b: float) -> float:
    """Multiply two numbers."""
    return a * b


def divide(a: float, b: float) -> float:
    """Divide a by b. Raises CalculatorError on division by zero."""
    if b == 0:
        raise CalculatorError("Division by zero is not allowed.")
    return a / b


def modulo(a: float, b: float) -> float:
    """Modulo a by b. Raises CalculatorError on modulo by zero."""
    if b == 0:
        raise CalculatorError("Modulo by zero is not allowed.")
    return a % b


def power(a: float, b: float) -> float:
    """Raise a to the power of b. Handles complex results or overflow."""
    try:
        if a < 0 and not b.is_integer():
            raise CalculatorError("Negative base with fractional exponent produces non-real result.")
        result = a ** b
        if isinstance(result, complex):
            raise CalculatorError("Result is a complex number.")
        return float(result)
    except OverflowError:
        raise CalculatorError("Calculation resulted in numerical overflow.")


# Mapping of supported operations
OPERATIONS_MAP = {
    "+": add,
    "add": add,
    "-": subtract,
    "subtract": subtract,
    "*": multiply,
    "multiply": multiply,
    "/": divide,
    "divide": divide,
    "%": modulo,
    "modulo": modulo,
    "^": power,
    "power": power,
}

SYMBOL_MAP = {
    "add": "+",
    "+": "+",
    "subtract": "-",
    "-": "-",
    "multiply": "×",
    "*": "×",
    "divide": "÷",
    "/": "÷",
    "modulo": "%",
    "%": "%",
    "power": "^",
    "^": "^",
}


def calculate(num1: float, num2: float, operation: str) -> Tuple[float, str]:
    """
    Executes the requested mathematical calculation.
    
    Args:
        num1: The first operand
        num2: The second operand
        operation: The mathematical operation (+, -, *, /, %, ^, or names)
        
    Returns:
        Tuple of (calculated_result, formatted_expression)
        
    Raises:
        CalculatorError: If the operation is invalid or calculation fails
    """
    op_key = operation.strip().lower()
    
    if op_key not in OPERATIONS_MAP:
        valid_ops = ", ".join(list(SYMBOL_MAP.keys()))
        raise CalculatorError(f"Unsupported operation '{operation}'. Supported operations: {valid_ops}")
    
    func = OPERATIONS_MAP[op_key]
    result = func(num1, num2)
    
    # Format floating point cleanup (e.g. 5.0 -> 5, 0.1 + 0.2 -> 0.3)
    if isinstance(result, float):
        result = round(result, 10)
        if result.is_integer():
            result = int(result)

    # Format numbers for expression display
    formatted_num1 = int(num1) if isinstance(num1, (int, float)) and float(num1).is_integer() else num1
    formatted_num2 = int(num2) if isinstance(num2, (int, float)) and float(num2).is_integer() else num2
    symbol = SYMBOL_MAP.get(op_key, op_key)
    
    expression = f"{formatted_num1} {symbol} {formatted_num2} = {result}"
    return float(result) if isinstance(result, (int, float)) else result, expression
