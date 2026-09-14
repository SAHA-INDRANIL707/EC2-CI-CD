# Distributed Cloud Calculator (Next.js + Python FastAPI + Docker Compose)

A full-stack, microservice-based calculator application built with a **Next.js** frontend and a **Python FastAPI** backend, orchestrated with **Docker Compose**.

---

## 🏗️ Architecture Overview

The system is separated into two independent services:

```
                      ┌───────────────────────────────────────┐
                      │             User Browser              │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
        ┌──────────────────────────────────────────────────────────────────┐
        │                          Docker Network                          │
        │                                                                  │
        │   ┌───────────────────────────┐    REST API (JSON)               │
        │   │     Next.js Frontend      │ ────────────────────┐            │
        │   │       (Port 3000)         │                     │            │
        │   │  • Interactive Keypad     │                     │            │
        │   │  • Live Status & History  │                     ▼            │
        │   │  • Request Inspector      │        ┌───────────────────────┐ │
        │   └───────────────────────────┘        │    Python Backend     │ │
        │                                        │      (Port 8000)      │ │
        │                                        │ • Pure Python Logic   │ │
        │                                        │ • FastAPI Endpoints   │ │
        │                                        │ • Arithmetic Engines  │ │
        │                                        └───────────────────────┘ │
        └──────────────────────────────────────────────────────────────────┘
```

1. **Frontend (`frontend/`)**: Next.js (React) UI. Captures user button clicks or keyboard inputs, displays the current equation, sends `{ num1, num2, operation }` to the Python API, and renders the computed output and JSON payload inspector in real time.
2. **Backend (`backend/`)**: Pure Python FastAPI service (`app/calculator.py` and `app/main.py`). Receives operands, performs pure Python mathematical calculations, and returns `{ result, expression, status }`.
3. **Docker Compose (`docker-compose.yml`)**: Builds both isolated Docker containers, configures inter-service networking, sets up health checks, and starts the entire system with one command.

---

## 🚀 Quick Start (One Command)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose installed.

### Run with Docker Compose
From the root directory:

```bash
docker compose up --build
```

- **Frontend App**: Open [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: Open [http://localhost:8000/health](http://localhost:8000/health)

To stop the containers:
```bash
docker compose down
```

> [!TIP]
> For a complete list of commands (start, stop, rebuild specific services, view logs, clean cache), see [COMMAND.MD](file:///e:/EC2-PROJECT-CICD/COMMAND.MD).

---

## 💻 Local Development (Without Docker)

If you wish to run the services directly on your host machine for development:

### 1. Start Python Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start Next.js Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

Run automated tests for the Python calculation engine:
```bash
cd backend
pytest test_calculator.py
```

---

## 📡 API Specification

### `POST /api/calculate`
**Request Body:**
```json
{
  "num1": 15,
  "num2": 3,
  "operation": "divide"
}
```

**Response:**
```json
{
  "status": "success",
  "result": 5.0,
  "expression": "15 ÷ 3 = 5",
  "num1": 15.0,
  "num2": 3.0,
  "operation": "divide"
}
```

**Supported Operations:**
- Addition: `"+"`, `"add"`
- Subtraction: `"-"`, `"subtract"`
- Multiplication: `="*"`, `"multiply"`
- Division: `"/"`, `"divide"`
- Modulo: `"%""`, `"modulo"`
- Power: `"^"`, `"power"`
