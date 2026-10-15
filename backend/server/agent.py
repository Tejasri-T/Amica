"""
Amica — AI-Powered Personal Life Assistant
LangGraph Agent with a unified node for conversation and task management.
Uses PostgreSQL checkpointing for persistent conversation memory.
"""

from typing import TypedDict, Annotated, Sequence, Literal
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
    ToolMessage,
)
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langchain_google_genai import ChatGoogleGenerativeAI
import operator
import os
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool, AsyncConnectionPool
from psycopg.rows import dict_row

from task_tools import task_tools

load_dotenv()

# ---------------------------------------------------------------------------
# Database URL for checkpointer
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL_RAW",
    "postgresql://amica:amica_secret@localhost:5433/amica_db",
)


# ---------------------------------------------------------------------------
# State schema
# ---------------------------------------------------------------------------
class AgentState(TypedDict):
    """State carrying messages through the graph."""
    messages: Annotated[Sequence[BaseMessage], operator.add]


# ---------------------------------------------------------------------------
# LLMs
# ---------------------------------------------------------------------------
# Router / Chat LLM (no tools)
# chat_llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite")

# Task Agent LLM (with tools bound)
task_llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite").bind_tools(task_tools)


# ---------------------------------------------------------------------------
# System Prompts
# ---------------------------------------------------------------------------
# ROUTER_SYSTEM_PROMPT = """You are Amica's intent router. Your ONLY job is to classify the user's latest message into one of two categories:

# 1. "task" — if the user wants to add, view, update, delete, complete, list, check, or manage tasks/to-dos/reminders/schedules.
# 2. "chat" — for everything else (general conversation, questions, greetings, advice, etc.)

# Respond with EXACTLY one word: either "task" or "chat". Nothing else."""

# 

AMICA_SYSTEM_PROMPT = """You are Amica, a friendly and capable AI-powered personal life assistant. You help users with general conversation, advice, planning, answering questions, and managing their tasks and schedules.

Be warm, concise, and helpful. Use a natural, conversational tone.

You can assist users with everyday life tasks, organize their schedules, provide useful suggestions, and help them stay productive.

TASK AND SCHEDULE MANAGEMENT:

You have access to the following tools:
- add_task: Create a new task with title, description, due_date, due_time, duration_minutes, and priority.
- get_tasks: Retrieve or list tasks with optional filters such as status, priority, due_date, and upcoming_days.
- update_task: Update fields of an existing task by ID.
- complete_task: Mark a task as completed by ID.
- delete_task: Remove a task by ID.
- check_conflicts: Check whether a time slot is available before scheduling.

RULES FOR TASK MANAGEMENT:

1. Always check for scheduling conflicts before adding a task with a specific time.
2. When the user asks to view or list tasks, use get_tasks with the appropriate filters.
3. Parse natural language dates and times into the required formats:
   - Date: YYYY-MM-DD
   - Time: HH:MM (24-hour format)
4. Determine today's date from the current conversation context or available system date.
5. After performing an action, clearly summarize the result for the user.
6. If a scheduling conflict is detected, inform the user and suggest alternative available times.
7. Be proactive. If the user expresses an intention to complete something by a deadline, such as "I need to finish my report by Friday," create a task using the appropriate deadline.
8. Ask concise clarifying questions when essential details are missing or ambiguous. Do not make up task details.
9. Use the appropriate task tool whenever an action is required. Never claim to have created, updated, completed, or deleted a task unless the corresponding tool action succeeds.
10. For tasks without a specific time, do not perform unnecessary time-slot conflict checks.
11. Respect the user's existing schedule when suggesting new tasks or alternative times.
12. For general questions, conversation, advice, and planning that do not require task actions, respond directly without unnecessarily invoking task tools.

Your overall goal is to act as a reliable personal life assistant who helps users organize their responsibilities, manage their time, and make everyday life easier while maintaining a friendly and supportive conversational experience.
"""

# ---------------------------------------------------------------------------
# Graph Nodes
# ---------------------------------------------------------------------------
# def router_node(state: AgentState) -> dict:
#     """
#     Classifies user intent as 'task' or 'chat'.
#     Adds a system routing decision as a message.
#     """
#     messages = state["messages"]

#     # Find the last human message
#     last_human = None
#     for msg in reversed(messages):
#         if isinstance(msg, HumanMessage):
#             last_human = msg
#             break

#     if not last_human:
#         return {"messages": [AIMessage(content="chat")]}

