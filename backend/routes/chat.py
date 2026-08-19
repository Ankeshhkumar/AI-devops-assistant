from fastapi import APIRouter, HTTPException

from models.chat import ChatRequest, ChatResponse
from services.ai_service import get_ai_response
from services.db_service import save_chat, get_chats, clear_chats


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        response = get_ai_response(request.query)
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
    return clear_chats()
