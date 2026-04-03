from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from crew_engine import run_campaign_step

app = FastAPI(title="MuseAI Advanced D&D Campaign API")

# Setup CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CampaignRequest(BaseModel):
    player_stats: str
    story_premise: str
    campaign_history: str
    npc_histories: Dict[str, str]
    action: str
    location_context: str

@app.post("/api/action")
def perform_action(request: CampaignRequest):
    try:
        result = run_campaign_step(
            player_stats=request.player_stats,
            story_premise=request.story_premise,
            campaign_history=request.campaign_history,
            npc_histories=request.npc_histories,
            action=request.action,
            location_context=request.location_context
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
