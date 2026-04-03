from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crew_engine import run_encounter

app = FastAPI(title="MuseAI DnD Encounter API")

# Setup CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EncounterRequest(BaseModel):
    player_stats: str
    action: str
    location_context: str
    npc_context: str

@app.post("/api/action")
def perform_action(request: EncounterRequest):
    try:
        # Run the crew AI
        result = run_encounter(
            player_stats=request.player_stats,
            action=request.action,
            location_context=request.location_context,
            npc_context=request.npc_context
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
