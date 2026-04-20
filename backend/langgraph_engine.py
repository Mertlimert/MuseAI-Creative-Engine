from typing import Dict, List, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from llm_factory import create_langchain_chat_model
from schemas import GMResponse


class EncounterState(TypedDict, total=False):
    player_stats: str
    story_premise: str
    campaign_history: str
    npc_histories: Dict[str, str]
    action: str
    location_context: str
    workflow_steps: List[str]
    gm_response: GMResponse
    npc_reactions: List[Dict[str, str]]
    final_response: Dict[str, object]


def _append_step(state: EncounterState, message: str) -> List[str]:
    return [*state.get("workflow_steps", []), message]


def prepare_context(state: EncounterState) -> EncounterState:
    return {
        "workflow_steps": _append_step(
            state,
            "Context prepared from player stats, story premise, campaign history, and location.",
        )
    }


def game_master_node(state: EncounterState) -> EncounterState:
    gm_prompt = f"""
You are a Dungeon Master orchestrating a live D&D encounter.

Player Stats:
{state["player_stats"]}

Location Context:
{state["location_context"]}

Story Premise:
{state["story_premise"]}

Campaign History:
{state["campaign_history"]}

Player Action:
{state["action"]}

Return a structured response with:
1. narration: vividly describe what happens next.
2. npcs_to_activate: include only the NPCs that should react right now.

Rules:
- Use the player's stats when resolving success, failure, persuasion, danger, or discovery.
- Always narrate the world as the Game Master.
- Never write the NPC dialogue inside narration if an NPC should speak; route them through npcs_to_activate.
- Keep the scene moving forward in a way that feels playable.
""".strip()

    gm_chain = create_langchain_chat_model().with_structured_output(GMResponse)
    gm_response = gm_chain.invoke(gm_prompt)

    return {
        "gm_response": gm_response,
        "workflow_steps": _append_step(
            state,
            "Game Master node generated structured narration and selected active NPCs.",
        ),
    }


def should_activate_npcs(state: EncounterState) -> Literal["npc_dialogue_node", "finalize_response_node"]:
    gm_response = state.get("gm_response")
    if gm_response and gm_response.npcs_to_activate:
        return "npc_dialogue_node"
    return "finalize_response_node"


def npc_dialogue_node(state: EncounterState) -> EncounterState:
    gm_response = state["gm_response"]
    chat_model = create_langchain_chat_model()
    npc_reactions: List[Dict[str, str]] = []

    for npc in gm_response.npcs_to_activate:
        specific_history = state["npc_histories"].get(npc.name, "No previous interactions.")
        npc_prompt = f"""
You are {npc.name}.

Persona:
{npc.persona}

Past interactions with the player:
{specific_history}

The Game Master just narrated:
{gm_response.narration}

The player just did:
{state["action"]}

Instruction from the Game Master:
{npc.instruction_for_npc}

Respond in character.
Only output the NPC's exact words and physical actions.
Do not narrate the entire world.
Keep it to one tight paragraph.
""".strip()

        npc_result = chat_model.invoke(npc_prompt)
        npc_reactions.append(
            {
                "name": npc.name,
                "dialogue": npc_result.content if hasattr(npc_result, "content") else str(npc_result),
            }
        )

    return {
        "npc_reactions": npc_reactions,
        "workflow_steps": _append_step(
            state,
            "NPC dialogue node produced in-character reactions for each activated NPC.",
        ),
    }


def finalize_response_node(state: EncounterState) -> EncounterState:
    gm_response = state["gm_response"]
    workflow_steps = _append_step(
        state,
        "Final response node assembled the payload for the frontend.",
    )

    return {
        "workflow_steps": workflow_steps,
        "final_response": {
            "gm_narration": gm_response.narration,
            "npc_reactions": state.get("npc_reactions", []),
            "engine": "langgraph",
            "workflow_steps": workflow_steps,
        },
    }


def build_campaign_graph():
    graph = StateGraph(EncounterState)
    graph.add_node("prepare_context", prepare_context)
    graph.add_node("game_master_node", game_master_node)
    graph.add_node("npc_dialogue_node", npc_dialogue_node)
    graph.add_node("finalize_response_node", finalize_response_node)

    graph.add_edge(START, "prepare_context")
    graph.add_edge("prepare_context", "game_master_node")
    graph.add_conditional_edges("game_master_node", should_activate_npcs)
    graph.add_edge("npc_dialogue_node", "finalize_response_node")
    graph.add_edge("finalize_response_node", END)

    return graph.compile()


campaign_graph = build_campaign_graph()


def run_langgraph_campaign_step(
    player_stats: str,
    story_premise: str,
    campaign_history: str,
    npc_histories: Dict[str, str],
    action: str,
    location_context: str,
):
    result = campaign_graph.invoke(
        {
            "player_stats": player_stats,
            "story_premise": story_premise,
            "campaign_history": campaign_history,
            "npc_histories": npc_histories,
            "action": action,
            "location_context": location_context,
            "workflow_steps": [],
        }
    )
    return result["final_response"]
