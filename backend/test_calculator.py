import pytest
from fastapi.testclient import TestClient
from app.calculator import calculate, CalculatorError
from app.main import app

client = TestClient(app)


def test_pure_python_addition():
    res, expr = calculate(12, 8, "+")
    assert res == 20.0
    assert "12 + 8 = 20" in expr


def test_pure_python_subtraction():
    res, expr = calculate(25, 10, "-")
    assert res == 15.0


def test_pure_python_multiplication():
    res, expr = calculate(6, 7, "*")
    assert res == 42.0


def test_pure_python_division():
    res, expr = calculate(100, 4, "/")
    assert res == 25.0


def test_pure_python_division_by_zero():
    with pytest.raises(CalculatorError, match="Division by zero"):
        calculate(10, 0, "/")


def test_pure_python_power():
    res, expr = calculate(2, 8, "^")
    assert res == 256.0


def test_pure_python_modulo():
    res, expr = calculate(10, 3, "%")
    assert res == 1.0


def test_api_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_api_calculate_endpoint():
    payload = {
        "num1": 15,
        "num2": 5,
        "operation": "add"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["result"] == 20.0
    assert "15 + 5 = 20" in data["expression"]


def test_api_calculate_division_by_zero():
    payload = {
        "num1": 10,
        "num2": 0,
        "operation": "/"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "Division by zero" in data["detail"]
