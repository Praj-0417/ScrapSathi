# ♻️ ScrapSaathi – Smart Waste & E-Waste Collection Platform

**ScrapSaathi** is a modern, full-stack web platform designed to streamline the process of waste and e-waste collection. It connects households, commercial enterprises, waste collectors, and administrators in an eco-conscious ecosystem that promotes recycling, donation, and sustainability. 🌱

---

> ⚠️ **IMPORTANT NOTICE REGARDING LIVE DEMO**:  
> The currently deployed site at **[scrap-sathi.vercel.app](https://scrap-sathi.vercel.app)** is a **previously hosted legacy build and does NOT reflect the current state of the application**.  
> The platform has recently undergone major architectural refactoring (layered service-repository backend, dynamic scrap pricing, collector route tracking, and modern UI revamps). An updated production deployment is currently in progress. To view and test the latest features, please run the project locally using the setup instructions below.

---

## 🚀 Key Features

### 👤 User & Commercial Experience
- **Doorstep Scrap Pickups**: Book pickups for E-waste, Metal, Paper, Plastic, Vehicles, and Appliances.
- **Dynamic Scrap Rates**: Transparent live rates with instant estimation based on weight/quantity.
- **Commercial & B2B Solutions**: Specialized bulk scrap handling for offices, institutions, and industrial units.
- **Live Tracking & Route Maps**: Interactive status and collector route tracking powered by Leaflet maps.
- **Secure Authentication**: OTP-based email verification, JWT session handling, and role-based access.
- **Eco-Donations**: Support environmental causes, tree plantation drives, and partner NGOs.

### 🚛 Collector Dashboard
- Real-time pickup request discovery and job acceptance.
- Collector route map and destination navigation.
- Historical collection logs, status updates, and weight verification.

### 🤖 AI Chatbot (RAG Assistant)
- Integrated real-time assistant widget.
- Powered by a **FastAPI backend** utilizing **FAISS vector database** and **Retrieval-Augmented Generation (RAG)**.
- Delivers context-aware answers to scrap queries, recycling tips, and platform guidelines.

### 🛠️ Modular Backend & Admin Panel
- Layered **Controller-Service-Repository** architecture with centralized error handling.
- Input validation using robust schemas.
- Role-based authorization (`Individual`, `Collector`, `RecycleCompany`, `Admin`).
- Full platform management: users, pickups, donations, and scrap rate configurations.

---

## 🌐 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet / React-Leaflet, Lucide / React Icons, SweetAlert2 |
| **Backend API** | Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer |
| **AI Assistant** | Python 3.10+, FastAPI, FAISS, Sentence-Transformers (RAG Pipeline) |
| **Tools & Architecture** | Service-Repository Pattern, RESTful APIs, Railway / Vercel ready |

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)
- MongoDB instance (local or MongoDB Atlas)

---

### 1. Backend Server (Node.js / Express)

```bash
cd ScrapSathi/server
npm install
```

Configure your `.env` file (refer to `server/.env.example`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

Start the backend:
```bash
npm run dev
```

---

### 2. Frontend (React + Vite)

```bash
cd ScrapSathi/Frontend
npm install
```

Configure your `.env` file (refer to `Frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_CHATBOT_API_URL=http://localhost:8000
```

Start the frontend development server:
```bash
npm run dev
```

---

### 3. AI Chatbot Service (FastAPI / RAG)

```bash
cd ScrapSathi/Backend_chatapp
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix / macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🐳 Docker

ScrapSaathi is fully containerized using **multi-stage Docker builds** for both the backend and frontend.

### Architecture
| Container | Base Image | Description |
|---|---|---|
| `scrapsaathi-backend` | `node:20-alpine` (multi-stage) | Node.js API — production image with non-root user |
| `scrapsaathi-frontend` | `node:20-alpine` → `nginx:1.27-alpine` (multi-stage) | React/Vite app built and served via Nginx |

### Run with Docker Compose

```bash
# From the repo root (ScrapSaathiNew/)
cp ScrapSathi/server/.env .env      # or edit .env directly

docker compose up --build           # Build and start all services
docker compose up -d --build        # Detached mode
docker compose down -v              # Stop and remove volumes
```

Services exposed:
- **Frontend** → `http://localhost:5173`
- **Backend API** → `http://localhost:8000`
- **Health check** → `http://localhost:8000/health`

### Build Images Individually

```bash
# Backend
docker build -t scrapsaathi-backend:latest ./ScrapSathi/server

# Frontend (pass VITE_ vars as build args — they get baked into the bundle)
docker build \
  --build-arg VITE_PROD_BASE_URL=https://your-backend.onrender.com/api \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id \
  -t scrapsaathi-frontend:latest \
  ./ScrapSathi/Frontend
```

---

## ☸️ Kubernetes

Production-ready Kubernetes manifests are in [`ScrapSathi/k8s/`](./ScrapSathi/k8s/).

### Manifests
| File | Resource(s) |
|---|---|
| `namespace.yaml` | Namespace: `scrapsaathi` |
| `backend-deployment.yaml` | Deployment (2 replicas) + Service + ConfigMap |
| `backend-secret.yaml` | Secret (MongoDB URI, JWT, email credentials) |
| `frontend-deployment.yaml` | Deployment (2 replicas) + Service + Ingress |

### Features
- **Rolling updates** — zero-downtime deployments (`maxUnavailable: 0`)
- **Liveness & Readiness probes** — automatic pod restart + traffic management
- **Resource limits** — CPU and memory requests/limits per container
- **Non-root security context** — containers run as unprivileged user
- **Ingress routing** — `/api/*` → backend, `/*` → frontend (Nginx SPA)
- **Namespace isolation** — all resources scoped to `scrapsaathi` namespace

### Deploy to a Cluster

```bash
# 1. Create namespace
kubectl apply -f ScrapSathi/k8s/namespace.yaml

# 2. Create secrets (fill in base64-encoded values first)
kubectl apply -f ScrapSathi/k8s/backend-secret.yaml

# 3. Deploy backend
kubectl apply -f ScrapSathi/k8s/backend-deployment.yaml

# 4. Deploy frontend
kubectl apply -f ScrapSathi/k8s/frontend-deployment.yaml

# 5. Check status
kubectl get pods -n scrapsaathi
kubectl get svc -n scrapsaathi
kubectl get ingress -n scrapsaathi
```

### Generate base64 secrets
```bash
echo -n "your-mongodb-uri" | base64
echo -n "your-jwt-secret" | base64
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
