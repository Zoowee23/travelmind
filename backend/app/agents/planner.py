"""
TravelMind Planner — LangGraph multi-node agentic pipeline.

Graph nodes:
  gather_data  → fetches weather + currency in parallel (Python tools)
  plan         → Groq LLM generates the itinerary using gathered data
  validate     → checks the JSON is complete, retries if not

State flows through the graph and each node enriches it.
LangChain ChatGroq is the LLM backbone. LangGraph manages the state machine.
"""
import json
import httpx
import asyncio
from typing import Annotated, Optional
from typing_extensions import TypedDict

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from app.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# LLM  (LangChain ChatGroq — the Groq connection)
# ─────────────────────────────────────────────────────────────────────────────
llm = ChatGroq(
    api_key=settings.GROK_API_KEY,
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    max_tokens=4096,
)

# ─────────────────────────────────────────────────────────────────────────────
# Graph State — shared across all nodes
# ─────────────────────────────────────────────────────────────────────────────
class TripState(TypedDict):
    # Input fields
    destination: str
    budget: float
    currency: str
    travel_type: str
    duration_days: int
    activity_preferences: list
    exclusions: list
    start_date: Optional[str]
    accommodation_type: Optional[str]
    transport_mode: Optional[str]
    user_preferences: dict

    # Enriched by gather_data node
    weather: dict
    exchange_rate: dict
    packing_list: list

    # LangChain message history
    messages: Annotated[list, add_messages]

    # Final output
    itinerary: dict
    retries: int

