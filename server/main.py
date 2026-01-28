import os
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from openai import OpenAI
from dotenv import load_dotenv
import logging

from database import init_db, get_db, User, TabList

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SquirrlTab Sync API", version="2.0.0")

# CORS Middleware - Allow all origins for development
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Security
API_KEY_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# OpenAI Client (Optional for non-AI features)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Models
class TabItem(BaseModel):
    title: str
    url: str
    favIconUrl: Optional[str] = ""
    pinned: Optional[bool] = False

class TabListSchema(BaseModel):
    remote_id: str
    title: str
    tabs: List[TabItem]
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    time: Optional[int] = None
    pinned: Optional[bool] = False
    color: Optional[str] = ""
    updated_at: Optional[int] = None

class CategorizeRequest(BaseModel):
    tabs: List[TabItem]

class FullSyncPayload(BaseModel):
    lists: List[TabListSchema] = []

def epoch_ms_to_dt(value: Optional[int]) -> datetime.datetime:
    if value is None:
        return datetime.datetime.utcnow()
    return datetime.datetime.utcfromtimestamp(value / 1000)

def dt_to_epoch_ms(value: Optional[datetime.datetime]) -> Optional[int]:
    if value is None:
        return None
    return int(value.timestamp() * 1000)

# Auth Dependency - with fallback for development
def get_user_by_api_key(api_key: str = Security(api_key_header), db: Session = Depends(get_db)):
    # If no API key provided, use default development user
    if not api_key:
        logger.warning("No API key provided, using default development user")
        user = db.query(User).filter(User.username == "dev").first()
        if not user:
            # Create default dev user
            user = User(username="dev", api_key="dev-key-12345")
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("Created default development user")
        return user
    
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return user

@app.on_event("startup")
def startup_event():
    logger.info("Starting SquirrlTab Sync API...")
    init_db()
    logger.info("Database initialized")
    
    # Check for OpenAI API key
    if OPENAI_API_KEY:
        logger.info("OpenAI API key configured - AI features enabled")
    else:
        logger.warning("OpenAI API key not found - AI features disabled")

@app.get("/")
def root():
    return {
        "service": "SquirrlTab Sync API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "sync_push": "/sync/push",
            "sync_pull": "/sync/pull",
            "sync_state": "/sync/state",
            "ai_categorize": "/ai/categorize"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "time": datetime.datetime.utcnow().isoformat(),
        "ai_enabled": OPENAI_API_KEY is not None
    }

