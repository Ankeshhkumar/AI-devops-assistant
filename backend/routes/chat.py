from fastapi import APIRouter, HTTPException

from models.chat import ChatRequest, ChatResponse
from services.ai_service import get_ai_response
from services.db_service import save_chat, get_chats, clear_chats
from services.redis_service import (
    get_cached_response,
    cache_response,
    clear_cache,
)


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        # Check Redis cache first
        cached_response = get_cached_response(request.query)

        if cached_response:
            print("⚡ Redis cache HIT")
            return ChatResponse(response=cached_response)

        print("🔍 Redis cache MISS")

        # Call LLM when response is not cached
        response = get_ai_response(request.query)

        # Store response in Redis
        cache_response(request.query, response)

        # Store conversation permanently in PostgreSQL
        save_chat(request.query, response)

        return ChatResponse(response=response)

    except Exception as e:
        print(f"❌ CHAT ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )


@router.get("/history")
def history():
    return get_chats()


@router.delete("/clear")
def clear():
    clear_cache()
    return clear_chats()
