from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from crew_engine import run_campaign_step
from langgraph_engine import run_langgraph_campaign_step
from mcp_client import (
    advance_combat_via_mcp,
    end_combat_via_mcp,
    generate_character_via_mcp,
    generate_location_via_mcp,
    get_encounter_context_via_mcp,
    roll_check_via_mcp,
    start_combat_via_mcp,
)
from schemas import (
    CampaignRequest,
    MCPCharacterGenerateRequest,
    MCPCombatAdvanceRequest,
    MCPCombatEndRequest,
    MCPCombatStartRequest,
    MCPDemoRequest,
    MCPLocationGenerateRequest,
    MCPRollCheckRequest,
)

app = FastAPI(title="MuseAI Advanced D&D Campaign API")

# Setup CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/action")
def perform_action(request: CampaignRequest):
    try:
        if request.engine == "langgraph":
            result = run_langgraph_campaign_step(
                player_stats=request.player_stats,
                story_premise=request.story_premise,
                campaign_history=request.campaign_history,
                npc_histories=request.npc_histories,
                action=request.action,
                location_context=request.location_context,
                character_name=request.character_name,
                location_name=request.location_name,
                language=request.language,
            )
        else:
            result = run_campaign_step(
                player_stats=request.player_stats,
                story_premise=request.story_premise,
                campaign_history=request.campaign_history,
                npc_histories=request.npc_histories,
                action=request.action,
                location_context=request.location_context,
                language=request.language,
            )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/demo")
def run_mcp_demo(request: MCPDemoRequest):
    try:
        result = get_encounter_context_via_mcp(
            character_name=request.character_name,
            location_name=request.location_name,
            story_premise=request.story_premise,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/generate-character")
def generate_character_from_mcp(request: MCPCharacterGenerateRequest):
    try:
        result = generate_character_via_mcp(
            genre=request.genre,
            role_type=request.role_type,
            theme=request.theme,
            language=request.language,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/generate-location")
def generate_location_from_mcp(request: MCPLocationGenerateRequest):
    try:
        result = generate_location_via_mcp(
            genre=request.genre,
            location_type=request.location_type,
            mood=request.mood,
            language=request.language,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/roll-check")
def roll_check_from_mcp(request: MCPRollCheckRequest):
    try:
        result = roll_check_via_mcp(
            stat_name=request.stat_name,
            stat_value=request.stat_value,
            difficulty_class=request.difficulty_class,
            language=request.language,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/combat/start")
def start_combat_from_mcp(request: MCPCombatStartRequest):
    try:
        result = start_combat_via_mcp(
            player_name=request.player_name,
            player_stats=request.player_stats,
            enemy_kind=request.enemy_kind,
            ally_kind=request.ally_kind,
            location_name=request.location_name,
            language=request.language,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/combat/advance")
def advance_combat_from_mcp(request: MCPCombatAdvanceRequest):
    try:
        result = advance_combat_via_mcp(
            combat_state=request.combat_state,
            player_action=request.player_action,
            player_stats=request.player_stats,
            language=request.language,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/mcp/combat/end")
def end_combat_from_mcp(request: MCPCombatEndRequest):
    try:
        result = end_combat_via_mcp(
            combat_state=request.combat_state,
            reason=request.reason,
            language=request.language,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
