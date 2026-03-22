"""
Chatbot Agent — context-aware travel assistant using Grok.
Accepts full conversation history + optional trip context.
"""
import json
from openai import AsyncOpenAI
from app.config import settings

client = AsyncOpenAI(
    api_key=settings.GROK_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

SYSTEM_PROMPT = """You are TravelMind AI, a friendly and knowledgeable travel assistant.
You help users plan trips, modify itineraries, suggest food, hotels, activities, and answer travel questions.
When given a trip context (JSON), use it to give specific, relevant answers.
Keep responses concise and practical."""

async def chat_with_agent(messages: list, trip_context: dict = None) -> str:
    system_content = SYSTEM_PROMPT
    if trip_context:
        system_content += f"\n\nCurrent trip context:\n{json.dumps(trip_context, indent=2)}"

    full_messages = [{"role": "system", "content": system_content}] + messages

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=full_messages,
        temperature=0.7,
        max_tokens=1000,
    )
    return response.choices[0].message.content
