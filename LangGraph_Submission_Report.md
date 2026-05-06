# MuseAI LangGraph Submission Report

## Student and Project Information

- Student: Mert Kedik
- Project: MuseAI - Creative Engine
- GitHub Account: https://github.com/Mertlimert
- Repository: https://github.com/Mertlimert/MuseAI-Creative-Engine.git
- Relevant Commit: `23e2172` - `Add LangGraph encounter workflow alongside CrewAI`

## 1. Assignment Coverage

This report explains how LangGraph was integrated into the existing MuseAI project without creating a new project. The previous CrewAI implementation was preserved, and both systems now work together in the same encounter interface.

The homework requirements were addressed as follows:

- LangGraph was added directly into the current project.
- Its purpose was understood and implemented as a stateful graph workflow.
- The work was committed to Git and linked through the repository above.
- The implementation uses clearly defined workflow steps.
- LangSmith support was prepared for tracing and debugging.
- CrewAI and LangGraph both remain available in the same application.
- This report includes screenshot sections and implementation details for records.

## 2. Why LangGraph Was Added

CrewAI already handled role-based multi-agent orchestration in the project. LangGraph was added to demonstrate a different orchestration approach based on explicit state transitions and graph nodes. This is useful for encounter systems because player input, campaign context, and NPC reactions can be passed through clearly defined steps.

LangGraph was chosen to support:

- explicit workflow definition
- shared encounter state
- conditional branching
- inspectable execution
- easier debugging and classroom explanation

## 3. Implementation Summary

The implementation was completed across both backend and frontend layers.

### Backend

- Added `backend/langgraph_engine.py`
- Updated `backend/api.py` to dispatch by selected engine
- Updated `backend/schemas.py` for shared request and response handling
- Updated `backend/llm_factory.py` for shared model setup
- Added LangSmith-ready environment configuration in `backend/.env.example`

### Frontend

- Added engine selection to the encounter interface
- Updated encounter rendering to support both CrewAI and LangGraph results
- Exposed workflow steps in the chat area
- Preserved the same player flow and UI structure

## 4. LangGraph Workflow Steps

The graph was designed with well-defined steps so it can be explained easily and inspected clearly.

### Step 1 - Prepare Context

The system collects:

- player stats
- story premise
- campaign history
- NPC history
- latest player action
- location context

This data becomes the shared encounter state.

### Step 2 - Game Master Node

The Game Master node evaluates the player action and returns structured output:

- `narration`
- `npcs_to_activate`

### Step 3 - Conditional NPC Branch

If NPCs should react, the graph moves to the NPC dialogue node. If not, it skips directly to finalization.

### Step 4 - Final Response Assembly

The final node returns a frontend-ready payload:

- `gm_narration`
- `npc_reactions`
- `engine`
- `workflow_steps`

## 5. CrewAI and LangGraph Together

The assignment specifically required that LangGraph be added into the existing project and work alongside CrewAI. This requirement was fully satisfied.

- No new project was created.
- CrewAI remains active.
- LangGraph is available as an additional engine.
- Both use the same encounter UI.
- Both use the same API contract and response structure.

This makes the system useful for direct comparison during demonstration.

## 6. LangSmith Integration

LangSmith support was prepared through environment variables:

- `LANGCHAIN_TRACING_V2=true`
- `LANGCHAIN_API_KEY=...`
- `LANGCHAIN_PROJECT=MuseAI-LangGraph`

This helps trace graph execution, inspect node transitions, and debug branching behavior.

## 7. Files Added or Updated

### Backend

- `backend/langgraph_engine.py`
- `backend/api.py`
- `backend/crew_engine.py`
- `backend/schemas.py`
- `backend/llm_factory.py`
- `backend/.env.example`
- `backend/requirements.txt`

### Frontend

- `index.html`
- `app.js`
- `style.css`

## 8. Screenshot Sections

Use or replace the following screenshots in the PDF version:

### Figure 1 - Encounter Setup

Show the encounter setup screen with the engine selector visible.

Suggested file:

- `assets/report/setup.png`

### Figure 2 - Chat Response

Show the encounter interface after narration is returned.

Suggested file:

- `assets/report/gm_ui.png`

### Figure 3 - NPC Reaction

Show NPC dialogue rendered in the shared chat area.

Suggested file:

- `assets/report/npc_ui.png`

### Figure 4 - Backend Processing

Show backend processing evidence from the terminal.

Suggested files:

- `assets/report/term_1.png`
- `assets/report/term_2.png`

## 9. Features Implemented

- LangGraph engine added into existing project
- shared frontend support for two orchestration engines
- state-based encounter graph
- conditional NPC branch
- structured output rendering
- workflow step visibility in frontend
- LangSmith-ready tracing configuration

## 10. Discussion Points for Class

- Why LangGraph fits this scenario
- Differences between CrewAI and LangGraph
- How conditional branching works
- How shared state moves through the graph
- How frontend rendering stays compatible for both engines

## 11. Conclusion

The final implementation satisfies the assignment by adding LangGraph into an existing project, preserving CrewAI, defining workflow steps clearly, and documenting the work with Git and screenshots. The result is a hybrid encounter system where the same live RPG flow can be orchestrated with either CrewAI or LangGraph.
