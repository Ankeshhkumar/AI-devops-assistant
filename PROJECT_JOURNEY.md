# 📘 AI DevOps Assistant — Complete Start-to-End Project Journey

This is the chronological project record: what was built, why it was built, how it was tested, and what was learned.

---

# 1. Project Started

## Goal

Build a practical AI DevOps Assistant and use it to learn and demonstrate:

```text
Application Development
        ↓
AI Integration
        ↓
Database
        ↓
Caching
        ↓
Docker
        ↓
Kubernetes
        ↓
Observability
        ↓
Security
        ↓
CI/CD
```

---

# 2. FastAPI Backend

Created a Python FastAPI backend.

Main application responsibilities:

- receive chat requests
- call the AI service
- retrieve/store chat history
- use Redis caching
- expose health endpoints
- expose Prometheus metrics

Core API:

```text
POST   /chat
GET    /history
DELETE /clear
GET    /health/live
GET    /health/ready
GET    /metrics
```

---

# 3. OpenRouter / LLM

Integrated OpenRouter for AI responses.

Current model:

```text
nvidia/nemotron-3-ultra-550b-a55b:free
```

Basic flow:

```text
User question
     ↓
FastAPI
     ↓
OpenRouter
     ↓
AI response
```

A rate-limit issue (`HTTP 429`) was encountered and investigated during development.

---

# 4. PostgreSQL

Added PostgreSQL for persistent chat history.

```text
FastAPI
   ↓
PostgreSQL
   ↓
Stored conversations
```

The `/history` endpoint retrieves saved chat records.

---

# 5. Redis

Added Redis as a cache.

```text
             ┌── HIT ──→ Return cached response
             │
Request → Redis
             │
             └── MISS → LLM → Redis → PostgreSQL
```

This reduces unnecessary repeated LLM requests.

---

# 6. Frontend

Created:

```text
frontend/
├── index.html
├── style.css
└── script.js
```

The frontend communicates with the FastAPI REST API.

The UI was later redesigned toward a modern glassmorphism AI-assistant experience. The existing `/history` endpoint provides the basis for a ChatGPT-style history sidebar.

---

# 7. Docker

Containerized the backend.

Initial base image:

```text
python:3.10
```

The image was initially approximately:

```text
1.19 GB
```

---

# 8. Docker Optimization

Changed to:

```text
python:3.10-slim
```

Improved dependency installation and added `.dockerignore`.

Result:

```text
~1.19 GB
   ↓
~196 MB
```

This reduced image size and unnecessary attack surface.

---

# 9. Git and GitHub

Used Git for version control and GitHub for repository hosting.

Docker images were tagged using the Git commit SHA:

```bash
git rev-parse HEAD
```

This makes the image traceable to source code.

---

# 10. Kubernetes / Minikube

Moved the backend into Kubernetes using Minikube.

Created Kubernetes resources for:

- backend Deployment
- backend Service
- PostgreSQL
- supporting configuration
- Secrets
- monitoring

---

# 11. Three Backend Replicas

The Deployment was configured with:

```yaml
replicas: 3
```

Result:

```text
Backend Pod 1
Backend Pod 2
Backend Pod 3
```

All three were verified Running/Ready.

---

# 12. Kubernetes Service

Created a Service for backend traffic.

```text
Backend port: 8000
NodePort:     30007
```

Host access:

```text
192.168.49.2:30007
```

Internal Kubernetes access:

```text
ai-backend-service:8000
```

---

# 13. Kubernetes DNS

Learned that Kubernetes Service DNS works inside the cluster.

A temporary curl pod was used to test:

```text
http://ai-backend-service:8000
```

This successfully reached the backend.

---

# 14. Health Endpoints

Added:

```text
/health/live
/health/ready
```

Configured Kubernetes liveness and readiness probes.

```text
Liveness
   ↓
/health/live

Readiness
   ↓
/health/ready
```

---

# 15. Health Validation

Inside Kubernetes:

```text
/health/live
→ {"status":"alive"} HTTP 200

/health/ready
→ {"status":"ready"} HTTP 200
```

