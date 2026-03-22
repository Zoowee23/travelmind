from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.utils.auth import get_current_user
from app.agents.chatbot import chat_with_agent

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    trip_context: Optional[dict] = None

@router.post("/")
async def chat(data: ChatRequest, current_user=Depends(get_current_user)):
    reply = await chat_with_agent(
        messages=[m.model_dump() for m in data.messages],
        trip_context=data.trip_context,
    )
    return {"reply": reply}
