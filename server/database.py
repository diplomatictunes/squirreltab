import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./icetab.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    api_key = Column(String, unique=True, index=True)
    last_synced_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    tab_lists = relationship("TabList", back_populates="user")

class TabList(Base):
    __tablename__ = "tab_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    remote_id = Column(String, index=True) # Extension's ID
    title = Column(String)
    tabs = Column(String)  # JSON string
    category = Column(String)
    tags = Column(String)  # JSON string
    time = Column(Integer)
    pinned = Column(Boolean, default=False)
    color = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tab_lists")

def init_db():
    Base.metadata.create_all(bind=engine)
    ensure_columns()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_columns():
    """Best-effort migration to add new sync-related columns without losing existing data."""
    with engine.connect() as conn:
        table_info = conn.execute(text("PRAGMA table_info('tab_lists')")).fetchall()
        existing = {row[1] for row in table_info}
        if "time" not in existing:
            conn.execute(text("ALTER TABLE tab_lists ADD COLUMN time INTEGER"))
        if "pinned" not in existing:
            conn.execute(text("ALTER TABLE tab_lists ADD COLUMN pinned INTEGER DEFAULT 0"))
        if "color" not in existing:
            conn.execute(text("ALTER TABLE tab_lists ADD COLUMN color VARCHAR"))

        user_info = conn.execute(text("PRAGMA table_info('users')")).fetchall()
        user_cols = {row[1] for row in user_info}
        if "last_synced_at" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_synced_at TEXT"))
