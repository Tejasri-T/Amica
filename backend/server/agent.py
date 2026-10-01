"""
Amica — AI-Powered Personal Life Assistant
LangGraph Agent with a single ChatNode using a Dummy LLM.
"""

from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import operator


load_dotenv()


# ---------------------------------------------------------------------------
# State schema
# ---------------------------------------------------------------------------
class AgentState(TypedDict):
    """Minimal state: just a list of chat messages."""
    messages: Annotated[Sequence[BaseMessage], operator.add]



# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------

llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite")


# ---------------------------------------------------------------------------
# Graph Node
# ---------------------------------------------------------------------------
def chat_node(state: AgentState) -> dict:
    """
    The single chat node in the graph.
    Takes the last user message and produces a dummy AI response.
    """
    messages = state["messages"]
    

    # user_text = last_message.content if isinstance(last_message.content, str) else str(last_message.content)
    response_text = llm.invoke(messages).content[0]['text']

    return {"messages": [AIMessage(content=response_text)]}


# ---------------------------------------------------------------------------
# Build the LangGraph
# ---------------------------------------------------------------------------
def build_graph():
    """Build a minimal LangGraph with a single ChatNode."""
    workflow = StateGraph(AgentState)

    # Add the single node
    workflow.add_node("chat", chat_node)

    # Set entry point and edge
    workflow.set_entry_point("chat")
    workflow.add_edge("chat", END)

    # Compile
    return workflow.compile()


# Singleton graph instance
graph = build_graph()


def run_agent(user_message: str) -> str:
    """
    Run the agent graph with a user message and return the AI response.
    """
    result = graph.invoke({
        "messages": [HumanMessage(content=user_message)]
    })

    # Extract the last AI message
    ai_messages = [m for m in result["messages"] if isinstance(m, AIMessage)]
    if ai_messages:
        return ai_messages[-1].content
    return "I'm sorry, I couldn't process that. Please try again."

if __name__=="__main__":
    print("hey")
    run_agent("hello")