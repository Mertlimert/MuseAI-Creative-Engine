from typing import List, Optional
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
import os
from dotenv import load_dotenv

load_dotenv()

# --- Pydantic Models for Structured Output ---
class NPCRequest(BaseModel):
    name: str = Field(description="The name of the NPC.")
    persona: str = Field(description="The NPC's personality and backstory.")
    instruction_for_npc: str = Field(description="Specific instructions for what the NPC should react to or say.")

class GMResponse(BaseModel):
    narration: str = Field(description="The Game Master's narration of the environment, action outcomes, and events.")
    npcs_to_activate: List[NPCRequest] = Field(description="List of NPCs that need to speak or react in this turn.", default=[])


# --- Game Master Crew ---
@CrewBase
class DnDGameMasterCrew():
    """Crew responsible for GM narration and routing"""
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def game_master(self) -> Agent:
        return Agent(
            config=self.agents_config['game_master'],
            verbose=True
        )

    @task
    def resolve_action(self) -> Task:
        return Task(
            config=self.tasks_config['resolve_action'],
            output_pydantic=GMResponse
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )

# --- Dynamic NPC Generator ---
def run_npc_subagent(npc: NPCRequest, gm_narration: str, player_action: str, specific_npc_history: str) -> str:
    """Spins up a specialized Agent just for this NPC on the fly."""
    
    npc_agent = Agent(
        role=f"{npc.name}",
        goal=f"React and speak strictly as {npc.name}.",
        backstory=f"You are {npc.name}. {npc.persona}\n\nPast interactions with the player:\n{specific_npc_history}",
        verbose=True
    )
    
    npc_task = Task(
        description=f"""
The Game Master just narrated: "{gm_narration}"
The player just did/said: "{player_action}"

Your instruction from the GM: {npc.instruction_for_npc}

Respond in character. Only output your exact words and physical actions. Do not narrate the rest of the world. Do NOT output a JSON, just the text.
""",
        expected_output="A single paragraph of in-character dialogue and action.",
        agent=npc_agent
    )
    
    mini_crew = Crew(
        agents=[npc_agent],
        tasks=[npc_task],
        process=Process.sequential,
        verbose=True
    )
    
    result = mini_crew.kickoff()
    return result.raw if hasattr(result, "raw") else str(result)
    

# --- Main Engine Entrypoint ---
def run_campaign_step(player_stats: str, story_premise: str, campaign_history: str, npc_histories: dict, action: str, location_context: str):
    inputs = {
        'player_stats': player_stats,
        'location_context': location_context,
        'story_premise': story_premise,
        'campaign_history': campaign_history,
        'action': action,
    }
    
    # Pass 1: The Game Master decides what happens
    gm_crew = DnDGameMasterCrew().crew()
    gm_result = gm_crew.kickoff(inputs=inputs)
    
    # We expect a pydantic object back because we used output_pydantic
    if not hasattr(gm_result, "pydantic") or not gm_result.pydantic:
        # Fallback if the LLM failed to format perfectly
        return {
            "gm_narration": gm_result.raw if hasattr(gm_result, "raw") else "The GM processed your action.",
            "npc_reactions": []
        }
        
    structured_gm: GMResponse = gm_result.pydantic
    
    final_npc_dialogues = []
    
    # Pass 2: Dynamically spawn NPC Agents if requested
    for npc_req in structured_gm.npcs_to_activate:
        specific_history = npc_histories.get(npc_req.name, "No previous interactions.")
        npc_reply = run_npc_subagent(
            npc=npc_req, 
            gm_narration=structured_gm.narration,
            player_action=action,
            specific_npc_history=specific_history
        )
        
        final_npc_dialogues.append({
            "name": npc_req.name,
            "dialogue": npc_reply
        })
        
    return {
        "gm_narration": structured_gm.narration,
        "npc_reactions": final_npc_dialogues
    }
