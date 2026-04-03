from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
import os
from dotenv import load_dotenv

load_dotenv()

@CrewBase
class DnDEncounterCrew():
    """DnD Encounter Crew for resolving actions and roleplaying"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def game_master(self) -> Agent:
        return Agent(
            config=self.agents_config['game_master'],
            verbose=True
        )

    @agent
    def npc_actor(self) -> Agent:
        return Agent(
            config=self.agents_config['npc_actor'],
            verbose=True
        )

    @task
    def resolve_action(self) -> Task:
        return Task(
            config=self.tasks_config['resolve_action']
        )

    @task
    def roleplay_reaction(self) -> Task:
        return Task(
            config=self.tasks_config['roleplay_reaction']
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )

def run_encounter(player_stats: str, action: str, location_context: str, npc_context: str):
    inputs = {
        'player_stats': player_stats,
        'action': action,
        'location_context': location_context,
        'npc_context': npc_context
    }
    dnd_crew = DnDEncounterCrew().crew()
    result = dnd_crew.kickoff(inputs=inputs)
    
    # We want to return the output of both tasks if possible, or just the final result.
    # By default, kickoff returns the final output (which is the NPC reaction).
    # To get GM narration, we can access the tasks output.
    
    gm_narration = ""
    npc_reaction = ""
    
    for task_output in dnd_crew.tasks:
        if task_output.agent.role == "Dungeon Master":
            gm_narration = task_output.output.raw_output
        elif task_output.agent.role == "NPC Actor in the Game World":
            npc_reaction = task_output.output.raw_output

    # Fallback if raw_output doesn't map exactly
    if not gm_narration and hasattr(result, "raw"):
        npc_reaction = result.raw
        gm_narration = "The Game Master processed your action."
        
    return {
        "gm_narration": gm_narration,
        "npc_reaction": npc_reaction
    }
