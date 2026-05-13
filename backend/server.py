from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import re
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Literal

from pydantic import BaseModel, Field
from emergentintegrations.llm.chat import LlmChat, UserMessage


# ------------- bootstrap -------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Time Traveler's Dilemma")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("ttd")


# ------------- static content -------------
ERAS = [
    {
        "id": "roman",
        "name": "Roman Empire",
        "year": "44 BC",
        "scenario": "It is the Ides of March. You stand in the marble shadows of the Roman Senate. Senators whisper, daggers hidden beneath togas. Julius Caesar approaches.",
        "teaser": "Senators are suspicious of outsiders.",
        "danger": 9,
        "tier": "free",
        "image": "https://images.unsplash.com/photo-1754399277311-57e1824cedd7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHxhbmNpZW50JTIwcm9tZSUyMGNvbG9zc2V1bSUyMGRhcmt8ZW58MHx8fHwxNzc4NjUwODM3fDA&ixlib=rb-4.1.0&q=85",
    },
    {
        "id": "titanic",
        "name": "Titanic",
        "year": "1912",
        "scenario": "The unsinkable ship has just kissed the iceberg. The orchestra plays as the deck tilts. Steam screams from the funnels. Lifeboats fill fast.",
        "teaser": "Lifeboats are filling fast.",
        "danger": 8,
        "tier": "free",
        "image": "https://images.unsplash.com/photo-1771774469675-ef7d3a3241ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHx0aXRhbmljJTIwc2hpcCUyMG9jZWFuJTIwbmlnaHR8ZW58MHx8fHwxNzc4NjUwODM3fDA&ixlib=rb-4.1.0&q=85",
    },
    {
        "id": "moon",
        "name": "Moon Landing",
        "year": "1969",
        "scenario": "You stand inside Mission Control, Houston. T-minus 10 minutes to lunar descent. Every monitor glows. Every engineer holds their breath.",
        "teaser": "NASA engineers are on edge.",
        "danger": 4,
        "tier": "free",
        "image": "https://images.unsplash.com/photo-1614726365930-627c75da663e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxtb29uJTIwbGFuZGluZyUyMGFwb2xsbyUyMHNwYWNlfGVufDB8fHx8MTc3ODY1MDgzN3ww&ixlib=rb-4.1.0&q=85",
    },
    {
        "id": "pompeii",
        "name": "Pompeii",
        "year": "79 AD",
        "scenario": "Mount Vesuvius rages. Ash rains down on terracotta rooftops. The earth groans. Citizens flee toward a sea that's already boiling.",
        "teaser": "The sky is turning black with ash.",
        "danger": 10,
        "tier": "premium",
        "image": "https://images.unsplash.com/photo-1760726289563-cb46e60c1232?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHx2b2xjYW5vJTIwZXJ1cHRpb24lMjBkYXJrJTIwbmlnaHR8ZW58MHx8fHwxNzc4NjUwODQzfDA&ixlib=rb-4.1.0&q=85",
    },
    {
        "id": "dday",
        "name": "WW2 D-Day",
        "year": "1944",
        "scenario": "Cold seawater fills your boots in a Higgins boat off Omaha Beach. The ramp is about to drop. Bullets ping the steel hull. Men around you pray.",
        "teaser": "The ramp drops in 30 seconds.",
        "danger": 9,
        "tier": "premium",
        "image": "https://images.unsplash.com/photo-1682704589331-3b332a770f60?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxzdG9ybXklMjBvY2VhbiUyMHdhdmVzJTIwZC1kYXl8ZW58MHx8fHwxNzc4NjUwODQzfDA&ixlib=rb-4.1.0&q=85",
    },
    {
        "id": "mars",
        "name": "First Mars Colony",
        "year": "2050",
        "scenario": "The habitat dome cracks. Red dust seeps through the seal. Atmospheric oxygen drops below 18%. The colony AI starts evacuation protocols.",
        "teaser": "The dome won't hold for long.",
        "danger": 7,
        "tier": "premium",
        "image": "https://images.unsplash.com/photo-1758269636418-9794f2f4f598?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxtYXJzJTIwc3VyZmFjZSUyMHJlZCUyMGdsb3dpbmd8ZW58MHx8fHwxNzc4NjUwODQzfDA&ixlib=rb-4.1.0&q=85",
    },
]

ITEMS = [
    {"id": "lighter", "name": "Lighter", "icon": "flame-outline"},
    {"id": "phone", "name": "Smartphone", "icon": "phone-portrait-outline"},
    {"id": "map", "name": "Ancient Map", "icon": "map-outline"},
    {"id": "knife", "name": "Swiss Knife", "icon": "construct-outline"},
    {"id": "medicine", "name": "Antibiotics", "icon": "medkit-outline"},
    {"id": "gold", "name": "Gold Coin", "icon": "cash-outline"},
    {"id": "compass", "name": "Compass", "icon": "compass-outline"},
    {"id": "book", "name": "History Book", "icon": "book-outline"},
]

ERAS_BY_ID = {e["id"]: e for e in ERAS}
ITEMS_BY_ID = {i["id"]: i for i in ITEMS}

VALID_VERDICTS = {
    "LEGENDARY",
    "SURVIVED",
    "BARELY MADE IT",
    "PERISHED",
    "CATASTROPHIC",
}


# ------------- models -------------
class JudgeRequest(BaseModel):
    device_id: str
    era_id: str
    item_id: str
    plan: str = Field(..., min_length=1, max_length=300)


class JudgeResponse(BaseModel):
    id: str
    survived: bool
    survival_score: int
    narrative: str
    twist: str
    verdict: str
    era_id: str
    era_name: str
    item_id: str
    item_name: str
    plan: str
    created_at: str


