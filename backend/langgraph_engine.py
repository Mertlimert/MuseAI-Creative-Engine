from typing import Dict, List, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from llm_factory import create_langchain_chat_model
from mcp_client import get_encounter_context_via_mcp
from narration_tone import get_language_and_tone_instruction
from response_style_guard import guard_response_text
from schemas import GMResponse


class EncounterState(TypedDict, total=False):
    player_stats: str
    story_premise: str
    campaign_history: str
    npc_histories: Dict[str, str]
    action: str
    location_context: str
    character_name: str
    location_name: str
    language: str
    mcp_context: Dict[str, object]
    workflow_steps: List[str]
    gm_response: GMResponse
    npc_reactions: List[Dict[str, str]]
    final_response: Dict[str, object]


def _append_step(state: EncounterState, message: str) -> List[str]:
    return [*state.get("workflow_steps", []), message]


def _get_language_instruction(language: str) -> str:
    return get_language_and_tone_instruction(language)


def prepare_context(state: EncounterState) -> EncounterState:
    mcp_context = get_encounter_context_via_mcp(
        character_name=state.get("character_name", ""),
        location_name=state.get("location_name", ""),
        story_premise=state.get("story_premise", ""),
    )
    transport = mcp_context.get("transport", "mcp-stdio")
    return {
        "mcp_context": mcp_context,
        "workflow_steps": _append_step(
            state,
            f"MCP client called get_encounter_context over {transport} and added project context to shared state.",
        )
    }


def game_master_node(state: EncounterState) -> EncounterState:
    language_instruction = _get_language_instruction(state.get("language", "en"))
    is_tr = (state.get("language") or "en") == "tr"
    if is_tr:
        role_line = "Canli bir D&D karsilasmasini yoneten Oyun Ustasisin."
    else:
        role_line = "You are a Dungeon Master orchestrating a live D&D encounter."
    gm_prompt = f"""
{role_line}

Dil ve üslup (uy):
{language_instruction}

Oyuncu istatistikleri:
{state["player_stats"]}

Mekan:
{state["location_context"]}

MCP Proje Baglami:
{state.get("mcp_context", {}).get("result", {}).get("prompt_context", "MCP baglami donmedi.")}

Hikâye öncülü:
{state["story_premise"]}

Kampanya geçmişi:
{state["campaign_history"]}

Oyuncu eylemi:
{state["action"]}

Yapılandırılmış çıktı:
1. narration: Eylem ve sonucu sade, takip edilebilir cümlelerle anlat.
2. npcs_to_activate: Şu anda tepki vermesi gerekenler (isim, persona, talimat); boş bırakılabilir.

Kurallar:
- İstatistiklere dayan; başarı, başarısızlık veya bedel net olsun.
- GM gibi anlat; NPC'yi konuşturacaksan diyaloğu anlatıya gömme, listeye ekle.
- Sahnenin ilerlediğini hissettir. Aşırı edebi, iç içe geçmiş anlatımdan kaçın; okunaklılık öncelik.
""".strip() if is_tr else f"""
{role_line}

Language and style:
{language_instruction}

Player Stats:
{state["player_stats"]}

Location Context:
{state["location_context"]}

MCP Project Context:
{state.get("mcp_context", {}).get("result", {}).get("prompt_context", "No MCP context returned.")}

Story Premise:
{state["story_premise"]}

Campaign History:
{state["campaign_history"]}

Player Action:
{state["action"]}

Structured output:
1. narration: Say plainly what the player does and what happens next—clear, followable sentences.
2. npcs_to_activate: NPCs that should speak now (name, persona, instruction), or leave empty.

Rules:
- Use stats for success, failure, persuasion, danger, or discovery. Outcomes must be easy to read.
- Never put NPC lines in the narration; route them through npcs_to_activate.
- Keep the scene playable. Avoid baroque, overwrought prose; prefer readable description.
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


def should_activate_npcs(state: EncounterState) -> Literal["npc_dialogue_node", "style_guard_node"]:
    gm_response = state.get("gm_response")
    if gm_response and gm_response.npcs_to_activate:
        return "npc_dialogue_node"
    return "style_guard_node"


def npc_dialogue_node(state: EncounterState) -> EncounterState:
    gm_response = state["gm_response"]
    chat_model = create_langchain_chat_model()
    npc_reactions: List[Dict[str, str]] = []
    language_instruction = _get_language_instruction(state.get("language", "en"))

    is_tr = (state.get("language") or "en") == "tr"
    for npc in gm_response.npcs_to_activate:
        specific_history = state["npc_histories"].get(
            npc.name, "Önceki etkileşim yok." if is_tr else "No previous interactions."
        )
        if is_tr:
            npc_prompt = f"""
{npc.name} karakterisisin.

Üslup:
{language_instruction}

Karakter:
{npc.persona}

Oyuncu ile geçmiş:
{specific_history}

Oyun Ustasının anlatısı:
{gm_response.narration}

Oyuncu eylemi:
{state["action"]}

Oyun Ustası talimatı:
{npc.instruction_for_npc}

Karakterinde yanıt ver. Sadece konuşmanı ve gerekirse kısa jestleri yaz; tüm sahnenin
anlatıcılığını yapma. Tek, anlaşılır paragraf; sade dil.
""".strip()
        else:
            npc_prompt = f"""
You are {npc.name}.

Style:
{language_instruction}

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

In character. Only your words and short physical action beats—not full scene narration.
One clear paragraph, plain readable prose.
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


def style_guard_node(state: EncounterState) -> EncounterState:
    language = state.get("language", "en")
    gm_response = state["gm_response"]
    guarded_narration = guard_response_text(
        gm_response.narration,
        language,
        "Game Master narration",
    )
    try:
        guarded_gm_response = gm_response.model_copy(update={"narration": guarded_narration})
    except AttributeError:
        guarded_gm_response = gm_response.copy(update={"narration": guarded_narration})

    guarded_npc_reactions = []
    for npc in state.get("npc_reactions", []):
        guarded_npc_reactions.append(
            {
                **npc,
                "dialogue": guard_response_text(
                    npc.get("dialogue", ""),
                    language,
                    f"{npc.get('name', 'NPC')} dialogue",
                ),
            }
        )

    return {
        "gm_response": guarded_gm_response,
        "npc_reactions": guarded_npc_reactions,
        "workflow_steps": _append_step(
            state,
            "Response style guard enforced plain language and the selected UI language.",
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
            "mcp_context": state.get("mcp_context", {}),
        },
    }


def build_campaign_graph():
    graph = StateGraph(EncounterState)
    graph.add_node("prepare_context", prepare_context)
    graph.add_node("game_master_node", game_master_node)
    graph.add_node("npc_dialogue_node", npc_dialogue_node)
    graph.add_node("style_guard_node", style_guard_node)
    graph.add_node("finalize_response_node", finalize_response_node)

    graph.add_edge(START, "prepare_context")
    graph.add_edge("prepare_context", "game_master_node")
    graph.add_conditional_edges("game_master_node", should_activate_npcs)
    graph.add_edge("npc_dialogue_node", "style_guard_node")
    graph.add_edge("style_guard_node", "finalize_response_node")
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
    character_name: str = "",
    location_name: str = "",
    language: str = "en",
):
    result = campaign_graph.invoke(
        {
            "player_stats": player_stats,
            "story_premise": story_premise,
            "campaign_history": campaign_history,
            "npc_histories": npc_histories,
            "action": action,
            "location_context": location_context,
            "character_name": character_name,
            "location_name": location_name,
            "language": language,
            "workflow_steps": [],
        }
    )
    return result["final_response"]
