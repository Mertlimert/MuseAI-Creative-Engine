# Assignment: LangGraph Integration Report

## 1. Project Goal

This project extends the existing **MuseAI** application without creating a new project.  
The previous **CrewAI** encounter mode remains active, and a second orchestration mode based on **LangGraph** is now available in the same live D&D encounter interface.

The objective of this integration is to show how a graph-based workflow can manage:

- clearly defined execution steps
- shared encounter state
- conditional branching for NPC activation
- structured outputs for frontend rendering

## 2. Implemented Features

- Added an **engine selector** in the Lore-Master encounter setup
- Preserved the original **CrewAI** encounter mode
- Added a **LangGraph workflow mode** that uses:
  - context preparation node
  - Game Master routing node
  - conditional NPC dialogue branch
  - final response assembly node
- Returned **workflow steps** to the frontend so the execution path is visible
- Added **LangSmith-ready environment variables** for tracing and debugging

## 3. LangGraph Workflow Design

The LangGraph implementation is located in `backend/langgraph_engine.py`.

### Step 1: Prepare Context
The graph collects:

- player stats
- story premise
- campaign history
- NPC history
- latest player action
- location context

This becomes the shared state for the rest of the workflow.

### Step 2: Game Master Node
The Game Master node produces a structured response with:

- `narration`
- `npcs_to_activate`

This keeps the encounter deterministic and easy to inspect.

### Step 3: Conditional NPC Branch
If the Game Master activates one or more NPCs, the graph moves to the NPC dialogue node.  
If no NPC reaction is needed, the graph skips directly to finalization.

### Step 4: Final Response Assembly
The graph returns a frontend-friendly payload:

- `gm_narration`
- `npc_reactions`
- `engine`
- `workflow_steps`

## 4. CrewAI and LangGraph Together

This project now supports two AI orchestration styles inside the same application:

- **CrewAI** for multi-agent role-based execution
- **LangGraph** for stateful, step-based workflow orchestration

Both use the same encounter UI and the same API contract, so they can be compared directly during demonstration.

## 5. Files Added or Updated

### Backend
- `backend/api.py`
- `backend/crew_engine.py`
- `backend/langgraph_engine.py`
- `backend/llm_factory.py`
- `backend/schemas.py`
- `backend/requirements.txt`
- `backend/.env.example`

### Frontend
- `index.html`
- `app.js`
- `style.css`

## 6. LangSmith Integration

LangSmith tracing is supported through environment variables:

- `LANGCHAIN_TRACING_V2=true`
- `LANGCHAIN_API_KEY=...`
- `LANGCHAIN_PROJECT=MuseAI-LangGraph`

This helps visualize which graph nodes ran, what state was passed forward, and when NPC branching occurred.

## 7. Suggested Screenshots for PDF

Add the following screenshots before exporting this file to PDF:

1. Encounter setup screen with the **engine selector**
2. A **CrewAI** encounter response
3. A **LangGraph** encounter response
4. LangGraph **workflow steps** shown in the chat
5. Optional: **LangSmith trace** of one run

## 8. Demo Talking Points

These are good points to explain in class:

1. Why CrewAI was kept instead of replaced
2. Why LangGraph is useful for step-based orchestration
3. How conditional branching activates NPC dialogue only when needed
4. How both engines return the same response structure to the frontend
5. How LangSmith can be used to inspect and debug the workflow

## 9. Conclusion

The project now satisfies the assignment requirement to include **LangGraph** in an existing project while keeping the previous **CrewAI** implementation working.  
The result is a hybrid AI encounter system where the same RPG scenario can be orchestrated through either agent-based execution or graph-based workflow control.
