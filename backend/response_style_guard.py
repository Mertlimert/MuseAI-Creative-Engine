from __future__ import annotations

from llm_factory import create_langchain_chat_model
from narration_tone import get_language_and_tone_instruction


def guard_response_text(text: str, language: str, role: str = "response") -> str:
    if not text or language != "tr":
        return text

    prompt = f"""
Rewrite the following {role} into natural Turkish.

Rules:
- Output only the rewritten text.
- Keep proper names unchanged: Aethelgard, Lady Mirabel, Silverpeak Citadel, Captain Ralnor, etc.
- Translate generic role words when they are not proper names: Guard -> Muhafiz, Captain -> Kaptan, Council -> Konsey.
- Use normal, direct human language.
- Avoid poetic, overly dramatic, novel-like narration.
- Keep it short and playable.
- Follow this shared style rule: {get_language_and_tone_instruction(language)}

Text:
{text}
""".strip()

    try:
        result = create_langchain_chat_model().invoke(prompt)
        rewritten = result.content if hasattr(result, "content") else str(result)
        return rewritten.strip() or text
    except Exception:
        return text