class GameRecord(BaseModel):
    id: str
    device_id: str
    era_id: str
    era_name: str
    item_id: str
    item_name: str
    plan: str
    survived: bool
    survival_score: int
    narrative: str
    twist: str
    verdict: str
    created_at: str


class StatsResponse(BaseModel):
    total_games: int
    survival_rate: int
    best_score: int
    current_streak: int
    legendary_count: int


# ------------- LLM call -------------
def _extract_json(text: str) -> dict:
    """Strip ```json fences and parse JSON."""
    cleaned = re.sub(r"```json|```", "", text).strip()
    # If the model returned extra prose, try to isolate first { ... }
    if not cleaned.startswith("{"):
        m = re.search(r"\{[\s\S]*\}", cleaned)
        if m:
            cleaned = m.group(0)
    return json.loads(cleaned)


async def call_time_judge(era: dict, item: dict, plan: str) -> dict:
    system = (
        "You are the Time Judge — an omniscient, dramatic, historically-accurate narrator "
        "who decides if time travelers survive their mission. You always respond in valid "
        "JSON only, with no prose outside the JSON object."
    )

    prompt = f"""Judge this time travel mission.

HISTORICAL SCENARIO: {era['scenario']}
YEAR / PLACE: {era['name']} ({era['year']})
DANGER LEVEL (1-10): {era['danger']}
ITEM IN POCKET: {item['name']}
PLAYER'S SURVIVAL PLAN: {plan}

Respond in this EXACT JSON format and nothing else:
{{
  "survived": true | false,
  "survival_score": <integer 0-100>,
  "narrative": "<2-3 sentence vivid story of what happens to the traveler>",
  "twist": "<one unexpected historical consequence in a single sentence>",
  "verdict": "<one of: LEGENDARY | SURVIVED | BARELY MADE IT | PERISHED | CATASTROPHIC>"
}}

Rules:
- LEGENDARY = score 90+ and survived. CATASTROPHIC = score under 15 and altered history badly.
- Be vivid, period-accurate, and dramatic. Reference real historical details.
- Punish unrealistic or anachronistic plans more harshly.
- Reward clever, era-appropriate plans."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"judge-{uuid.uuid4()}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    response_text = await chat.send_message(UserMessage(text=prompt))
    data = _extract_json(response_text)

    # validate / normalize
    verdict = str(data.get("verdict", "")).strip().upper()
    if verdict not in VALID_VERDICTS:
        verdict = "SURVIVED" if data.get("survived") else "PERISHED"

    score = int(data.get("survival_score", 0))
    score = max(0, min(100, score))

    return {
        "survived": bool(data.get("survived", False)),
        "survival_score": score,
        "narrative": str(data.get("narrative", "")).strip(),
        "twist": str(data.get("twist", "")).strip(),
        "verdict": verdict,
    }


# ------------- routes -------------
@api_router.get("/")
async def root():
    return {"message": "Time Traveler's Dilemma API ready."}


@api_router.get("/eras")
async def get_eras():
    return {"eras": ERAS}


@api_router.get("/items")
async def get_items():
    return {"items": ITEMS}


@api_router.post("/judge", response_model=JudgeResponse)
async def judge(req: JudgeRequest):
    era = ERAS_BY_ID.get(req.era_id)
    item = ITEMS_BY_ID.get(req.item_id)
    if not era:
        raise HTTPException(status_code=400, detail="Unknown era_id")
    if not item:
        raise HTTPException(status_code=400, detail="Unknown item_id")

    try:
        result = await call_time_judge(era, item, req.plan)
    except Exception as e:
        logger.exception("Time Judge call failed")
        raise HTTPException(status_code=502, detail=f"Time stream unstable: {e}")

    record = {
        "id": str(uuid.uuid4()),
        "device_id": req.device_id,
        "era_id": era["id"],
        "era_name": f"{era['name']} {era['year']}",
        "item_id": item["id"],
        "item_name": item["name"],
        "plan": req.plan,
        "survived": result["survived"],
        "survival_score": result["survival_score"],
        "narrative": result["narrative"],
        "twist": result["twist"],
        "verdict": result["verdict"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Save without mutating record with mongo _id in the response
    await db.games.insert_one({**record})

    return JudgeResponse(**{k: v for k, v in record.items() if k != "device_id"})


@api_router.get("/games")
async def list_games(device_id: str, limit: int = 50):
    cursor = (
        db.games.find({"device_id": device_id}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    games = await cursor.to_list(length=limit)
    return {"games": games}


@api_router.get("/stats", response_model=StatsResponse)
async def get_stats(device_id: str):
    cursor = db.games.find({"device_id": device_id}, {"_id": 0}).sort("created_at", -1)
    games = await cursor.to_list(length=1000)
    total = len(games)
    if total == 0:
        return StatsResponse(
            total_games=0,
            survival_rate=0,
            best_score=0,
            current_streak=0,
            legendary_count=0,
        )

    survived_count = sum(1 for g in games if g.get("survived"))
    best = max(g.get("survival_score", 0) for g in games)
    legendary = sum(1 for g in games if g.get("verdict") == "LEGENDARY")

    streak = 0
    for g in games:  # already sorted desc
        if g.get("survived"):
            streak += 1
        else:
            break

    return StatsResponse(
        total_games=total,
        survival_rate=round((survived_count / total) * 100),
        best_score=best,
        current_streak=streak,
        legendary_count=legendary,
    )


@api_router.delete("/games")
async def clear_games(device_id: str):
    res = await db.games.delete_many({"device_id": device_id})
    return {"deleted": res.deleted_count}


# ------------- app wire-up -------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
