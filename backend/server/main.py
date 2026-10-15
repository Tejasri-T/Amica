"""
Amica Backend — FastAPI Server
Serves the LangGraph chat agent via a REST API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional
import json

from agent import run_agent, stream_agent, initialize_graph
from database import init_db


# ---------------------------------------------------------------------------
# Lifespan — initialize DB and graph on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and agent graph on startup."""
    print("[*] Starting Amica backend...")
    init_db()
    initialize_graph()
    print("[OK] Amica backend ready!")
    yield
    print("[*] Shutting down Amica backend.")


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Amica API",
    description="AI-Powered Personal Life Assistant — Backend API",
    version="0.2.0",
    lifespan=lifespan,
)

# CORS — allow the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    response: str
    timestamp: str
    thread_id: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "name": "Amica API",
        "version": "0.2.0",
        "status": "online",
        "description": "AI-Powered Personal Life Assistant",
        "features": ["chat", "task_management", "postgresql_memory"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to Amica and get a response."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        thread_id = request.thread_id or "default"
        response = run_agent(request.message, thread_id=thread_id)
        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat(),
            thread_id=thread_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream Amica's response token-by-token using Server-Sent Events (SSE).
    
    Event types sent:
      - data: {"token": "..."} — a text token chunk
      - data: {"done": true, "timestamp": "...", "thread_id": "..."} — stream complete
      - data: {"error": "..."} — on failure
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    thread_id = request.thread_id or "default"

    async def event_generator():
        try:
            async for token in stream_agent(request.message, thread_id=thread_id):
                # SSE format: "data: <json>\n\n"
                yield f"data: {json.dumps({'token': token})}\n\n"

            # Signal completion
            yield f"data: {json.dumps({'done': True, 'timestamp': datetime.now().isoformat(), 'thread_id': thread_id})}\n\n"
        except Exception as e:
            import traceback
            traceback.print_exc()
            error_msg = f"{type(e).__name__}: {str(e)}" if str(e) else type(e).__name__
            yield f"data: {json.dumps({'error': error_msg})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering if behind proxy
        },
    )


@app.get("/tasks")
async def list_tasks():
    """Direct REST endpoint to list all pending tasks."""
    from database import get_db_session, Task, TaskStatus

    try:
        with get_db_session() as session:
            tasks = (
                session.query(Task)
                .filter(Task.status != TaskStatus.completed)
                .order_by(Task.due_date.asc().nullslast(), Task.due_time.asc().nullslast())
                .all()
            )
            return {
                "tasks": [t.to_dict() for t in tasks],
                "count": len(tasks),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/tasks/all")
async def list_all_tasks():
    """Return ALL tasks (including completed), ordered by created_at desc."""
    from database import get_db_session, Task

    try:
        with get_db_session() as session:
            tasks = (
                session.query(Task)
                .order_by(Task.created_at.desc())
                .all()
            )
            return {
                "tasks": [t.to_dict() for t in tasks],
                "count": len(tasks),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/schedule")
async def get_schedule():
    """Return tasks that have a due_date (scheduled items), ordered chronologically."""
    from database import get_db_session, Task, TaskStatus

    try:
        with get_db_session() as session:
            tasks = (
                session.query(Task)
                .filter(Task.due_date.isnot(None))
                .filter(Task.status != TaskStatus.completed)
                .order_by(Task.due_date.asc(), Task.due_time.asc().nullslast())
                .all()
            )
            return {
                "tasks": [t.to_dict() for t in tasks],
                "count": len(tasks),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.patch("/tasks/{task_id}/complete")
async def complete_task_endpoint(task_id: str):
    """Mark a task as completed via REST."""
    from database import get_db_session, Task, TaskStatus

    try:
        with get_db_session() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            task.status = TaskStatus.completed
            task.updated_at = datetime.now()
            session.flush()
            return {"message": f"Task '{task.title}' completed", "task": task.to_dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/tasks/{task_id}")
async def delete_task_endpoint(task_id: str):
    """Delete a task via REST."""
    from database import get_db_session, Task

    try:
        with get_db_session() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            title = task.title
            session.delete(task)
            return {"message": f"Task '{title}' deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
