# MuseAI – AI Agent Planning Document

## 1. Project Overview

### Website Topic and Purpose
**MuseAI** is a creative writing dashboard designed for authors, game designers, and tabletop RPG enthusiasts. It functions as a "Writer's Panel" where users can build and manage story universes, create detailed character profiles, and track narrative quests and milestones.

### Target Users
- **Fiction Writers** who need tools to track characters, world-building details, and plot arcs
- **Game Designers** developing narrative-driven games with complex character systems
- **Tabletop RPG Game Masters** managing campaigns, NPCs, and quest lines
- **Screenwriters and Storytellers** looking for consistency in multi-character narratives

### Core Features
| Feature | Description |
|---------|-------------|
| **The World Hub** | Dashboard for managing story universes with genre tags and stats |
| **Character Forge** | Character creation with stats (STR, INT, AGI, CHA), backstory, and personality traits |
| **Quest Ledger** | Quest tracking with status management, milestones, and progress visualization |
| **Lore-Master AI (Planned)** | AI-powered narrative assistant for consistency checking and story suggestions |

---

## 2. AI Agent Concept: LORE-MASTER ENGINE

### Problem Statement
Creative writers frequently encounter two major challenges:
1. **Character Inconsistency**: As stories grow in complexity, characters may act in ways that contradict their established personality traits, backstory, or abilities
2. **Plot Holes**: Logical gaps emerge when narrative threads are not properly tracked, leading to unresolvable contradictions in the story

These issues are especially acute in collaborative writing, RPG campaign management, and long-form serialized fiction.

### Agent Type
**Narrative Consultant & Consistency Evaluator**

The Lore-Master Engine is a hybrid agent that combines:
- **Advisory Role**: Suggests story alternatives based on character profiles
- **Evaluator Role**: Analyzes proposed story events for consistency with established character data
- **Recommender Role**: Proposes creative directions based on character relationships and traits

### How It Works

#### Interaction Flow
1. **Input**: User initiates a story event (e.g., "Ahmethan faces a dragon")
2. **Analysis**: AI reads the character's profile — traits, stats, backstory
3. **Output**: AI provides rated options with consistency scores

#### Example Scenario
```
User: "Karakter Ahmethan, ejderhanın karşısına çıkıyor."

AI reads: Ahmethan → Traits: ["Korkak"] → Stats: {strength: 12}

AI Response:
┌─────────────────────────────────────────────────────┐
│ 🟢 Option 1: FLEE (Consistent)                     │
│    Ahmethan panics and runs to the nearest shelter  │
│                                                      │
│ 🟢 Option 2: HIDE (Consistent)                     │
│    Ahmethan quietly hides behind a rock             │
│                                                      │
│ 🔴 Option 3: ATTACK (Inconsistent!)                │
│    ⚠️ WARNING: Ahmethan is a cowardly character.   │
│    Direct attack contradicts his profile.            │
│    Suggestion: Add motivation (e.g., loved one      │
│    in danger) to justify this action.                │
└─────────────────────────────────────────────────────┘
```

#### User Interaction Methods
- **Scenario Selection**: Pre-built scenarios users can trigger for instant AI analysis
- **Chat Interface**: Free-form text input for custom story questions
- **Contextual Warnings**: Automatic alerts when editing characters or quests that may create inconsistencies
- **Background Automation**: Passive consistency scoring as users modify character data

---

## 3. System Architecture (High-Level)

### Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐    │
│  │  World Hub    │  │ Char. Forge  │  │ Quest Ledger  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘    │
│         │                 │                  │              │
│         └────────────┬────┴──────────────────┘              │
│                      │                                      │
│              ┌───────▼────────┐                             │
│              │  Data Layer     │                             │
│              │  (JSON / Store) │                             │
│              └───────┬────────┘                             │
└──────────────────────┼─────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    AI BACKEND                                 │
│  ┌───────────────────┐    ┌─────────────────────────────┐   │
│  │  Context Builder   │    │  Consistency Engine          │   │
│  │  (Character JSON + │───▶│  (Trait matching, stat       │   │
│  │   Event data)      │    │   analysis, backstory NLP)   │   │
│  └───────────────────┘    └──────────┬──────────────────┘   │
│                                      │                       │
│                            ┌─────────▼─────────┐            │
│                            │  LLM / OpenAI API  │            │
│                            │  (GPT-4 / Custom)  │            │
│                            └─────────┬─────────┘            │
│                                      │                       │
│                            ┌─────────▼─────────┐            │
│                            │  Response Builder   │            │
│                            │  (Suggestions +     │            │
│                            │   Consistency Score) │            │
│                            └───────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) | UI rendering and user interaction |
| Data Storage | LocalStorage / JSON | Client-side data persistence |
| AI Backend (Future) | Node.js + Express | API server for AI processing |
| AI Model | OpenAI GPT-4 API | Natural language understanding and generation |
| Deployment | GitHub Pages | Static site hosting |

### Data Flow

```
Character Data (JSON)  ──┐
                          ├──▶  AI Engine  ──▶  Consistency Analysis
Story Event (User Input) ─┘                     & Story Suggestions
```

**Detailed Flow:**
1. User creates/modifies a character or initiates a story event
2. Frontend sends character profile (traits, stats, backstory) + event description as JSON
3. AI Backend constructs a context prompt with all relevant character data
4. LLM processes the prompt and returns:
   - Consistency score (0-100%)
   - Alternative action suggestions with ratings
   - Potential plot hole warnings
5. Frontend displays results in the Lore-Master AI chat interface

---

## 4. Future Roadmap

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 1 ✅ | Website Draft | Core UI with World Hub, Character Forge, Quest Ledger |
| Phase 2 | AI Chat Integration | Connect Lore-Master to OpenAI API for real analysis |
| Phase 3 | Consistency Scoring | Automatic trait-vs-action consistency evaluation |
| Phase 4 | Multi-Universe Support | Cross-universe character migration and comparison |
| Phase 5 | Collaborative Mode | Multi-user real-time editing for collaborative stories |
