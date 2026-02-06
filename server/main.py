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

# CORS Middleware
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
API_KEY_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Pydantic Models
class TabItem(BaseModel):
    title: str
    url: str
    favIconUrl: Optional[str] = ""
    pinned: Optional[bool] = None

class listschema(BaseModel):
    remote_id: str
    title: str
    tabs: List[TabItem]
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    time: Optional[int] = None
    pinned: Optional[bool] = False
    color: Optional[str] = ""
    updated_at: Optional[int] = None

class FullSyncPayload(BaseModel):
    lists: List[listschema] = []

# Helpers
def epoch_ms_to_dt(value: Optional[int]) -> datetime.datetime:
    if value is None:
        return datetime.datetime.utcnow()
    return datetime.datetime.utcfromtimestamp(value / 1000)

def dt_to_epoch_ms(value: Optional[datetime.datetime]) -> Optional[int]:
    if value is None:
        return None
    return int(value.timestamp() * 1000)

# FIXED: Auth Dependency using api_key instead of username
def get_user_by_api_key(api_key: str = Security(api_key_header), db: Session = Depends(get_db)):
    if not api_key:
        logger.warning("No API key provided, checking for default development user")
        user = db.query(User).filter(User.api_key == "dev-key-12345").first()
        if not user:
            user = User(api_key="dev-key-12345")
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
    init_db()
    logger.info("Database initialized")

@app.get("/")
def root():
    return {"status": "running", "version": "2.0.0"}


@app.get("/health")
def health_check():
    return {
        "status": "success",
        "service": "SquirrlTab Sync",
        "version": "1.0.0"
    }
    
# FIXED: Pull Endpoint (Removed user.username)
@app.get("/sync/pull")
def pull_tabs(user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Pull request from user ID: {user.id}")
        lists = db.query(TabList).filter(TabList.user_id == user.id).all()
        
        result = []
        for l in lists:
            result.append({
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
        
        # Calculate last sync time
        dataset_updated = user.last_synced_at or (max((l.updated_at for l in lists if l.updated_at), default=None))
        
        return {
            "status": "success",
            "lists": result,
            "updated_at": dataset_updated.isoformat() if dataset_updated else None
        }
    except Exception as e:
        logger.error(f"Error pulling tabs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/sync/push")
def push_single_list(data: listschema, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    # The extension sends a single list object here
    existing = db.query(TabList).filter(
        TabList.remote_id == data.remote_id, 
        TabList.user_id == user.id
    ).first()
    
    tabs_data = json.dumps([t.dict() for t in data.tabs])
    
    if existing:
        existing.title = data.title
        existing.tabs = tabs_data
        existing.category = data.category
        existing.tags = json.dumps(data.tags)
        existing.time = data.time
        existing.pinned = data.pinned
        existing.color = data.color
    else:
        new_list = TabList(
            user_id=user.id,
            remote_id=data.remote_id,
            title=data.title,
            tabs=tabs_data,
            category=data.category,
            tags=json.dumps(data.tags),
            time=data.time,
            pinned=data.pinned,
            color=data.color
        )
        db.add(new_list)
    
    db.commit()
    return {"status": "success"}

# FIXED: State/Replace Endpoint (Removed user.username)
@app.post("/sync/state")
def replace_state(payload: FullSyncPayload, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Full sync for user ID: {user.id} with {len(payload.lists)} lists")
        
        # Clear existing
        db.query(TabList).filter(TabList.user_id == user.id).delete()
        
        for entry in payload.lists:
            updated_dt = epoch_ms_to_dt(entry.updated_at or entry.time)
            new_row = TabList(
                user_id=user.id,
                remote_id=entry.remote_id,
                title=entry.title,
                tabs=json.dumps([t.dict() for t in entry.tabs]),
                category=entry.category,
                tags=json.dumps(entry.tags or []),
                time=entry.time,
                pinned=bool(entry.pinned),
                color=entry.color,
                updated_at=updated_dt,
            )
            db.add(new_row)

        user.last_synced_at = datetime.datetime.utcnow()
        db.commit()
        return {"status": "success", "updated_at": user.last_synced_at.isoformat()}
    except Exception as e:
        logger.error(f"Error during full sync: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response
