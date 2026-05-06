import os

from crewai import LLM
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

DEFAULT_MODEL = os.getenv(
    "OPENAI_MODEL_NAME",
    "openrouter/google/gemini-2.0-flash-lite:free",
)
DEFAULT_BASE_URL = os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1")
DEFAULT_API_KEY = os.getenv("OPENAI_API_KEY")
DEFAULT_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))
DEFAULT_HEADERS = {
    "HTTP-Referer": "https://github.com/Mertlimert/MuseAI-Creative-Engine",
    "X-Title": "MuseAI Creative Engine",
}


def create_crewai_llm() -> LLM:
    return LLM(
        model=DEFAULT_MODEL,
        base_url=DEFAULT_BASE_URL,
        api_key=DEFAULT_API_KEY,
        max_tokens=DEFAULT_MAX_TOKENS,
        extra_headers=DEFAULT_HEADERS,
    )


def create_langchain_chat_model() -> ChatOpenAI:
    return ChatOpenAI(
        model=DEFAULT_MODEL,
        api_key=DEFAULT_API_KEY,
        base_url=DEFAULT_BASE_URL,
        default_headers=DEFAULT_HEADERS,
        max_tokens=DEFAULT_MAX_TOKENS,
        temperature=0.7,
    )
