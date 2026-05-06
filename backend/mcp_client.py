from __future__ import annotations

import asyncio
import json
import os
import sys
import threading
from pathlib import Path
from typing import Any, Dict

from museai_context import (
    advance_combat_round,
    build_encounter_context,
    end_combat_encounter,
    generate_character_seed,
    generate_location_seed,
    roll_d20_check,
    start_combat_encounter,
)


SERVER_PATH = Path(__file__).with_name("mcp_server.py")


def _fallback_context(
    character_name: str,
    location_name: str,
    story_premise: str = "",
    warning: str = "",
) -> Dict[str, Any]:
    payload = build_encounter_context(character_name, location_name, story_premise)
    payload["transport"] = "local-fallback"
    payload["warning"] = warning or "MCP package is not available, so local context provider was used."
    return payload


def _extract_json_payload(result: Any) -> Dict[str, Any]:
    structured = getattr(result, "structuredContent", None)
    if isinstance(structured, dict) and structured:
        wrapped_result = structured.get("result")
        if isinstance(wrapped_result, str):
            try:
                return json.loads(wrapped_result)
            except json.JSONDecodeError:
                pass
        return structured

    content = getattr(result, "content", None) or []
    for block in content:
        text = getattr(block, "text", None)
        if text:
            return json.loads(text)

    raise ValueError("MCP tool returned no readable JSON content.")


async def _call_mcp_tool_async(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    try:
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client
    except ImportError as exc:
        raise RuntimeError(f"Install backend dependency 'mcp' to use stdio transport. Detail: {exc}") from exc

    python_executable = os.getenv("MUSEAI_MCP_PYTHON") or sys.executable
    server_params = StdioServerParameters(command=python_executable, args=[str(SERVER_PATH)])

    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, arguments=arguments)

    payload = _extract_json_payload(result)
    payload["transport"] = "mcp-stdio"
    payload["server"] = "MuseAI Context MCP Server"
    return payload


def _run_async_safely(coro):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)

    result_holder: Dict[str, Any] = {}
    error_holder: Dict[str, BaseException] = {}

    def runner():
        try:
            result_holder["result"] = asyncio.run(coro)
        except BaseException as exc:  # pragma: no cover - defensive bridge for ASGI event loops
            error_holder["error"] = exc

    thread = threading.Thread(target=runner, daemon=True)
    thread.start()
    thread.join()

    if "error" in error_holder:
        raise error_holder["error"]
    return result_holder["result"]


def call_mcp_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    return _run_async_safely(_call_mcp_tool_async(tool_name, arguments))


def get_encounter_context_via_mcp(
    character_name: str,
    location_name: str,
    story_premise: str = "",
) -> Dict[str, Any]:
    arguments = {
        "character_name": character_name,
        "location_name": location_name,
        "story_premise": story_premise,
    }
    try:
        return call_mcp_tool("get_encounter_context", arguments)
    except Exception as exc:
        return _fallback_context(
            character_name,
            location_name,
            story_premise,
            warning=f"MCP call failed and local context was used. Detail: {exc}",
        )


def generate_character_via_mcp(
    genre: str = "fantasy",
    role_type: str = "NPC",
    theme: str = "balanced",
    language: str = "en",
) -> Dict[str, Any]:
    arguments = {"genre": genre, "role_type": role_type, "theme": theme, "language": language}
    try:
        payload = call_mcp_tool("generate_character", arguments)
        payload["transport"] = payload.get("transport", "mcp-stdio")
        return payload
    except Exception as exc:
        payload = generate_character_seed(genre=genre, role_type=role_type, theme=theme, language=language)
        payload["transport"] = "local-fallback"
        payload["warning"] = f"MCP generation failed and local generator was used. Detail: {exc}"
        return payload