#     routing_messages = [
#         SystemMessage(content=ROUTER_SYSTEM_PROMPT),
#         HumanMessage(content=last_human.content),
#     ]

#     response = chat_llm.invoke(routing_messages)
#     # Extract text content
#     content = response.content
#     if isinstance(content, list):
#         content = content[0].get("text", "") if content else ""

#     return {"messages": [AIMessage(content=content.strip().lower())]}


# def chat_node(state: AgentState) -> dict:
#     """
#     General-purpose chat node.
#     Uses the full conversation history (minus routing messages).
#     """
#     messages = state["messages"]

#     # Build context: system prompt + all human/AI messages (skip routing)
#     chat_messages = [SystemMessage(content=CHAT_SYSTEM_PROMPT)]
#     for msg in messages:
#         if isinstance(msg, HumanMessage):
#             chat_messages.append(msg)
#         elif isinstance(msg, AIMessage) and msg.content not in ("task", "chat"):
#             chat_messages.append(msg)

#     response = chat_llm.invoke(chat_messages)
#     content = response.content
#     if isinstance(content, list):
#         content = content[0].get("text", "") if content else ""

#     return {"messages": [AIMessage(content=content)]}


def task_agent_node(state: AgentState) -> dict:
    """
    Task management agent node.
    Has access to task tools and can call them.
    """
    messages = state["messages"]

    # Build context: system prompt + conversation history + tool results
    task_messages = [SystemMessage(content=AMICA_SYSTEM_PROMPT)]
    for msg in messages:
        if isinstance(msg, HumanMessage):
            task_messages.append(msg)
        elif isinstance(msg, AIMessage):
            task_messages.append(msg)
        elif isinstance(msg, ToolMessage):
            task_messages.append(msg)

    response = task_llm.invoke(task_messages)
    return {"messages": [response]}


# ---------------------------------------------------------------------------
# Routing Logic
# ---------------------------------------------------------------------------
# def route_after_router(state: AgentState) -> Literal["chat_node", "task_agent"]:
#     """Route to chat or task agent based on router's classification."""
#     messages = state["messages"]
#     last_msg = messages[-1]

#     if isinstance(last_msg, AIMessage):
#         content = last_msg.content.strip().lower()
#         if "task" in content:
#             return "task_agent"

#     return "chat_node"


def should_continue_task(state: AgentState) -> Literal["tool_executor", "__end__"]:
    """Check if the task agent wants to call more tools or is done."""
    messages = state["messages"]
    last_msg = messages[-1]

    if isinstance(last_msg, AIMessage) and hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tool_executor"

    return "__end__"


# ---------------------------------------------------------------------------
# Build the LangGraph
# ---------------------------------------------------------------------------
def build_graph(checkpointer=None):
    """Build the multi-node LangGraph with task agent."""
    workflow = StateGraph(AgentState)

    # Add nodes
    # workflow.add_node("router", router_node)
    # workflow.add_node("chat_node", chat_node)
    workflow.add_node("task_agent", task_agent_node)
    workflow.add_node("tool_executor", ToolNode(task_tools))

    # Set entry point
    workflow.set_entry_point("task_agent")

    # Router → chat or task agent
    # workflow.add_conditional_edges(
    #     "router",
    #     route_after_router,
    #     {
    #         "chat_node": "chat_node",
    #         "task_agent": "task_agent",
    #     },
    # )

    # Chat node → END (removed — chat_node no longer exists)
    # workflow.add_edge("chat_node", END)

    # Task agent → tool executor or END
    workflow.add_conditional_edges(
        "task_agent",
        should_continue_task,
        {
            "tool_executor": "tool_executor",
            "__end__": END,
        },
    )

    # Tool executor → back to task agent (for multi-step tool usage)
    workflow.add_edge("tool_executor", "task_agent")

    # Compile with checkpointer for persistent memory
    return workflow.compile(checkpointer=checkpointer)


# ---------------------------------------------------------------------------
# Checkpointer & Graph Instances
# ---------------------------------------------------------------------------
_pool = None
_async_pool = None
_checkpointer = None
_async_checkpointer = None
graph = None          # Sync graph for /chat
graph_async = None    # Async graph for /chat/stream