# ─────────────────────────────────────────────────────────────────────────────
# Node 1: gather_data — Python tools fetch real-time data
# ─────────────────────────────────────────────────────────────────────────────
async def _fetch_weather(destination: str) -> dict:
    """OpenWeatherMap tool — fetches live weather."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": destination,
                    "appid": settings.OPENWEATHER_API_KEY,
                    "units": "metric",
                },
                timeout=8,
            )
            if resp.status_code == 200:
                d = resp.json()
                return {
                    "temp_c": round(d["main"]["temp"], 1),
                    "feels_like": round(d["main"]["feels_like"], 1),
                    "description": d["weather"][0]["description"],
                    "humidity": d["main"]["humidity"],
                    "wind_speed": d["wind"]["speed"],
                    "icon": d["weather"][0]["icon"],
                }
    except Exception:
        pass
    return {"temp_c": 25, "description": "clear sky", "humidity": 60, "wind_speed": 3, "icon": "01d"}


async def _fetch_exchange_rate(from_curr: str, to_curr: str) -> dict:
    """Frankfurter tool — fetches live exchange rate."""
    if from_curr.upper() == to_curr.upper():
        return {"rate": 1.0, "from": from_curr, "to": to_curr}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.frankfurter.app/latest",
                params={"from": from_curr.upper(), "to": to_curr.upper()},
                timeout=8,
            )
            if resp.status_code == 200:
                data = resp.json()
                rate = data["rates"].get(to_curr.upper(), 1.0)
                return {"rate": rate, "from": from_curr, "to": to_curr}
    except Exception:
        pass
    return {"rate": 1.0, "from": from_curr, "to": to_curr}


def _build_packing_list(weather: dict, duration_days: int) -> list:
    """Packing list tool — deterministic logic based on weather."""
    # Essentials always
    items = [
        "Passport / ID", "Travel insurance docs", "Phone + charger", "Medications",
        "Earphones / headphones", "Wallet + cards", "Emergency cash",
        "Copies of important documents", "Travel pillow (for long flights)",
    ]
    temp = weather.get("temp_c", 25)
    desc = weather.get("description", "").lower()

    # Clothing by temperature
    if temp < 5:
        items += [
            "Heavy winter coat", "Thermal underwear (top + bottom)", "Fleece mid-layer",
            "Gloves", "Wool scarf", "Wool socks (3+ pairs)", "Snow boots",
            "Warm hat / beanie", "Hand warmers", "Thermal flask",
        ]
    elif temp < 15:
        items += [
            "Warm jacket", "Sweater / hoodie", "Jeans (2 pairs)", "Long-sleeve shirts",
            "Walking shoes", "Light scarf", "Socks (4+ pairs)", "Light gloves",
        ]
    elif temp < 25:
        items += [
            "Light jacket / windbreaker", "T-shirts (3-4)", "Jeans / chinos",
            "Sneakers / comfortable shoes", "Light cardigan for evenings",
            "Socks (4+ pairs)",
        ]
    else:
        items += [
            "T-shirts (4-5)", "Shorts / light pants", "Sunscreen SPF50+",
            "Sunglasses (UV protection)", "Wide-brim hat / cap",
            "Sandals / flip-flops", "Breathable underwear", "Light dress / linen shirt",
            "Aloe vera / after-sun lotion",
        ]

    # Weather-specific
    if any(w in desc for w in ["rain", "drizzle", "shower", "thunderstorm"]):
        items += ["Compact umbrella", "Waterproof jacket / poncho", "Waterproof shoes / boots", "Dry bags for electronics"]
    if "snow" in desc:
        items += ["Snow boots (if not already)", "Ice grip attachments", "Lip balm (cold weather)"]
    if any(w in desc for w in ["clear", "sunny", "hot"]):
        items += ["Cooling towel", "Portable fan (mini)", "Electrolyte sachets"]

    # Duration-based
    if duration_days > 3:
        items += ["Laundry bag", "Travel-size detergent / laundry sheets", "Stain remover pen"]
    if duration_days > 7:
        items += ["Extra memory card / USB drive", "Portable power bank (20000mAh)", "Universal travel adapter"]
    if duration_days > 14:
        items += ["Neck pillow", "Eye mask + earplugs", "Sewing kit", "Duct tape (small roll)"]

    # Health & hygiene
    items += [
        "Toothbrush + toothpaste", "Deodorant", "Shampoo + conditioner (travel size)",
        "Hand sanitizer", "Face wash + moisturizer", "Lip balm",
        "Pain relievers (paracetamol/ibuprofen)", "Antidiarrheal tablets",
        "Antihistamines", "Bandages + antiseptic wipes",
    ]

    # Tech
    items += [
        "Camera / extra batteries", "Laptop / tablet (if needed)",
        "All charging cables", "Portable WiFi / SIM card",
    ]

    return list(set(items))


def _guess_local_currency(destination: str) -> str:
    mapping = {
        "japan": "JPY", "tokyo": "JPY", "osaka": "JPY", "kyoto": "JPY",
        "europe": "EUR", "france": "EUR", "paris": "EUR", "germany": "EUR",
        "berlin": "EUR", "italy": "EUR", "rome": "EUR", "spain": "EUR",
        "barcelona": "EUR", "amsterdam": "EUR", "portugal": "EUR",
        "uk": "GBP", "london": "GBP", "england": "GBP", "britain": "GBP",
        "usa": "USD", "new york": "USD", "america": "USD", "chicago": "USD",
        "australia": "AUD", "sydney": "AUD", "melbourne": "AUD",
        "canada": "CAD", "toronto": "CAD", "vancouver": "CAD",
        "india": "INR", "delhi": "INR", "mumbai": "INR", "bangalore": "INR",
        "goa": "INR", "kerala": "INR", "lakshadweep": "INR", "rajasthan": "INR",
        "uae": "AED", "dubai": "AED", "abu dhabi": "AED",
        "singapore": "SGD", "thailand": "THB", "bangkok": "THB",
        "indonesia": "IDR", "bali": "IDR", "jakarta": "IDR",
        "malaysia": "MYR", "kuala lumpur": "MYR",
        "switzerland": "CHF", "zurich": "CHF",
        "china": "CNY", "beijing": "CNY", "shanghai": "CNY",
        "south korea": "KRW", "seoul": "KRW",
        "brazil": "BRL", "mexico": "MXN", "turkey": "TRY", "istanbul": "TRY",
    }
    dest_lower = destination.lower()
    for key, curr in mapping.items():
        if key in dest_lower:
            return curr
    return "USD"


async def gather_data_node(state: TripState) -> dict:
    """
    Node 1 — Data Gathering Agent.
    Runs all real-time data tools in parallel: weather, exchange rate, packing list.
    """
    local_currency = _guess_local_currency(state["destination"])

    # Run weather + exchange rate in parallel
    weather, fx = await asyncio.gather(
        _fetch_weather(state["destination"]),
        _fetch_exchange_rate(state["currency"], local_currency),
    )

    packing = _build_packing_list(weather, state["duration_days"])

    return {
        "weather": weather,
        "exchange_rate": fx,
        "packing_list": packing,
        "messages": [
            AIMessage(content=(
                f"[Data Agent] Gathered real-time data:\n"
                f"Weather in {state['destination']}: {weather['temp_c']}°C, {weather['description']}\n"
                f"Exchange rate: 1 {state['currency']} = {fx['rate']} {fx['to']}\n"
                f"Packing list ready: {len(packing)} items"
            ))
        ],
    }

# ─────────────────────────────────────────────────────────────────────────────
# Node 2: plan — LangChain + Groq generates the itinerary
# ─────────────────────────────────────────────────────────────────────────────

PLANNER_SYSTEM = """You are TravelMind, an expert AI travel planner.
You have been given real-time weather data, live exchange rates, and a packing list.
Your job is to generate a complete, detailed travel itinerary.

