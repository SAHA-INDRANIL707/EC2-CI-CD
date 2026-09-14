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
uvicorn app.main:app --reload --port 3001
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

## 🔐 7. Required GitHub Secrets for CI/CD

Go to **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

| Secret Name | Description / Example Value |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username (e.g. `indranilsaha707`) |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token (Generated under Docker Hub Account Settings -> Security) |
| `EC2_HOST` | Public IPv4 Address or Public DNS of your EC2 instance (e.g. `54.210.12.34`) |
| `EC2_USER` | EC2 SSH username (`ubuntu` for Ubuntu AMI, or `ec2-user` for Amazon Linux) |
| `EC2_SSH_KEY` | Entire raw contents of your `.pem` private key file (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) |

---

## 🏷️ 8. Published Docker Image Names

Your CI/CD workflow automatically builds and publishes the following images to Docker Hub:

- **Backend API**: `<your-dockerhub-username>/calculator-backend:latest`
- **Frontend UI**: `<your-dockerhub-username>/calculator-frontend:latest`

In your EC2 server, they are orchestrated via [docker-compose.prod.yml](file:///e:/EC2-PROJECT-CICD/docker-compose.prod.yml).

---

## 🌐 Quick URL Reference

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | Interactive Next.js Calculator |
| **Backend Health** | [http://localhost:3001/health](http://localhost:3001/health) | Backend Status Verification |
| **Swagger API Docs** | [http://localhost:3001/docs](http://localhost:3001/docs) | Interactive API Testing |
| **ReDoc API Docs** | [http://localhost:3001/redoc](http://localhost:3001/redoc) | API Specification Documentation |
