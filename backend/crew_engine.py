from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from llm_factory import create_crewai_llm
from narration_tone import get_language_and_tone_instruction
from response_style_guard import guard_response_text
from schemas import GMResponse, NPCRequest

my_llm = create_crewai_llm()


# --- Game Master Crew (English) ---
@CrewBase
class DnDGameMasterCrew():
    """Crew responsible for GM narration and routing (EN yaml)."""
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def game_master(self) -> Agent:
        return Agent(
            config=self.agents_config['game_master'],
            llm=my_llm,
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


# --- Game Master Crew (Türkçe yaml) ---
@CrewBase
class DnDGameMasterCrewTr():
    """Aynı şema, TR config dosyaları."""
    agents_config = 'config/agents_tr.yaml'
    tasks_config = 'config/tasks_tr.yaml'

    @agent
    def game_master(self) -> Agent:
        return Agent(
            config=self.agents_config['game_master'],
            llm=my_llm,
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
def run_npc_subagent(
    npc: NPCRequest,
    gm_narration: str,
    player_action: str,
    specific_npc_history: str,
    language_instruction: str,
    language: str = "en",
) -> str:
    """Spins up a specialized Agent just for this NPC on the fly."""
    lang = language if language in ("en", "tr") else "en"
    is_tr = lang == "tr"
    if is_tr:
        backstory = (
            f"Sen, {npc.name} karakterisin. {npc.persona}\n\n"
            f"Üslup: {language_instruction}\n\n"
            f"Oyuncu ile geçmiş etkileşimler:\n{specific_npc_history}"
        )
        task_desc = f"""
Oyun Ustası şunu anlattı: «{gm_narration}»
Oyuncu şunu yaptı / dedi: «{player_action}»

Oyun Ustasından talimatın: {npc.instruction_for_npc}

Karakterinde konuş. Sadece kendi sözlerini ve kısa beden hareketlerini yaz; dünyanın
geri kalanını anlatma. JSON verme, düz metin. Üslup: {language_instruction}
"""
        expected = "Bir paragrafta, anlaşılır, sade diyalog; karaktere uygun kısa ton ve jest serbest."
    else:
        backstory = (
            f"You are {npc.name}. {npc.persona}\n\n"
            f"Style: {language_instruction}\n\n"
            f"Past interactions with the player:\n{specific_npc_history}"
        )
        task_desc = f"""
The Game Master just narrated: "{gm_narration}"
The player just did/said: "{player_action}"

Your instruction from the GM: {npc.instruction_for_npc}

Stay in character. Only your words and brief physical actions—do not narrate the wider scene.
No JSON, plain text only. Style: {language_instruction}
"""
        expected = "One readable paragraph: in-character voice, clear, not baroque."
    
    goal_en = f"React and speak strictly as {npc.name}."
    goal_tr = f"Yalnızca {npc.name} olarak tepki ver ve konuş."
    npc_agent = Agent(
        role=f"{npc.name}",
        goal=goal_tr if is_tr else goal_en,
        backstory=backstory,
        llm=my_llm,
        verbose=True
    )
    
    npc_task = Task(
        description=task_desc,
        expected_output=expected,
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
def run_campaign_step(
    player_stats: str,
    story_premise: str,
    campaign_history: str,
    npc_histories: dict,
    action: str,
    location_context: str,
    language: str = "en",
):
    language_instruction = get_language_and_tone_instruction(language)
    inputs = {
        'player_stats': player_stats,
        'location_context': location_context,
        'story_premise': story_premise,
        'campaign_history': campaign_history,
        'action': action,
        'language_instruction': language_instruction,
    }
    
    workflow_steps = [
        "CrewAI Game Master crew evaluated the action and produced structured narration."
    ]

    # Pass 1: The Game Master decides what happens (TR/EN config)
    if language == "tr":
        gm_crew = DnDGameMasterCrewTr().crew()
    else:
        gm_crew = DnDGameMasterCrew().crew()
    gm_result = gm_crew.kickoff(inputs=inputs)
    
    # We expect a pydantic object back because we used output_pydantic
    if not hasattr(gm_result, "pydantic") or not gm_result.pydantic:
        # Fallback if the LLM failed to format perfectly
        return {
            "gm_narration": gm_result.raw if hasattr(gm_result, "raw") else "The GM processed your action.",
            "npc_reactions": [],
            "engine": "crewai",
            "workflow_steps": workflow_steps + ["CrewAI fallback response returned because structured parsing was unavailable."]
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
            specific_npc_history=specific_history,
            language_instruction=language_instruction,
            language=language,
        )
        npc_reply = guard_response_text(npc_reply, language, f"{npc_req.name} dialogue")
        
        final_npc_dialogues.append({
            "name": npc_req.name,
            "dialogue": npc_reply
        })

    if final_npc_dialogues:
        workflow_steps.append("CrewAI dynamically spawned NPC sub-agents for in-character replies.")

    workflow_steps.append("Response style guard enforced plain language and the selected UI language.")
    workflow_steps.append("CrewAI assembled the final encounter payload for the frontend.")
        
    return {
        "gm_narration": guard_response_text(structured_gm.narration, language, "Game Master narration"),
        "npc_reactions": final_npc_dialogues,
        "engine": "crewai",
        "workflow_steps": workflow_steps
    }
