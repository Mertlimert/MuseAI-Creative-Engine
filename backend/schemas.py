from typing import Dict, List, Literal

from pydantic import BaseModel, Field


class NPCRequest(BaseModel):
    name: str = Field(description="The name of the NPC.")
    persona: str = Field(description="The NPC's personality and backstory.")
    instruction_for_npc: str = Field(
        description="Specific instructions for what the NPC should react to or say."
    )


class GMResponse(BaseModel):
    narration: str = Field(
        description="The Game Master's narration of the environment, action outcomes, and events."
    )
    npcs_to_activate: List[NPCRequest] = Field(
        description="List of NPCs that need to speak or react in this turn.",
        default_factory=list,
    )


class CampaignRequest(BaseModel):
    player_stats: str
    story_premise: str
    campaign_history: str
    npc_histories: Dict[str, str]
    action: str
    location_context: str
    engine: Literal["crewai", "langgraph"] = "crewai"
