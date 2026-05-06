from typing import Any, Dict, List, Literal

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
    character_name: str = ""
    location_name: str = ""
    language: Literal["en", "tr"] = "en"
    engine: Literal["crewai", "langgraph"] = "crewai"


class MCPDemoRequest(BaseModel):
    character_name: str
    location_name: str
    story_premise: str = ""


class MCPCharacterGenerateRequest(BaseModel):
    genre: str = "fantasy"
    role_type: str = "NPC"
    theme: str = "balanced"
    language: Literal["en", "tr"] = "en"


class MCPLocationGenerateRequest(BaseModel):
    genre: str = "fantasy"
    location_type: str = "city"
    mood: str = "mysterious"
    language: Literal["en", "tr"] = "en"


class MCPRollCheckRequest(BaseModel):
    stat_name: str = "strength"
    stat_value: int = 50
    difficulty_class: int = 12
    language: Literal["en", "tr"] = "en"


class MCPCombatStartRequest(BaseModel):
    player_name: str = "Player"
    player_stats: Dict[str, Any] = Field(default_factory=dict)
    enemy_kind: str = "guard"
    ally_kind: str = ""
    location_name: str = ""
    language: Literal["en", "tr"] = "en"


class MCPCombatAdvanceRequest(BaseModel):
    combat_state: Dict[str, Any] = Field(default_factory=dict)
    player_action: str
    player_stats: Dict[str, Any] = Field(default_factory=dict)
    language: Literal["en", "tr"] = "en"


class MCPCombatEndRequest(BaseModel):
    combat_state: Dict[str, Any] = Field(default_factory=dict)
    reason: str = "manual"
    language: Literal["en", "tr"] = "en"
