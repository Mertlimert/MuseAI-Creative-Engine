# MuseAI – Creative Engine 🎭✨

> A premium creative writing dashboard for building story universes, crafting characters, and tracking narrative quests — with AI-powered story assistance.

![MuseAI Dashboard](assets/images/universes/cyberpunk-istanbul.png)

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🌍 **The World Hub** | Manage and explore your story universes with genre tags, stats, and visual cards |
| ⚔️ **Character Forge** | Create characters with stats (Strength, Intellect, Agility, Charisma), backstory, and personality traits |
| 📜 **Quest Ledger** | Track quests, milestones, and narrative arcs with status management |
| 🤖 **Lore-Master AI (CrewAI + LangGraph)** | Active D&D Encounter mode with a switchable CrewAI multi-agent flow and a LangGraph step-based workflow. |

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)

### 1. Frontend (Universal UI)
Open `index.html` in your browser. Or use a local server:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### 2. Backend (CrewAI + LangGraph Engine)
Required for the "Lore-Master AI" Active Encounter tab.
```bash
# Navigate to backend
cd backend

# Setup environment
# Copy .env.example to .env and add your API keys
# Optional: add LangSmith keys for tracing

# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn api:app --reload
```
The backend runs on `http://localhost:8000`. Ensure you use a different port for the frontend if using a local server!

Supported orchestration modes in the UI:
- `CrewAI Multi-Agent`
- `LangGraph Workflow`

Optional LangSmith environment variables:
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_PROJECT=MuseAI-LangGraph
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic page structure |
| **CSS3** | Custom properties, Grid, Flexbox, animations |
| **JavaScript (ES6+)** | Modular SPA architecture with IIFE pattern |
| **LocalStorage** | Client-side data persistence |
| **Google Fonts** | Inter & Rajdhani typography |

---

## 🏗️ Architecture

---

## 🏗️ Architecture

The application follows a **modular architecture** with clear separation of concerns, connecting a robust Vanilla JS frontend to a Python-based AI backend that supports both CrewAI and LangGraph.

### Frontend Domain (Vanilla JS)
```text
app.js
├── DataStore      → Single source of truth, CRUD operations, localStorage persistence
├── Renderer       → Pure rendering functions (data → HTML), no side effects
├── Controller     → Event handling, orchestration, business logic
├── Router         → SPA page navigation
└── ModalManager   → Centralized modal open/close/reset
```

### Backend Domain (Hybrid Encounter Engine)
The Lore-Master AI now supports two orchestration modes behind the same API contract:
1. **CrewAI Mode:** A Game Master agent evaluates the player's action, generates a structured encounter response, and spawns dynamic NPC sub-agents when needed.
2. **LangGraph Mode:** A stateful graph prepares context, runs a Game Master node, conditionally branches into NPC dialogue nodes, and assembles the final response.

Both modes return:
- `gm_narration`
- `npc_reactions`
- `engine`
- `workflow_steps`

---

## 📁 Project Structure

```
MuseAI/
├── index.html              # Main SPA entry point
├── style.css               # Complete design system
├── app.js                  # Application logic (modular)
├── README.md               # This file
├── Planning_Document.md    # AI Agent integration plan
└── assets/
    └── images/
        ├── universes/      # Universe card images
        └── characters/     # Character portrait images
```

---

## 📋 AI Agent Planning Document

The detailed AI integration plan is available in [Planning_Document.md](Planning_Document.md).

The LangGraph assignment write-up draft is available in [LangGraph_Report.md](LangGraph_Report.md).

**Key Concept:** The **LORE-MASTER ENGINE** is a Narrative Consultant & Consistency Evaluator that:
- Analyzes character traits against proposed story actions
- Detects potential plot holes and inconsistencies
- Suggests creative alternatives based on character profiles

---

## 🎨 Design

- **Theme**: Dark purple/neon aesthetic inspired by cyberpunk and fantasy RPG interfaces
- **Typography**: Inter (body), Rajdhani (headings)
- **Colors**: Deep dark backgrounds with purple (#7c3aed) and pink (#ec4899) accents
- **Animations**: Smooth transitions, slide-up effects, and subtle micro-interactions

---

## 📄 License

This project is created for educational purposes as part of a university assignment.

---

## 👤 Author

**Mert Kedik** — Story Architect & Developer
