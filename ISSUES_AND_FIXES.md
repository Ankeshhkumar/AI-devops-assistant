# 🛠️ Issues Faced & Fixes

## 1. Docker image was ~1.19 GB

**Cause:** Full `python:3.10` base image.

**Fix:**
```dockerfile
FROM python:3.10-slim
```

Also added `.dockerignore`.

**Result:** Application image reduced to approximately 196 MB.

---

## 2. Local virtual environment was unnecessary in Docker

**Problem:** `backend/venv/` was large and should not enter the image/build context.

**Fix:**
```text
backend/venv/
backend/__pycache__/
```

were added to ignore rules.

**Lesson:** Keep development environments outside production images.

---

## 3. Trivy reported Python vulnerabilities

Trivy reported HIGH findings involving packages including:

```text
msgpack
setuptools
```

**Fix/approach:** Investigated dependency metadata, updated container/package tooling where appropriate, and incorporated Trivy into the security workflow.

**Lesson:** Scan the actual built image, not only the host Python environment.

---

## 4. `pip show msgpack` showed nothing

**Problem:** `pip show msgpack` on the host did not show the package even though Trivy reported it.

**Cause:** Host and container environments are different, and scanners inspect package metadata/dependency relationships inside the image.

**Lesson:** Security findings must be investigated in the same environment that is being deployed.

---

## 5. Kubernetes readiness probe failed during startup

Event:

```text
connect: connection refused
```

**Cause:** Kubernetes checked readiness before the application had finished starting/listening on port 8000.

**Result:** Pod subsequently became Ready.

**Lesson:** A startup-time readiness failure does not necessarily mean the application is broken.

---

## 6. Recent health probe timeout events

Events showed:

```text
context deadline exceeded
Client.Timeout exceeded while awaiting headers
```

**Investigation:** The probes had a 5-second timeout. Manual validation later returned HTTP 200.

**Current status:** The pod is Running/Ready and both health endpoints return HTTP 200.

**Lesson:** `kubectl describe pod` can retain historical Events; an old `Unhealthy` event does not mean the pod is currently unhealthy.

---

## 7. `curl` was missing from the backend container

**Error:**
```text
exec: "curl": executable file not found
```

**Cause:** The hardened `python:3.10-slim` image does not include curl.

**Fix:** Used a temporary Kubernetes curl container:

```bash
kubectl run curl-test   --rm -it   --image=curlimages/curl   --restart=Never   -- curl ...
```

**Lesson:** Do not add diagnostic tools to production images just for testing.

---

## 8. Kubernetes Service DNS did not work from the host

**Problem:** `ai-backend-service` could not be resolved from the host shell.

**Cause:** Kubernetes Service DNS is available inside the cluster.

**Fix:** Tested from a temporary pod using:

```text
http://ai-backend-service:8000
```

For host access, used:

```text
http://192.168.49.2:30007
```

---

## 9. `localhost:8000` was the wrong test location

**Problem:** Host request to:

```text
http://localhost:8000
```

did not test the Kubernetes backend.

**Fix:**

```bash
curl http://192.168.49.2:30007/health/live
```

**Lesson:** Understand the difference between host networking, NodePort access and pod/service networking.

---

## 10. Incorrect `kubectl exec ...`

**Problem:**
```bash
kubectl exec ... -- curl ...
```

returned:

```text
pods "..." not found
```

**Cause:** `...` was treated literally as the pod name.

**Fix:** Replace placeholders with the real pod name.

---

## 11. Incorrect `kubectl run ...`

**Problem:**
```text
required flag(s) "image" not set
```

**Cause:** The `...` placeholder was used instead of the actual arguments.

**Fix:**
```bash
kubectl run curl-test   --rm -it   --image=curlimages/curl   --restart=Never   -- curl ...
```

---

## 12. OpenRouter returned HTTP 429

**Problem:** Chat requests sometimes returned HTTP 429.

**Cause:** Upstream/provider/model rate limiting.

**Action:** Switched the configured free model to:

```text
nvidia/nemotron-3-ultra-550b-a55b:free
```

**Lesson:** External AI APIs can rate-limit requests; production systems should consider caching, retries, backoff and model/provider fallback.

---

## 13. OpenRouter API key handling

**Problem:** API credentials should not be hardcoded in Deployment configuration.

**Fix:** Created:

```text
openrouter-secret
```

and referenced it with:

```yaml
valueFrom:
  secretKeyRef:
    name: openrouter-secret
    key: OPENROUTER_API_KEY
```

---

## 14. Grafana dashboard schema mismatch

**Problem:** A dashboard definition based on an older schema did not match the newer Grafana dashboard/resource model.

**Fix:** Used the current Grafana UI/resource model rather than blindly applying an incompatible older schema.

**Lesson:** Configuration schemas are version-dependent.

---

## 15. Docker image appeared "In Use"

**Problem:** An old image appeared as `In Use` even though no application container was running.

**Cause:** A stopped container still referenced the image.

**Lesson:** Docker can retain an image reference through stopped containers.

---

## 16. Git SHA Docker tags

**Question:** Why does this create a long Docker tag?

```bash
git rev-parse HEAD
```

**Answer:** It returns the current commit SHA.

This creates:

```text
Git commit
    ↓
Docker image tag
    ↓
Kubernetes deployment
```

**Benefit:** Deployment traceability.

---

## 17. Three backend replicas

**Goal:** Demonstrate Kubernetes scaling/high availability.

**Implementation:**
```yaml
replicas: 3
```

**Validation:**
```bash
kubectl get pods -l app=ai-backend
```

showed three backend pods Running.

---

# 🧠 Main Lessons

1. Keep production images minimal.
2. Separate development and production environments.
3. Scan the actual image with Trivy.
4. Keep credentials in Secrets.
5. Understand Kubernetes networking and DNS.
6. Use temporary debugging containers.
7. Distinguish historical Kubernetes Events from current health.
8. External LLM providers can be rate-limited.
9. Git SHA tags improve deployment traceability.
10. Observability and health checks are part of production readiness.
