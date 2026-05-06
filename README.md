# MuseAI Creative Engine

MuseAI is a browser-based RPG story creation and live encounter assistant. The project started as a creative writing dashboard, then evolved into a hybrid AI game engine that supports CrewAI, LangGraph, MCP, Turkish mode, generated characters/locations, real dice checks, and lightweight combat mechanics.

The current version does not create a separate project for each AI technology. CrewAI, LangGraph, and MCP all run inside the same existing MuseAI project and share the same frontend, FastAPI backend, character data, location data, and encounter UI.

## Main Features

| Area | What It Does |
| --- | --- |
| World Hub | Stores story universes with genre, description, images, and quick stats. |
| Character Forge | Creates and edits characters with class, race, level, traits, backstory, and stats. |
| Quest Ledger | Tracks quests, status, milestones, and narrative progress. |
| Location Forge | Stores locations with mood, danger level, features, and description. |
| Lore-Master AI | Runs live RPG encounters through CrewAI or LangGraph. |
| Turkish Mode | Localizes the UI and instructs AI outputs to speak in Turkish when selected. |
| LangGraph Workflow | Uses a stateful graph with defined nodes and workflow steps. |
| CrewAI Workflow | Uses a Game Master agent and dynamic NPC-style responses. |
| MCP Integration | Exposes project context, generation tools, dice checks, and combat mechanics through an MCP server. |
| Real Dice and Combat | Rolls real d20 checks, applies stat modifiers, tracks HP, enemies, allies, damage, and combat end state. |

## Quick Start

### Requirements

- Python 3.11 or newer
- A modern browser
- OpenAI-compatible API key, for example OpenAI or OpenRouter
- Windows PowerShell is recommended for the included helper scripts

### Run With Helper Script

From the project root:

```powershell
.\run-dev.ps1
```

Or double-click:

```text
run-dev.bat
```

The helper starts:

| Service | URL |
| --- | --- |
| Frontend static server | `http://127.0.0.1:8080` |
| FastAPI backend | `http://127.0.0.1:8000` |

### Manual Run

Terminal A, backend:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python.exe -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

Terminal B, frontend:

```powershell
cd C:\Users\EXCALIBUR\Desktop\AIRPG
backend\.venv\Scripts\python.exe -m http.server 8080 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8080
```

## Environment

Copy `backend/.env.example` to `backend/.env` and fill the values you need.

Important variables:

```env
OPENAI_API_KEY=your_key_here
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_MODEL_NAME=openrouter/model-id-here
OPENAI_MAX_TOKENS=1200

LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=MuseAI-LangGraph

MUSEAI_MCP_PYTHON=
```

Notes:

- `OPENAI_MAX_TOKENS` is intentionally configurable because some OpenRouter models request very large output limits by default.
- `MUSEAI_MCP_PYTHON` can be used if the MCP server should run with a specific Python executable.
- `.env`, virtual environments, logs, cache files, screenshots, and generated local artifacts should not be committed.

## Architecture Overview

MuseAI has three main layers:

```text
Browser UI
-> Vanilla JavaScript app.js
-> FastAPI backend
-> CrewAI / LangGraph / MCP tools
-> LLM provider
```

### Frontend Layer

The frontend is a single-page application built with plain HTML, CSS, and JavaScript.

| Module | Role |
| --- | --- |
| `DataStore` | Single source of truth for local data and localStorage persistence. |
| `Renderer` | Converts state into UI HTML. |
| `Controller` | Handles user actions, page behavior, modals, and encounter flow. |
| `Router` | Switches between app pages without a full reload. |
| `Language` | Controls English/Turkish UI text and selected language. |
| `AIGenerator` | Generates character and location seeds, now MCP-backed. |

The Lore-Master chat sends the selected character, location, story premise, player action, language, and selected engine to the backend.

### Backend Layer

The backend is a FastAPI application in `backend/api.py`.

