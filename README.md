# 🤖 AI DevOps Assistant

An end-to-end AI-powered DevOps Assistant built with **FastAPI, PostgreSQL, Redis, OpenRouter, Docker, Kubernetes, Prometheus, Grafana, Trivy, Git and GitHub**.

The project demonstrates the complete path from application development to containerization, Kubernetes deployment, observability, security scanning and operational troubleshooting.

Built an AI-powered DevOps Assistant using FastAPI, PostgreSQL, Redis and OpenRouter. Containerized the application with Docker, reduced image size using a slim Python base image, deployed three backend replicas on Kubernetes/Minikube, implemented health probes and Kubernetes Secrets, added Prometheus/Grafana observability, and integrated Trivy for container security scanning.

<img width="1235" height="785" alt="image" src="https://github.com/user-attachments/assets/c8082b9b-11b5-4cf1-a677-bde4ce0e7f91" />


## 🎯 Use Case

A user asks a DevOps question through the web UI. The request is handled by FastAPI, checked against Redis, sent to the LLM on a cache miss, cached for future requests, and persisted in PostgreSQL.

```text
User
  │
  ▼
Web UI (HTML/CSS/JS)
  │
  ▼
Kubernetes NodePort :30007
  │
  ▼
Kubernetes Service
  │
  ├──────────────┬──────────────┬──────────────┐
  ▼              ▼              ▼
Backend Pod 1  Backend Pod 2  Backend Pod 3
  │              │              │
  └──────────────┼──────────────┘
                 ▼
             FastAPI
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
      Redis  PostgreSQL  OpenRouter
      Cache   History      LLM
```

## 🏗️ Architecture

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  ▼
                         ┌─────────────────┐
                         │   Frontend UI   │
                         │ HTML/CSS/JS     │
                         └────────┬────────┘
                                  ▼
                         ┌─────────────────┐
                         │ Kubernetes      │
                         │ NodePort :30007 │
                         └────────┬────────┘
                                  ▼
                         ┌─────────────────┐
                         │ Kubernetes      │
                         │ Service         │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               ┌─────────┐   ┌─────────┐   ┌─────────┐
               │ Backend │   │ Backend │   │ Backend │
               │ Pod 1   │   │ Pod 2   │   │ Pod 3   │
               │ :8000   │   │ :8000   │   │ :8000   │
               └────┬────┘   └────┬────┘   └────┬────┘
                    └──────────────┼─────────────┘
                                   ▼
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
                 ┌──────┐    ┌──────────┐    ┌───────────┐
                 │Redis │    │PostgreSQL│    │ OpenRouter│
                 │Cache │    │  History │    │    LLM    │
                 └──────┘    └──────────┘    └───────────┘

                         Observability
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
               Prometheus            Grafana

                           Security
                              │
                              ▼
                            Trivy
```

## 🛠️ Technologies

| Area | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | HTML, CSS, JavaScript |
| AI | OpenRouter |
| Current LLM | `nvidia/nemotron-3-ultra-550b-a55b:free` |
| Database | PostgreSQL |
| Cache | Redis |
| Containers | Docker |
| Base Image | `python:3.10-slim` |
| Orchestration | Kubernetes |
| Local Cluster | Minikube |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Security | Trivy |
| Version Control | Git, GitHub |
| CI/CD | GitHub Actions |
| Configuration | Kubernetes YAML |

## 🔌 API

```text
POST   /chat
GET    /history
DELETE /clear
GET    /health/live
GET    /health/ready
GET    /metrics
```

### Chat flow

```text
POST /chat
     │
     ▼
Redis lookup
     │
 ┌───┴────┐
 │        │
HIT      MISS
 │        │
 ▼        ▼
Return   OpenRouter
           │
           ▼
        Redis cache
           │
           ▼
       PostgreSQL
           │
           ▼
        Response
```

## ☸️ Kubernetes

The backend runs with **3 replicas**.

```text
Deployment
  ├── ai-backend Pod 1
  ├── ai-backend Pod 2
  └── ai-backend Pod 3
```

The Service exposes:

```text
8000:30007/TCP
```

The Service was verified to contain all three backend endpoints.

### Health probes

```text
Liveness  → /health/live
Readiness → /health/ready
```

Validation produced:

```text
{"status":"alive"}  HTTP 200
{"status":"ready"}  HTTP 200
```

Both were tested through Kubernetes Service and Minikube NodePort.

## 📊 Observability

FastAPI is instrumented with:

```text
prometheus-fastapi-instrumentator
```

Architecture:

```text
FastAPI → /metrics → Prometheus → Grafana
```

## 🔐 Security

### Kubernetes Secret

The OpenRouter API key is injected using:

```yaml
valueFrom:
  secretKeyRef:
    name: openrouter-secret
    key: OPENROUTER_API_KEY
```

### Container hardening

The project moved from the full Python image to:

```text
python:3.10-slim
```

and added `.dockerignore` to exclude unnecessary local files.

### Trivy

Trivy was used to scan the container for OS and Python dependency vulnerabilities.

## 🐳 Docker Optimization

The original image was approximately **1.19 GB**.

After moving to the slim base image and excluding unnecessary files, the application image was reduced to approximately **196 MB**.

Docker images were also tagged with Git commit SHA values, providing traceability between source code and container image.

Example:

```bash
docker build -t ankeshhkumar/ai-devops-assistant:$(git rev-parse HEAD) ./backend
```

## 📁 Project Structure

```text
AI-devops-assistant/
│
├── backend/
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .dockerignore
│   ├── models/
│   ├── routes/
│   └── services/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── kubernetes/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── postgres-deployment.yaml
│   └── ...
│
├── monitoring/
│   └── prometheus.yml
│
└── .github/
    └── workflows/
```

## 🧪 Validation

Examples:

```bash
kubectl get pods -l app=ai-backend
kubectl get svc
kubectl get endpoints ai-backend-service
kubectl describe pod <pod-name>
```

Kubernetes health test:

```bash
kubectl run curl-test   --rm -it   --image=curlimages/curl   --restart=Never   -- curl -s   http://ai-backend-service:8000/health/live
```

NodePort test:

```bash
curl http://192.168.49.2:30007/health/live
```

## 📈 What This Project Demonstrates

- REST API development
- LLM integration
- Redis caching
- PostgreSQL persistence
- Docker containerization
- Docker image optimization
- Kubernetes Deployments and Services
- Horizontal application replicas
- Kubernetes DNS
- Liveness/readiness probes
- Kubernetes Secrets
- Prometheus metrics
- Grafana monitoring
- Trivy security scanning
- Git/GitHub workflows
- CI/CD concepts
- Real-world troubleshooting

## 🔮 Next Improvements

- PostgreSQL credentials in Kubernetes Secret
- ConfigMap for non-sensitive configuration
- More automated tests
- Complete CI/CD deployment automation
- True conversation/session IDs
- Authentication
- TLS/HTTPS
- Cloud deployment
