from fastapi import APIRouter
from services.ai_service import get_ai_response
from services.db_service import save_chat, get_chats
from services.db_service import clear_chats

router = APIRouter()

@router.get("/chat")
def chat(query: str):
    response = get_ai_response(query)

    # Save to DB
    save_chat(query, response)

    return {"response": response}

@router.get("/history")
def chat_history():
    chats = get_chats()

    result = []
    for q, r in chats:
        result.append({"query": q, "response": r})

    return {"history": result}

@router.delete("/clear")
def clear_chat():
    clear_chats()
    return {"message": "Chats cleared"}

