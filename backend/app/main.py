"""
FastAPI Backend Application
Exposes calculation endpoints and orchestrates pure Python calculation logic.
"""

from typing import Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.calculator import calculate, CalculatorError, OPERATIONS_MAP

app = FastAPI(
    title="Python Calculator Service",
    description="Microservice providing mathematical computation endpoints for Next.js frontend",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in Docker & local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CalculationRequest(BaseModel):
    """Schema for calculation request."""
    num1: float = Field(..., description="First operand")
    num2: float = Field(..., description="Second operand")
    operation: str = Field(..., description="Operation symbol or name (+, -, *, /, %, ^)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "num1": 42.0,
                "num2": 7.0,
                "operation": "/"
            }
        }
    }


class CalculationResponse(BaseModel):
    """Schema for successful calculation response."""
    status: str = "success"
    result: float
    expression: str
    num1: float
    num2: float
    operation: str


class HealthResponse(BaseModel):
    """Schema for service health check."""
    status: str = "healthy"
    service: str = "calculator-backend"
    version: str = "1.0.0"
    supported_operations: list[str]


@app.get("/", response_model=HealthResponse, tags=["Health"])
@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return HealthResponse(
        status="healthy",
        service="calculator-backend",
        version="1.0.0",
        supported_operations=list(OPERATIONS_MAP.keys())
    )


@app.post("/api/calculate", response_model=CalculationResponse, tags=["Calculator"])
def perform_calculation(req: CalculationRequest):
    """
    Receives calculation operands and operation from the frontend,
    delegates calculation to pure Python calculation module, and returns the result.
    """
    try:
        result, expression = calculate(
            num1=req.num1,
            num2=req.num2,
            operation=req.operation
        )
        return CalculationResponse(
            status="success",
            result=result,
            expression=expression,
            num1=req.num1,
            num2=req.num2,
            operation=req.operation
        )
    except CalculatorError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected server error during calculation: {str(e)}"
        )