def initialize_graph():
    """Initialize the graph with PostgreSQL checkpointer (sync + async)."""
    global _pool, _async_pool, _checkpointer, _async_checkpointer, graph, graph_async

    try:
        connection_kwargs = {
            "autocommit": True,
            "prepare_threshold": 0,
            "row_factory": dict_row,
        }
        _pool = ConnectionPool(
            conninfo=DATABASE_URL,
            max_size=20,
            kwargs=connection_kwargs,
        )
        _checkpointer = PostgresSaver(_pool)
        _checkpointer.setup()
        print("[OK] PostgreSQL sync checkpointer initialized.")
    except Exception as e:
        print(f"[WARN] Could not initialize PostgreSQL sync checkpointer: {e}")
        print("  Falling back to in-memory (no persistence) for sync.")
        _checkpointer = None

    try:
        _async_pool = AsyncConnectionPool(
            conninfo=DATABASE_URL,
            max_size=20,
            kwargs={
                "autocommit": True,
                "prepare_threshold": 0,
                "row_factory": dict_row,
            },
        )
        _async_checkpointer = AsyncPostgresSaver(_async_pool)
        # setup() for async checkpointer is done via async context;
        # the sync checkpointer's setup() already created the tables.
        print("[OK] PostgreSQL async checkpointer initialized.")
    except Exception as e:
        print(f"[WARN] Could not initialize PostgreSQL async checkpointer: {e}")
        print("  Streaming will fall back to sync.")
        _async_checkpointer = None

    graph = build_graph(checkpointer=_checkpointer)
    graph_async = build_graph(checkpointer=_async_checkpointer or _checkpointer)
    print("[OK] LangGraph compiled successfully (sync + async).")


def run_agent(user_message: str, thread_id: str = "default") -> str:
    """
    Run the agent graph with a user message and return the AI response.
    Uses thread_id for conversation persistence via PostgreSQL checkpointer.
    """
    if graph is None:
        initialize_graph()

    config = {"configurable": {"thread_id": thread_id}}

    result = graph.invoke(
        {"messages": [HumanMessage(content=user_message)]},
        config=config,
    )

    # Extract the last AI message
    ai_messages = [
        m for m in result["messages"]
        if isinstance(m, AIMessage) and m.content
    ]
    if ai_messages:
        content = ai_messages[-1].content
        if isinstance(content, list):
            content = content[0].get("text", "") if content else ""
        return content

    return "I'm sorry, I couldn't process that. Please try again."


# ---------------------------------------------------------------------------
# Streaming Support
# ---------------------------------------------------------------------------
async def stream_agent(user_message: str, thread_id: str = "default"):
    """
    Async generator that streams the agent's response token-by-token.
    Yields only the final AI text tokens (skips tool-call internals).

    Uses LangGraph's astream_events API (v2) which emits fine-grained
    events including 'on_chat_model_stream' for each token chunk.
    """
    if graph_async is None:
        initialize_graph()

    config = {"configurable": {"thread_id": thread_id}}
    inputs = {"messages": [HumanMessage(content=user_message)]}

    token_count = 0

    async for event in graph_async.astream_events(inputs, config=config, version="v2"):
        kind = event.get("event")

        # on_chat_model_stream fires for each token chunk from the LLM
        if kind == "on_chat_model_stream":
            chunk = event.get("data", {}).get("chunk")
            if chunk is None:
                continue

            # Skip chunks that are tool calls (no text content)
            if hasattr(chunk, "tool_call_chunks") and chunk.tool_call_chunks:
                continue

            # Also skip if tool_calls is populated (Gemini format)
            if hasattr(chunk, "tool_calls") and chunk.tool_calls:
                continue

            # Extract text content from the chunk
            content = chunk.content
            if isinstance(content, list):
                # Gemini sometimes returns list of content parts
                for part in content:
                    if isinstance(part, dict):
                        text = part.get("text", "")
                        if text:
                            token_count += 1
                            yield text
                    elif isinstance(part, str) and part:
                        token_count += 1
                        yield part
            elif isinstance(content, str) and content:
                token_count += 1
                yield content

    if token_count == 0:
        # Fallback: if streaming produced no tokens, run synchronously
        # and yield the full response as a single chunk
        print("[WARN] Streaming produced no tokens, falling back to sync run_agent.")
        fallback = run_agent(user_message, thread_id=thread_id)
        if fallback:
            yield fallback


if __name__ == "__main__":
    initialize_graph()
    print(run_agent("hello"))
    print("---")
    print(run_agent("Add a task: finish homework by tomorrow at 3pm, high priority"))
    print("---")
    print(run_agent("Show me all my tasks"))