From the Minikube NodePort:

```text
/health/live
→ HTTP 200

/health/ready
→ HTTP 200
```

This validated:

```text
Host
 ↓
NodePort
 ↓
Service
 ↓
Backend Pod
 ↓
FastAPI
```

---

# 16. Kubernetes Secrets

The OpenRouter API key was moved into a Kubernetes Secret:

```text
openrouter-secret
```

The Deployment uses:

```yaml
valueFrom:
  secretKeyRef:
    name: openrouter-secret
    key: OPENROUTER_API_KEY
```

This avoids putting the actual API key directly into the Deployment manifest.

---

# 17. Prometheus

Added:

```text
prometheus-fastapi-instrumentator
```

Architecture:

```text
FastAPI
   ↓
/metrics
   ↓
Prometheus
```

---

# 18. Grafana

Added Grafana for visualization.

Final monitoring flow:

```text
FastAPI
   ↓
Prometheus
   ↓
Grafana
```

A Grafana schema/version mismatch was encountered during dashboard work and resolved by using the appropriate current dashboard/resource model.

---

# 19. Trivy

Added Trivy container security scanning.

Trivy identified Python dependency vulnerabilities during development, including findings related to:

```text
msgpack
setuptools
```

The findings were investigated as part of the image-hardening work.

---

# 20. Kubernetes Troubleshooting

Important troubleshooting skills practiced:

```text
kubectl get pods
kubectl describe pod
kubectl get svc
kubectl get endpoints
kubectl logs
kubectl exec
kubectl run
```

Learned to distinguish:

- pod status
- Service endpoints
- Service DNS
- NodePort networking
- probe failures
- historical Events
- container debugging

---

# 21. Final Architecture

```text
                           USER
                            │
                            ▼
                    ┌───────────────┐
                    │   Frontend    │
                    │ HTML/CSS/JS   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ NodePort      │
                    │ :30007        │
                    └───────┬───────┘
                            ▼
                    ┌───────────────┐
                    │ K8s Service   │
                    └───────┬───────┘
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
              Backend    Backend    Backend
               Pod 1      Pod 2      Pod 3
                 │          │          │
                 └──────────┼──────────┘
                            ▼
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
            Redis       PostgreSQL    OpenRouter
            Cache        History          LLM

                 Observability
                       │
              ┌────────┴────────┐
              ▼                 ▼
         Prometheus          Grafana

                    Security
                       │
                       ▼
                     Trivy
```

---

# 22. Current Completed Work

```text
✅ FastAPI
✅ REST API
✅ OpenRouter LLM
✅ PostgreSQL
✅ Redis
✅ Frontend
✅ Docker
✅ Docker image optimization
✅ .dockerignore
✅ Git/GitHub
✅ Kubernetes
✅ Minikube
✅ 3 backend replicas
✅ Kubernetes Service
✅ Kubernetes DNS
✅ Liveness probe
✅ Readiness probe
✅ Prometheus
✅ Grafana
✅ Kubernetes Secret for OpenRouter key
✅ Trivy scanning
✅ Troubleshooting and validation
```

---

# 23. Next Planned Work

```text
⬜ PostgreSQL credentials → Kubernetes Secret
⬜ ConfigMap for non-sensitive settings
⬜ Resource requests/limits
⬜ Automated tests
⬜ Complete GitHub Actions CI/CD
⬜ Conversation/session IDs
⬜ ChatGPT-style history sidebar
⬜ Authentication
⬜ TLS/HTTPS
⬜ Cloud deployment
```

---

# 24. Final DevOps Lifecycle

The project is being developed around this lifecycle:

```text
       CODE
        │
        ▼
      BUILD
        │
        ▼
    CONTAINERIZE
        │
        ▼
      DEPLOY
        │
        ▼
       SCALE
        │
        ▼
     MONITOR
        │
        ▼
      SECURE
        │
        ▼
   TROUBLESHOOT
        │
        ▼
     AUTOMATE
        │
        └──────────→ repeat
```

The goal is not only to build an AI application, but to demonstrate the ability to operate and evolve it using practical DevOps tools.
