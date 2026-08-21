from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from prometheus_fastapi_instrumentator import Instrumentator


app = FastAPI()

app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


app.include_router(chat_router)

Instrumentator().instrument(app).expose(app)

@app.get("/")
def home():
    return {"message": "AI DevOps Assistant Running 🚀"}

