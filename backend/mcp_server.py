from __future__ import annotations

import json

from mcp.server.fastmcp import FastMCP

from museai_context import (
    advance_combat_round,
    build_encounter_context,
    end_combat_encounter,
    generate_character_seed,
    generate_location_seed,
    get_character_context,
    get_location_context,
    roll_d20_check,
    search_lore,
    start_combat_encounter,
)


mcp = FastMCP("MuseAI Context MCP Server")


@mcp.tool()
def get_character(name: str) -> str:
    """Return structured MuseAI character context by character name."""
    return json.dumps(get_character_context(name), ensure_ascii=False, indent=2)


@mcp.tool()
def get_location(name: str) -> str:
    """Return structured MuseAI location context by location name."""
    return json.dumps(get_location_context(name), ensure_ascii=False, indent=2)


@mcp.tool()
def search_project_lore(query: str) -> str:
    """Search the demo story context exposed by this MuseAI MCP server."""
    return json.dumps(search_lore(query), ensure_ascii=False, indent=2)


@mcp.tool()
def get_encounter_context(character_name: str, location_name: str, story_premise: str = "") -> str:
    """Return character, location, and lore context for the selected encounter."""
    return json.dumps(
        build_encounter_context(character_name, location_name, story_premise),
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def generate_character(genre: str = "fantasy", role_type: str = "NPC", theme: str = "balanced", language: str = "en") -> str:
    """Generate a language-aware playable character seed for MuseAI."""
    return json.dumps(
        generate_character_seed(genre=genre, role_type=role_type, theme=theme, language=language),
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def generate_location(genre: str = "fantasy", location_type: str = "city", mood: str = "mysterious", language: str = "en") -> str:
    """Generate a language-aware playable location seed for MuseAI."""
    return json.dumps(
        generate_location_seed(genre=genre, location_type=location_type, mood=mood, language=language),
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def roll_check(stat_name: str, stat_value: int, difficulty_class: int = 12, language: str = "en") -> str:
    """Roll a real d20 check using a character stat modifier."""
    return json.dumps(
        roll_d20_check(
            stat_name=stat_name,
            stat_value=stat_value,
            difficulty_class=difficulty_class,
            language=language,
        ),
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def start_combat(
    player_name: str,
    player_stats_json: str = "{}",
    enemy_kind: str = "guard",
    ally_kind: str = "",
    location_name: str = "",
    language: str = "en",
) -> str:
    """Start a combat encounter and return structured HP, initiative, and participants."""
    player_stats = json.loads(player_stats_json or "{}")
    return json.dumps(
        start_combat_encounter(
            player_name=player_name,
            player_stats=player_stats,
            enemy_kind=enemy_kind,
            ally_kind=ally_kind,
            location_name=location_name,
            language=language,
        ),
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def advance_combat(
    combat_state_json: str,
    player_action: str,
    player_stats_json: str = "{}",
    language: str = "en",
) -> str:
    """Advance one combat round using d20 rolls, HP updates, enemy response, and optional ally support."""
    combat_state = json.loads(combat_state_json or "{}")
    player_stats = json.loads(player_stats_json or "{}")
    return json.dumps(
        advance_combat_round(
            combat_state=combat_state,
            player_action=player_action,
            player_stats=player_stats,
            language=language,
        ),
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def end_combat(combat_state_json: str, reason: str = "manual", language: str = "en") -> str:
    """End a combat encounter and return the final combat state."""
    combat_state = json.loads(combat_state_json or "{}")
    return json.dumps(
        end_combat_encounter(combat_state=combat_state, reason=reason, language=language),
        ensure_ascii=False,
        indent=2,
    )


if __name__ == "__main__":
    mcp.run()
