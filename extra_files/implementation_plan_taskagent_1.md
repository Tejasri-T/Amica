# Task Agent + PostgreSQL Integration Plan

## Overview
Add a **Task Agent node** to the LangGraph graph with tools for task management, backed by a **PostgreSQL database** running in Docker. Use **LangChain PostgreSQL checkpointer/memory** to persist conversation state.

---

## Changes

### 1. Docker — PostgreSQL Container
- Create `docker-compose.yml` at project root with PostgreSQL 16
- Database: `amica_db`, user: `amica`, password: `amica_secret`
- Expose port `5432`

### 2. Backend — Database Layer (`backend/server/database.py`)
- SQLAlchemy models for `tasks` table:
  - `id` (UUID, PK), `title`, `description`, `due_date`, `due_time`, `priority` (low/medium/high), `status` (pending/in_progress/completed), `created_at`, `updated_at`
- Async connection pool via `psycopg` (sync wrapper for LangGraph compatibility)
- Functions: `init_db()`, `get_db_session()`

### 3. Backend — Task Tools (`backend/server/task_tools.py`)
LangChain `@tool` decorated functions:
| Tool | Purpose |
|------|---------|
| `add_task` | Create a new task with title, description, due_date, due_time, priority |
| `get_tasks` | Retrieve tasks with optional filters (status, priority, date range) |
| `update_task` | Update task fields by ID |
| `complete_task` | Mark a task as completed |
| `delete_task` | Remove a task |
| `check_conflicts` | Check if a new task's time slot clashes with existing tasks |

### 4. Backend — Agent Rewrite (`backend/server/agent.py`)
- **Router node**: Uses LLM to decide if the user wants to chat or manage tasks
- **Chat node**: General conversation (existing)
- **Task agent node**: LLM with task tools bound, handles tool calls
- **Tool executor node**: Executes the selected tool and returns results
- Use `langgraph-checkpoint-postgres` for persistent memory/checkpointing

```
Graph Flow:
START → router → chat_node → END
              → task_agent → tool_executor → task_agent (loop until done) → END
```

### 5. Backend — Server Updates (`backend/server/main.py`)
- Add `thread_id` support for conversation persistence
- Initialize DB on startup
- Add `/tasks` REST endpoints for direct task listing

### 6. Dependencies (`backend/requirements.txt`)
Add: `psycopg[binary]`, `sqlalchemy`, `langgraph-checkpoint-postgres`, `langchain-google-genai`

---

## Execution Order
1. Create `docker-compose.yml`
2. Create `database.py` (models + connection)
3. Create `task_tools.py` (LangChain tools)
4. Rewrite `agent.py` (multi-node graph with router)
5. Update `main.py` (DB init, thread support)
6. Update `requirements.txt`
7. Update `.env` with DB connection string
8. Test the full flow
