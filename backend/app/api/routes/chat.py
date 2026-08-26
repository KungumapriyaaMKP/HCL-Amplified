"""
Streaming conversational intake chat route.
"""
from __future__ import annotations

import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.llm import router

chat_router = APIRouter(prefix="/chat")


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@chat_router.post("")
async def chat_intake_stream(req: ChatRequest):
    """
    Stream conversational intake SSE chunks.
    Extracts goal, hours/week, timeframe, and budget in an engaging dialogue.
    """
    messages_payload = [{"role": m.role, "content": m.content} for m in req.messages]

    async def event_generator():
        async for chunk in router.stream_intake_chat(messages_payload):
            # Send SSE formatted payload
            data = json.dumps({"text": chunk})
            yield f"data: {data}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
