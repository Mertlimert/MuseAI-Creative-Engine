# Crew AI Implementation Report - MuseAI D&D Engine

## Project Context
This Crew AI project is fully integrated into **Homework 2 (MuseAI - Creative Engine)**, adding the core D&D Encounter functionality. Instead of separate CLI scripts, the AI engine directly powers the **"Active Encounter"** feature inside the MuseAI web application. 

The application uses a **FastAPI Python backend** to manage the Crew, which receives character (player_stats), location (location_context), and NPC persona via a REST API from the pure JavaScript frontend.

## 1. Agents Configuration (`config/agents.yaml`)

```yaml
game_master:
  role: "Dungeon Master"
  goal: "Orchestrate the D&D encounter, evaluate the player's action ({action}) based on their character stats ({player_stats}) and the location details ({location_context}), and set up the narrative outcome for the NPC."
  backstory: >
    You are an impartial, highly creative, and dramatic Game Master. You know the rules of the world perfectly. 
    You look at the player's stats: Strength, Intellect, Agility, and Charisma.
    When a player takes an action, you calculate the likely success and narrate the immediate environmental and physical results.
    You do NOT speak for the NPC; you only set the stage so the NPC can react.
    You must always provide a brief, engaging narration of what happens to the player.

npc_actor:
  role: "NPC Actor in the Game World"
  goal: "Respond directly to the player's action ({action}) in character, taking into account the Game Master's narration."
  backstory: >
    You are an NPC. Your current persona is: {npc_context}.
    You are currently located in: {location_context}.
    You just witnessed the player's action and the events narrated by the Game Master.
    You must react exactly as this NPC would. Speak in character!
    Do not break the fourth wall. Do not act as an AI. 
    Show emotion based on whether the player succeeded or failed in their action.
```

## 2. Tasks Configuration (`config/tasks.yaml`)

```yaml
resolve_action:
  description: >
    Evaluate the player's action.
    Player stats: {player_stats}
    Player action: "{action}"
    Location: {location_context}
    
    1. Read the player's action carefully.
    2. Determine if it succeeds based on their stats.
    3. Write a vivid narration of the outcome.
  expected_output: >
    A dramatic narration (1-2 paragraphs) from the Game Master detailing the immediate result of the player's action.
  agent: game_master

roleplay_reaction:
  description: >
    React to the Game Master's narration and the player's action.
    NPC Persona: {npc_context}
    
    1. Read the GM's narration.
    2. Produce your in-character dialogue or action as the NPC.
  expected_output: >
    The exact words spoken by the NPC and their physical reaction, presented in character (1 paragraph).
  agent: npc_actor
```

## 3. Kickoff Code Snippet (`crew_engine.py`)

Using the class-based CrewAI structure, we initialize and kick off the tasks sequentially. The results from both tasks are parsed and sent back to the frontend to render the chat.

```python
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

@CrewBase
class DnDEncounterCrew():
    """DnD Encounter Crew for resolving actions and roleplaying"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def game_master(self) -> Agent:
        return Agent(config=self.agents_config['game_master'], verbose=True)

    @agent
    def npc_actor(self) -> Agent:
        return Agent(config=self.agents_config['npc_actor'], verbose=True)

    @task
    def resolve_action(self) -> Task:
        return Task(config=self.tasks_config['resolve_action'])

    @task
    def roleplay_reaction(self) -> Task:
        return Task(config=self.tasks_config['roleplay_reaction'])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )

def run_encounter(player_stats, action, location_context, npc_context):
    inputs = {
        'player_stats': player_stats,
        'action': action,
        'location_context': location_context,
        'npc_context': npc_context
    }
    dnd_crew = DnDEncounterCrew().crew()
    result = dnd_crew.kickoff(inputs=inputs)
    
    # Returning parsed values...
```

## 4. Environment (.env / cfg) & LLM Details
The system connects to OpenRouter via Langchain mapped through `OPENAI_API_BASE`.

```text
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_API_KEY=your_openrouter_api_key_here
OPENAI_MODEL_NAME=openai/gpt-4o-mini
```

## 5. Screen Implementation Flow (Explanation)
Instead of static images, here is the UI functionality in the built application:
1. **Setup Screen:** The user navigates to the "Lore-Master AI" module. They pick a pre-generated specific character and location from dropdowns. They input an NPC persona (e.g. `A grumpy goblin merchant selling suspicious potions`).
2. **Chat Interface:** Click "Start Encounter". It switches to a live chat UI.
3. **Player Action:** The user types an action: `"I try to intimidate the goblin with my high strength."`
4. **CrewAI Magic:** The Python FastAPI backend receives this via an HTTP Request. The `Game Master` agent calculates the success based on stats, rules, and location context. Then, the `NPC Actor` agent takes this context and generates direct dialogue.
5. **UI Rendering:** Both agents' responses populate the chat interface.

## Git URL
The project has been pushed to the main branch of:
`https://github.com/Mertlimert/MuseAI-Creative-Engine.git`
