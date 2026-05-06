# MuseAI MCP Integration Notes

## Purpose

MCP stands for Model Context Protocol. In this project, MCP is used as a standard bridge between the AI workflow and MuseAI project data. Instead of putting all context directly into a prompt, the backend can call an MCP tool and receive structured character, location, and lore context.

## What Was Added

- `backend/museai_context.py`: shared project context provider for characters, locations, and lore hints
- `backend/mcp_server.py`: MuseAI Context MCP Server using FastMCP tools
- `backend/mcp_client.py`: backend MCP client that calls the server over stdio
- `/api/mcp/demo`: FastAPI endpoint that demonstrates the MCP tool call visibly
- `/api/mcp/generate-character`: MCP-backed AI character generator endpoint
- `/api/mcp/generate-location`: MCP-backed AI location generator endpoint
- `/api/mcp/roll-check`: MCP-backed real d20 stat check endpoint
- `/api/mcp/combat/start`: starts combat and returns initiative, HP, enemies, and allies
- `/api/mcp/combat/advance`: advances one combat round with dice, damage, enemy response, HP updates, ally support, and enemy reinforcements
- `/api/mcp/combat/end`: ends the current combat state cleanly
- LangGraph `prepare_context` node now calls MCP before the Game Master node
- LangGraph includes a response style guard node for plain language and selected UI language
- Frontend "MCP Context Demo" panel shows the process and returned result
- Frontend AI Character and AI Location modals now request generated seeds through MCP first
- Frontend chat now shows MCP Mechanics cards for dice rolls, combat rounds, and HP bars

## MCP Tools

The MCP server exposes these tools:

- `get_character(name)`
- `get_location(name)`
- `search_project_lore(query)`
- `get_encounter_context(character_name, location_name, story_premise)`
- `generate_character(genre, role_type, theme, language)`
- `generate_location(genre, location_type, mood, language)`
- `roll_check(stat_name, stat_value, difficulty_class, language)`
- `start_combat(player_name, player_stats_json, enemy_kind, ally_kind, location_name, language)`
- `advance_combat(combat_state_json, player_action, player_stats_json, language)`
- `end_combat(combat_state_json, reason, language)`

## Runtime Flow

```text
Frontend selection
-> FastAPI backend
-> MCP client
-> MuseAI Context MCP Server
-> get_encounter_context tool
-> structured character/location/lore result
-> LangGraph prepare_context node
-> Game Master node
-> response style guard node
-> final encounter response
```

Combat and dice flow:

```text
Player action in chat
-> Frontend detects dice/combat intent
-> FastAPI mechanics endpoint
-> MCP client
-> MuseAI Context MCP Server
-> roll_check / start_combat / advance_combat tool
-> structured d20 result + HP state
-> frontend MCP Mechanics card
-> mechanics summary added to campaign history
-> CrewAI or LangGraph narrates using the mechanical result
```

## Why It Helps

- AI context access becomes standardized and reusable.
- LangGraph can use context without hardcoding all data directly into the node prompt.
- The MCP process is visible in the UI through the demo panel and in LangGraph workflow steps.
- Character and location generation now goes through MCP, so the same context server supports both retrieval and creation.
- Dice and combat are resolved outside the LLM, so a natural 1, natural 20, hit, miss, damage, or HP change is a real structured result instead of only generated text.
- The same MCP tools can later be reused by CrewAI or other AI components.
- Turkish UI mode keeps the generated content in Turkish while preserving proper names such as `Lady Mirabel` or `Silverpeak Citadel`.

## Demo Steps for Class

1. Start the backend and frontend.
2. Open Lore-Master AI.
3. Select `Aethelgard the Wise` and `Silverpeak Citadel`.
4. Enter a story premise.
5. Click `Run MCP Demo`.
6. Show the tool name, transport, input, character result, location result, process, and lore hints.
7. Start a LangGraph encounter.
8. Show that the chat includes MCP context, LangGraph workflow steps, and the response style guard step.
9. Type a skill action such as `Muhafizi ikna etmeye calisiyorum` and show the MCP Mechanics dice card.
10. Type a combat action such as `Kilicimla muhafiza saldiriyorum` and show `start_combat`, `advance_combat`, d20 roll, HP bars, and damage.
11. While combat is active, type `Dost yardim cagiriyorum, baska dusman takviye geldi` and show that MCP adds an ally and a second enemy to the combat state.

## Short Explanation Script

```text
MCP is the Model Context Protocol. We use it as a standard tool layer between our AI workflow and our project data. In our project, LangGraph does not only rely on the frontend prompt. Its prepare_context node calls a MuseAI MCP tool named get_encounter_context. The MCP server returns structured character, location, and lore data. We also use MCP for real RPG mechanics: roll_check performs a real d20 roll, and combat tools start and advance fights with HP updates. This makes both context and game mechanics visible, reusable, and easier to debug.
```