| File | Role |
| --- | --- |
| `backend/api.py` | Public HTTP API for action, MCP demo, generation, dice, and combat. |
| `backend/schemas.py` | Pydantic request/response contracts. |
| `backend/crew_engine.py` | CrewAI encounter engine. |
| `backend/langgraph_engine.py` | LangGraph encounter engine. |
| `backend/llm_factory.py` | Shared LLM configuration. |
| `backend/museai_context.py` | Shared project context, generators, dice rules, and combat rules. |
| `backend/mcp_server.py` | FastMCP server exposing MuseAI tools. |
| `backend/mcp_client.py` | MCP stdio client used by FastAPI and LangGraph. |
| `backend/narration_tone.py` | Tone and language instructions. |
| `backend/response_style_guard.py` | Final response cleanup for plain style and Turkish mode. |

## Encounter Flow

When the player sends an action in the chat:

```text
Player writes action
-> Frontend detects whether the action needs dice/combat mechanics
-> If needed, frontend calls MCP mechanics endpoint first
-> MCP returns real d20 result and/or combat state
-> Frontend shows MCP Mechanics card with roll and HP bars
-> Mechanics summary is appended to campaign history
-> Frontend calls /api/action
-> Backend runs CrewAI or LangGraph
-> AI narrates the result using the real mechanical outcome
-> Frontend shows narration, workflow steps, MCP context, and NPC replies
```

This is important because dice, HP, hit/miss, damage, and combat end are no longer only text generated by the LLM. They are structured game-state results created before the AI narration.

## CrewAI Mode

CrewAI mode is useful for demonstrating multi-agent behavior.

Flow:

```text
Frontend action
-> /api/action
-> CrewAI Game Master agent
-> Structured GM narration
-> Dynamic NPC reactions when needed
-> Response style guard
-> Final payload
```

CrewAI returns:

- `gm_narration`
- `npc_reactions`
- `workflow_steps`
- `engine = crewai`

## LangGraph Mode

LangGraph mode is useful for demonstrating a clearly defined workflow with nodes and state transitions.

Current graph:

```text
START
-> prepare_context
-> game_master_node
-> npc_dialogue_node when NPCs are active
-> style_guard_node
-> finalize_response_node
-> END
```

Why LangGraph is effective here:

- Steps are explicit and easy to discuss in class.
- The graph keeps a shared encounter state.
- Conditional branching decides whether NPC dialogue is needed.
- MCP context is injected before the Game Master node.
- The frontend displays LangGraph workflow steps after each response.

## MCP Integration

MCP stands for Model Context Protocol. In this project, MCP acts as a standard tool layer between the AI workflows and the MuseAI project data.

The MCP server exposes reusable tools instead of hiding everything inside prompts.

### MCP Context and Generation Tools

| Tool | Purpose |
| --- | --- |
| `get_character(name)` | Returns structured character context. |
| `get_location(name)` | Returns structured location context. |
| `search_project_lore(query)` | Searches demo lore data. |
| `get_encounter_context(character_name, location_name, story_premise)` | Returns character, location, lore hints, and prompt context. |
| `generate_character(genre, role_type, theme, language)` | Generates a playable character seed. |
| `generate_location(genre, location_type, mood, language)` | Generates a playable location seed. |

### MCP Dice and Combat Tools

| Tool | Purpose |
| --- | --- |
| `roll_check(stat_name, stat_value, difficulty_class, language)` | Rolls a real d20 and applies a stat modifier. |
| `start_combat(player_name, player_stats_json, enemy_kind, ally_kind, location_name, language)` | Starts combat with initiative, HP, enemy, and optional ally. |
| `advance_combat(combat_state_json, player_action, player_stats_json, language)` | Advances one combat round with hit/miss, damage, enemy response, ally support, and reinforcements. |
| `end_combat(combat_state_json, reason, language)` | Ends combat and returns final state. |

### MCP Demo Endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /api/mcp/demo` | Shows context tool process in the UI. |
| `POST /api/mcp/generate-character` | Powers AI character generation. |
| `POST /api/mcp/generate-location` | Powers AI location generation. |
| `POST /api/mcp/roll-check` | Performs a visible real dice check. |
| `POST /api/mcp/combat/start` | Starts combat state. |
| `POST /api/mcp/combat/advance` | Advances combat state. |
| `POST /api/mcp/combat/end` | Ends combat state. |

## Real Dice and Combat System

The current combat system is intentionally lightweight but real.

Mechanics:

