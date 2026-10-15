"""
Amica — Database Layer
SQLAlchemy models and connection management for PostgreSQL.
"""

import uuid
from datetime import datetime, date, time
from contextlib import contextmanager
from typing import Optional

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Text,
    Date,
    Time,
    DateTime,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from dotenv import load_dotenv
import os
import enum

load_dotenv()

# ---------------------------------------------------------------------------
# Database URL
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://amica:amica_secret@localhost:5433/amica_db",
)

# Connection string for langgraph checkpointer (needs raw postgresql:// format)
DATABASE_URL_RAW = os.getenv(
    "DATABASE_URL_RAW",
    "postgresql://amica:amica_secret@localhost:5433/amica_db",
)

# ---------------------------------------------------------------------------
# Engine & Session
# ---------------------------------------------------------------------------
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Task(Base):
    """Task model — stores user tasks with scheduling info."""

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    due_time = Column(Time, nullable=True)
    duration_minutes = Column(String(50), nullable=True, default="60")
    priority = Column(
        SAEnum(TaskPriority, name="task_priority", create_constraint=True),
        nullable=False,
        default=TaskPriority.medium,
    )
    status = Column(
        SAEnum(TaskStatus, name="task_status", create_constraint=True),
        nullable=False,
        default=TaskStatus.pending,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        """Convert task to a dictionary for serialization."""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "due_time": self.due_time.isoformat() if self.due_time else None,
            "duration_minutes": self.duration_minutes,
            "priority": self.priority.value if self.priority else None,
            "status": self.status.value if self.status else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"


# ---------------------------------------------------------------------------
# Database Initialization
# ---------------------------------------------------------------------------
def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created/verified.")


@contextmanager
def get_db_session():
    """Context manager for database sessions with auto-commit/rollback."""
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