Respond with ONLY a valid JSON object. No markdown fences, no explanation, just JSON.

Required schema:
{
  "destination": "string",
  "duration_days": number,
  "currency": "string",
  "total_budget": number,
  "start_date": "string or null",
  "weather_summary": "string describing the weather",
  "days": [
    {
      "day": 1,
      "morning": "detailed activity description",
      "afternoon": "detailed activity description",
      "evening": "detailed activity description",
      "estimated_cost": number,
      "travel_time": "e.g. 30 mins by metro"
    }
  ],
  "packing_list": ["item1", "item2"],
  "food_suggestions": [
    {"name": "restaurant or dish name", "type": "street food/cafe/fine dining", "estimated_cost": number}
  ],
  "stay_suggestions": [
    {"name": "hotel/hostel name", "area": "neighborhood", "type": "budget/mid-range/luxury", "estimated_cost_per_night": number}
  ],
  "budget_breakdown": {
    "accommodation": number,
    "food": number,
    "transport": number,
    "activities": number,
    "misc": number
  },
  "local_currency_info": {
    "local_currency": "string",
    "rate": number,
    "budget_in_local": number
  }
}"""


async def plan_node(state: TripState) -> dict:
    """
    Node 2 — Planning Agent (Groq LLM via LangChain).
    Uses gathered data to generate the full itinerary JSON.
    """
    w = state["weather"]
    fx = state["exchange_rate"]
    accom = f", staying in {state['accommodation_type']}" if state.get("accommodation_type") else ""
    transport = f", using {state['transport_mode']}" if state.get("transport_mode") else ""
    date_info = f"starting {state['start_date']}" if state.get("start_date") else f"for {state['duration_days']} days"

    user_prompt = f"""Plan a {state['duration_days']}-day {state['travel_type']} trip to {state['destination']} {date_info}{accom}{transport}.

Budget: {state['budget']} {state['currency']}
Activities: {', '.join(state['activity_preferences']) if state['activity_preferences'] else 'general sightseeing'}
Exclusions: {', '.join(state['exclusions']) if state['exclusions'] else 'none'}

REAL-TIME DATA (use this in your response):
- Weather: {w['temp_c']}°C, {w['description']}, humidity {w['humidity']}%, wind {w['wind_speed']} m/s
- Exchange rate: 1 {state['currency']} = {fx['rate']} {fx['to']} (budget in local: {round(state['budget'] * fx['rate'], 2)} {fx['to']})
- Packing list: {json.dumps(state['packing_list'])}

