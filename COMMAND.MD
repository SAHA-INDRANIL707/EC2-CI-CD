# 🛠️ Project Commands Cheat Sheet

This guide contains all the essential commands to start, stop, monitor, and update the Next.js Frontend + Python Backend application.

---

## 🚀 1. How to Start the Project

### Start with Docker Compose (Recommended)
Run both the frontend and backend services together in the foreground:
```bash
docker compose up --build
```

### Start in Background (Detached Mode)
Runs the containers in the background so you can continue using your terminal:
```bash
docker compose up -d --build
```

---

## 🛑 2. How to Stop the Project

### Stop If Running in Foreground
Press:
```
Ctrl + C
```

### Stop Background Containers
Stops and removes the running containers and network:
```bash
docker compose down
```

### Stop and Remove Everything (Including Volumes & Cache)
Use this if you want a completely fresh state:
```bash
docker compose down -v --remove-orphans
```

---

## 🔄 3. How to Re-Run After Making Code Changes

Whenever you modify code in either the `frontend/` or `backend/` folder, use these commands to apply your changes:

### A. Rebuild & Restart All Services
```bash
docker compose up --build
```

### B. Rebuild Only Backend (Faster)
If you only changed Python code in `backend/`:
```bash
docker compose up -d --build backend
```

### C. Rebuild Only Frontend (Faster)
If you only changed Next.js code in `frontend/`:
```bash
docker compose up -d --build frontend
```

### D. Restart Containers Without Rebuilding
If no dependencies/dockerfiles were modified:
```bash
docker compose restart
```

---

## 📊 4. Viewing Logs & Debugging

### View Live Logs for All Services
```bash
docker compose logs -f
```

### View Live Logs for Specific Service
```bash
# Python Backend logs only
docker compose logs -f backend

# Next.js Frontend logs only
docker compose logs -f frontend
```

### Check Container Status
```bash
docker compose ps
```

---

## 💻 5. Local Development Commands (Without Docker)

### Python Backend
```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment (Windows)
.\venv\Scripts\activate
# (On macOS/Linux: source venv/bin/activate)

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run development server (Auto-reloads on code changes)
uvicorn app.main:app --reload --port 8000
```

### Next.js Frontend
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run development server (Auto-reloads on code changes)
npm run dev
```

---

## 🧹 6. Troubleshooting & Clean Up

### Force Clean Build (If Docker uses old cached code)
```bash
docker compose build --no-cache
docker compose up
```

### Prune Unused Docker System Data
```bash
docker system prune -f
```

---

## 🌐 Quick URL Reference

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | Interactive Next.js Calculator |
| **Backend Health** | [http://localhost:8000/health](http://localhost:8000/health) | Backend Status Verification |
| **Swagger API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API Testing |
| **ReDoc API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | API Specification Documentation |