def generate_location_via_mcp(
    genre: str = "fantasy",
    location_type: str = "city",
    mood: str = "mysterious",
    language: str = "en",
) -> Dict[str, Any]:
    arguments = {"genre": genre, "location_type": location_type, "mood": mood, "language": language}
    try:
        payload = call_mcp_tool("generate_location", arguments)
        payload["transport"] = payload.get("transport", "mcp-stdio")
        return payload
    except Exception as exc:
        payload = generate_location_seed(genre=genre, location_type=location_type, mood=mood, language=language)
        payload["transport"] = "local-fallback"
        payload["warning"] = f"MCP generation failed and local generator was used. Detail: {exc}"
        return payload


def roll_check_via_mcp(
    stat_name: str,
    stat_value: int,
    difficulty_class: int = 12,
    language: str = "en",
) -> Dict[str, Any]:
    arguments = {
        "stat_name": stat_name,
        "stat_value": stat_value,
        "difficulty_class": difficulty_class,
        "language": language,
    }
    try:
        payload = call_mcp_tool("roll_check", arguments)
        payload["transport"] = payload.get("transport", "mcp-stdio")
        return payload
    except Exception as exc:
        payload = roll_d20_check(
            stat_name=stat_name,
            stat_value=stat_value,
            difficulty_class=difficulty_class,
            language=language,
        )
        payload["transport"] = "local-fallback"
        payload["warning"] = f"MCP dice roll failed and local mechanics were used. Detail: {exc}"
        return payload


def start_combat_via_mcp(
    player_name: str,
    player_stats: Dict[str, Any] | None = None,
    enemy_kind: str = "guard",
    ally_kind: str = "",
    location_name: str = "",
    language: str = "en",
) -> Dict[str, Any]:
    stats = player_stats or {}
    arguments = {
        "player_name": player_name,
        "player_stats_json": json.dumps(stats),
        "enemy_kind": enemy_kind,
        "ally_kind": ally_kind,
        "location_name": location_name,
        "language": language,
    }
    try:
        payload = call_mcp_tool("start_combat", arguments)
        payload["transport"] = payload.get("transport", "mcp-stdio")
        return payload
    except Exception as exc:
        payload = start_combat_encounter(
            player_name=player_name,
            player_stats=stats,
            enemy_kind=enemy_kind,
            ally_kind=ally_kind,
            location_name=location_name,
            language=language,
        )
        payload["transport"] = "local-fallback"
        payload["warning"] = f"MCP combat start failed and local mechanics were used. Detail: {exc}"
        return payload


def advance_combat_via_mcp(
    combat_state: Dict[str, Any],
    player_action: str,
    player_stats: Dict[str, Any] | None = None,
    language: str = "en",
) -> Dict[str, Any]:
    stats = player_stats or {}
    arguments = {
        "combat_state_json": json.dumps(combat_state or {}),
        "player_action": player_action,
        "player_stats_json": json.dumps(stats),
        "language": language,
    }
    try:
        payload = call_mcp_tool("advance_combat", arguments)
        payload["transport"] = payload.get("transport", "mcp-stdio")
        return payload
    except Exception as exc:
        payload = advance_combat_round(
            combat_state=combat_state,
            player_action=player_action,
            player_stats=stats,
            language=language,
        )
        payload["transport"] = "local-fallback"
        payload["warning"] = f"MCP combat round failed and local mechanics were used. Detail: {exc}"
        return payload


def end_combat_via_mcp(
    combat_state: Dict[str, Any],
    reason: str = "manual",
    language: str = "en",
) -> Dict[str, Any]:
    arguments = {
        "combat_state_json": json.dumps(combat_state or {}),
        "reason": reason,
        "language": language,
    }
    try:
        payload = call_mcp_tool("end_combat", arguments)
        payload["transport"] = payload.get("transport", "mcp-stdio")
        return payload
    except Exception as exc:
        payload = end_combat_encounter(combat_state=combat_state, reason=reason, language=language)
        payload["transport"] = "local-fallback"
        payload["warning"] = f"MCP combat end failed and local mechanics were used. Detail: {exc}"
        return payload