Generate the complete JSON itinerary now."""

    response = await llm.ainvoke([
        SystemMessage(content=PLANNER_SYSTEM),
        HumanMessage(content=user_prompt),
    ])

    return {
        "messages": [response],
        "itinerary": {},  # will be parsed in validate node
    }

# ─────────────────────────────────────────────────────────────────────────────
# Node 3: validate — parse JSON, retry once if malformed
# ─────────────────────────────────────────────────────────────────────────────

async def validate_node(state: TripState) -> dict:
    """
    Node 3 — Validation Agent.
    Parses the LLM response into JSON. If it fails, asks LLM to fix it.
    """
    last_msg = state["messages"][-1]
    content = last_msg.content.strip()

    # Try to extract JSON
    parsed = _try_parse_json(content)
    if parsed:
        return {"itinerary": parsed}

    # If parsing failed and we haven't retried yet, ask LLM to fix it
    if state.get("retries", 0) < 1:
        fix_response = await llm.ainvoke([
            SystemMessage(content="You are a JSON formatter. Extract and return ONLY the valid JSON object from the text below. No explanation, no markdown."),
            HumanMessage(content=content),
        ])
        fixed = _try_parse_json(fix_response.content)
        if fixed:
            return {"itinerary": fixed, "retries": 1, "messages": [fix_response]}

    raise ValueError(f"Could not parse itinerary after retry. Response: {content[:300]}")


def _try_parse_json(content: str) -> Optional[dict]:
    content = content.strip()
    # Strip markdown fences
    if "```" in content:
        for part in content.split("```"):
            part = part.strip().lstrip("json").strip()
            if part.startswith("{"):
                try:
                    return json.loads(part)
                except Exception:
                    continue
    # Direct parse
    try:
        return json.loads(content)
    except Exception:
        pass
    # Find JSON object
    s = content.find("{")
    e = content.rfind("}") + 1
    if s != -1 and e > s:
        try:
            return json.loads(content[s:e])
        except Exception:
            pass
    return None

# ─────────────────────────────────────────────────────────────────────────────
# Routing
# ─────────────────────────────────────────────────────────────────────────────

def route_after_validate(state: TripState) -> str:
    if state.get("itinerary"):
        return END
    return "plan"  # retry plan node

# ─────────────────────────────────────────────────────────────────────────────
# Build the LangGraph graph
# ─────────────────────────────────────────────────────────────────────────────

builder = StateGraph(TripState)
builder.add_node("gather_data", gather_data_node)
builder.add_node("plan", plan_node)
builder.add_node("validate", validate_node)

builder.set_entry_point("gather_data")
builder.add_edge("gather_data", "plan")
builder.add_edge("plan", "validate")
builder.add_conditional_edges("validate", route_after_validate, {END: END, "plan": "plan"})

planner_graph = builder.compile()

# ─────────────────────────────────────────────────────────────────────────────
# Public entry point — called by the FastAPI route
# ─────────────────────────────────────────────────────────────────────────────

async def run_planner_agent(
    destination: str,
    budget: float,
    travel_type: str,
    duration_days: int,
    activity_preferences: list,
    exclusions: list,
    currency: str,
    user_preferences: dict,
    start_date: str = None,
    accommodation_type: str = None,
    transport_mode: str = None,
) -> dict:

    initial_state: TripState = {
        "destination": destination,
        "budget": budget,
        "currency": currency,
        "travel_type": travel_type,
        "duration_days": duration_days,
        "activity_preferences": activity_preferences,
        "exclusions": exclusions,
        "start_date": start_date,
        "accommodation_type": accommodation_type,
        "transport_mode": transport_mode,
        "user_preferences": user_preferences,
        "weather": {},
        "exchange_rate": {},
        "packing_list": [],
        "messages": [],
        "itinerary": {},
        "retries": 0,
    }

    result = await planner_graph.ainvoke(initial_state)
    return result["itinerary"]