@app.post("/sync/push")
def push_tabs(data: TabListSchema, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Push request from user {user.username} for list {data.remote_id}")
        updated_dt = epoch_ms_to_dt(data.updated_at or data.time)
        
        # Check if remote_id already exists for this user
        existing = db.query(TabList).filter(
            TabList.user_id == user.id, 
            TabList.remote_id == data.remote_id
        ).first()
        
        if existing:
            existing.title = data.title
            existing.tabs = json.dumps([t.dict() for t in data.tabs])
            existing.category = data.category
            existing.tags = json.dumps(data.tags) if data.tags else json.dumps([])
            existing.time = data.time
            existing.pinned = bool(data.pinned)
            existing.color = data.color
            existing.updated_at = updated_dt
            logger.info(f"Updated existing list {data.remote_id}")
        else:
            new_list = TabList(
                user_id=user.id,
                remote_id=data.remote_id,
                title=data.title,
                tabs=json.dumps([t.dict() for t in data.tabs]),
                category=data.category,
                tags=json.dumps(data.tags) if data.tags else json.dumps([]),
                time=data.time,
                pinned=bool(data.pinned),
                color=data.color,
                updated_at=updated_dt
            )
            db.add(new_list)
            logger.info(f"Created new list {data.remote_id}")
        
        user.last_synced_at = updated_dt
        db.commit()
        return {
            "status": "success",
            "remote_id": data.remote_id,
            "updated_at": updated_dt.isoformat()
        }
    except Exception as e:
        logger.error(f"Error pushing tabs: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sync/pull")
def pull_tabs(user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Pull request from user {user.username}")
        lists = db.query(TabList).filter(TabList.user_id == user.id).all()
        result = []
        for l in lists:
            result.append({
                "id": l.id,
                "remote_id": l.remote_id,
                "title": l.title,
                "tabs": json.loads(l.tabs),
                "category": l.category,
                "tags": json.loads(l.tags) if l.tags else [],
                "time": l.time,
                "pinned": bool(l.pinned),
                "color": l.color,
                "updated_at": dt_to_epoch_ms(l.updated_at)
            })
        dataset_updated = user.last_synced_at or (max((l.updated_at for l in lists if l.updated_at), default=None))
        logger.info(f"Returning {len(result)} lists")
        return {
            "lists": result,
            "updated_at": dataset_updated.isoformat() if dataset_updated else None
        }
    except Exception as e:
        logger.error(f"Error pulling tabs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sync/state")
def replace_state(payload: FullSyncPayload, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Full sync request from user {user.username} with {len(payload.lists)} lists")
        existing_lists = db.query(TabList).filter(TabList.user_id == user.id).all()
        existing_map = {item.remote_id: item for item in existing_lists}
        incoming_ids = set()
        created = updated = 0
        now_dt = datetime.datetime.utcnow()
        incoming_timestamps = []

        for entry in payload.lists:
            incoming_ids.add(entry.remote_id)
            updated_dt = epoch_ms_to_dt(entry.updated_at or entry.time)
            incoming_timestamps.append(updated_dt)
            tab_payload = json.dumps([t.dict() for t in entry.tabs])
            tags_payload = json.dumps(entry.tags or [])

            if entry.remote_id in existing_map:
                row = existing_map[entry.remote_id]
                row.title = entry.title
                row.tabs = tab_payload
                row.category = entry.category
                row.tags = tags_payload
                row.time = entry.time
                row.pinned = bool(entry.pinned)
                row.color = entry.color
                row.updated_at = updated_dt
                updated += 1
            else:
                new_row = TabList(
                    user_id=user.id,
                    remote_id=entry.remote_id,
                    title=entry.title,
                    tabs=tab_payload,
                    category=entry.category,
                    tags=tags_payload,
                    time=entry.time,
                    pinned=bool(entry.pinned),
                    color=entry.color,
                    updated_at=updated_dt,
                )
                db.add(new_row)
                created += 1

        deleted = 0
        for row in existing_lists:
            if row.remote_id not in incoming_ids:
                db.delete(row)
                deleted += 1

        latest_ts = max(incoming_timestamps, default=now_dt)
        user.last_synced_at = latest_ts
        db.commit()

        return {
            "status": "success",
            "created": created,
            "updated": updated,
            "deleted": deleted,
            "updated_at": latest_ts.isoformat()
        }
    except Exception as e:
        logger.error(f"Error during full sync: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/categorize")
def categorize_tabs(data: CategorizeRequest, user: User = Depends(get_user_by_api_key)):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI features not available - OpenAI API Key not configured")

    try:
        logger.info(f"AI categorize request from user {user.username} for {len(data.tabs)} tabs")
        
        prompt = f"""
        Categorize these browser tabs into one high-level category (e.g., Shopping, Development, Research, Entertainment, Social, Work, Education).
        Also provide 2-4 descriptive tags that would help organize these tabs.
        
        Tabs:
        {json.dumps([t.dict() for t in data.tabs], indent=2)}
        
        Return ONLY valid JSON in this exact format:
        {{
            "category": "category name",
            "tags": ["tag1", "tag2", "tag3"]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that categorizes browser tabs. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        logger.info(f"AI categorization successful: {result}")
        return result
    except Exception as e:
        logger.error(f"Error in AI categorization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI categorization failed: {str(e)}")

# Middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