- A d20 is rolled using Python random system entropy.
- Character stats affect results through modifiers.
- Natural 20 is a critical success.
- Natural 1 is a critical failure.
- Enemy armor class controls hit/miss.
- Damage reduces HP.
- Enemy can retaliate.
- Allies can support.
- Reinforcements can be added during active combat.
- Combat ends when enemies are defeated, player HP reaches zero, or the player ends combat.

Example chat actions:

```text
Muhafizi ikna etmeye calisiyorum
Kilicimla muhafiza saldiriyorum
Dost yardim cagiriyorum, baska dusman takviye geldi
Savasi bitiriyorum
```

The frontend displays an MCP Mechanics card with:

- MCP tool name and transport
- d20 roll
- modifier and total
- DC
- outcome
- HP bars
- combat log

## Turkish Mode

The language selector controls both UI and AI behavior.

When Turkish mode is active:

- UI labels switch to Turkish.
- Character/location generation requests Turkish content.
- Backend prompts ask the AI to answer in Turkish.
- Response style guard keeps narration plain and readable.
- Proper names such as `Lady Mirabel`, `Silverpeak Citadel`, or character names are preserved.

## Suggested Demo Script

1. Start backend and frontend.
2. Open `http://127.0.0.1:8080`.
3. Switch language to Turkish.
4. Go to Lore-Master AI.
5. Select a character such as `Derya Demir` or `Baran Koroglu`.
6. Select a location such as `Yerebatan Arsivi`.
7. Write a premise.
8. Click MCP demo and explain the returned context.
9. Start a LangGraph encounter and show the workflow steps.
10. Send a skill action and show the dice card.
11. Send a combat action and show HP bars.
12. Send a reinforcement action and show ally/enemy count changing.
13. Switch to CrewAI and show that the same frontend and MCP mechanics still work.

## Development Analysis and Future Improvements

The project is now strong for class demonstration because it shows multiple AI orchestration styles and a visible MCP process. The most valuable next improvements would be:

| Improvement | Why It Would Help |
| --- | --- |
| Persistent campaign saves | Current encounter history lives mainly in the active browser session. Saving runs would make campaigns replayable. |
| Inventory and equipment | Weapons, armor, potions, and relics could affect dice rolls and combat damage. |
| Initiative turn order | Combat currently advances round-by-round. A visible initiative queue would feel more tabletop-like. |
| Enemy generator MCP tool | MCP could generate enemies based on location danger and story premise. |
| Quest progress integration | Dice/combat outcomes could automatically update quest milestones. |
| LangSmith tracing dashboard | Useful for showing graph/tool calls in class and debugging AI behavior. |
| Automated tests | Unit tests for MCP mechanics and API endpoint tests would make changes safer. |
| Saveable combat state | Combat state currently round-trips through the frontend; saving it backend-side would support reload recovery. |
| Better model routing | Cheaper models can handle simple narration, stronger models can handle complex story turns. |
| Richer Turkish content packs | More Turkish places, NPCs, enemy types, and idiomatic plain-language narration would improve immersion. |

## Project Structure

```text
AIRPG/
|-- index.html
|-- style.css
|-- app.js
|-- README.md
|-- run-dev.ps1
|-- run-dev.bat
|-- backend/
|   |-- api.py
|   |-- schemas.py
|   |-- crew_engine.py
|   |-- langgraph_engine.py
|   |-- llm_factory.py
|   |-- mcp_client.py
|   |-- mcp_server.py
|   |-- museai_context.py
|   |-- narration_tone.py
|   |-- response_style_guard.py
|   |-- requirements.txt
|   |-- .env.example
|   `-- config/
|       |-- agents.yaml
|       |-- tasks.yaml
|       |-- agents_tr.yaml
|       `-- tasks_tr.yaml
|-- assets/
|   `-- images/
`-- reports and assignment notes
```

## Reports

Additional notes are available in:

- `LangGraph_Submission_Report.md`
- `MCP_Report.md`
- `MuseAI_LangGraph_Submission_Report.pdf`

## Git Hygiene

The repository should track source code, documentation, configuration examples, scripts, and useful assignment reports.

The repository should not track:

- `.env`
- `.venv`
- `__pycache__`
- `*.pyc`
- logs
- temporary screenshots
- generated local report assets
- OS files such as `Thumbs.db`

## Author

Mert Kedik
