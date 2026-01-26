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

from database import init_db, get_db, User, TabList

load_dotenv()

app = FastAPI(title="IceTab Sync API")

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
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

# OpenAI Client (Optional for non-AI features)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Models
class TabItem(BaseModel):
    title: str
    url: str

class TabListSchema(BaseModel):
    remote_id: str
    title: str
    tabs: List[TabItem]
    category: Optional[str] = None
    tags: Optional[List[str]] = []

class CategorizeRequest(BaseModel):
    tabs: List[TabItem]

# Auth Dependency
def get_user_by_api_key(api_key: str = Security(api_key_header), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return user

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "time": datetime.datetime.utcnow().isoformat()
    }

@app.post("/sync/push")
def push_tabs(data: TabListSchema, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    # Check if remote_id already exists for this user
    existing = db.query(TabList).filter(
        TabList.user_id == user.id, 
        TabList.remote_id == data.remote_id
    ).first()
    
    if existing:
        existing.title = data.title
        existing.tabs = json.dumps([t.dict() for t in data.tabs])
        existing.category = data.category
        existing.tags = json.dumps(data.tags)
        existing.updated_at = datetime.datetime.utcnow()
    else:
        new_list = TabList(
            user_id=user.id,
            remote_id=data.remote_id,
            title=data.title,
            tabs=json.dumps([t.dict() for t in data.tabs]),
            category=data.category,
            tags=json.dumps(data.tags)
        )
        db.add(new_list)
    
    db.commit()
    return {"status": "success"}

@app.get("/sync/pull")
def pull_tabs(user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
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
            "updated_at": l.updated_at.isoformat()
        })
    return result

@app.post("/ai/categorize")
def categorize_tabs(data: CategorizeRequest, user: User = Depends(get_user_by_api_key)):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    prompt = f"""
    Categorize these navigation tabs into one high-level category (e.g., Shopping, Dev, Research, Entertainment, Social).
    Also provide a few descriptive tags.
    Identify duplicate URLs (ignoring UTM parameters).
    
    Tabs:
    {json.dumps([t.dict() for t in data.tabs], indent=2)}
    
    Return ONLY JSON in this format:
    {{
        "category": "category name",
        "tags": ["tag1", "tag2"],
        "duplicate_ids": [indices of duplicate tabs]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that categorizes browser tabs."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
