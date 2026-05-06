"""Shared response language and plain-prose rules for all AI engines."""

from __future__ import annotations


def get_language_and_tone_instruction(language: str) -> str:
    if language == "tr":
        return (
            "Write the entire final content in natural Turkish. Keep proper names unchanged "
            "(for example Aethelgard, Lady Mirabel, Silverpeak Citadel). Translate only generic role "
            "words when they are not part of a proper name, such as Guard -> Muhafiz, Captain -> Kaptan, "
            "Council -> Konsey. Use normal, direct human language. Avoid poetic, overly dramatic, "
            "or novel-like narration. The Game Master should explain what happens in 3-6 short, clear "
            "sentences. NPCs should speak like real people in one short paragraph. Do not switch to "
            "English unless the player explicitly asks."
        )
    return (
        "Write in plain English. Keep proper names unchanged. Use normal, direct human language. "
        "Avoid poetic, overly dramatic, or novel-like narration. The Game Master should explain what "
        "happens in 3-6 short, clear sentences. NPCs should speak like real people in one short "
        "paragraph. Do not switch away from English unless the player explicitly asks."
    )
