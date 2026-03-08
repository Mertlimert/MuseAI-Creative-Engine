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
| 🤖 **Lore-Master AI** | AI-powered narrative consultant (demo) for character consistency analysis |

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation & Running

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/MuseAI.git

# 2. Navigate to the project folder
cd MuseAI

# 3. Open in browser
# Simply open index.html in your browser, or use a local server:

# Option A: VS Code Live Server extension
# Option B: Python simple server
python -m http.server 8000

# Option C: Node.js
npx serve .
```

Then visit `http://localhost:8000` in your browser.

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

The application follows a **modular architecture** with clear separation of concerns:

```
app.js
├── DataStore      → Single source of truth, CRUD operations, localStorage persistence
├── Renderer       → Pure rendering functions (data → HTML), no side effects
├── Controller     → Event handling, orchestration, business logic
├── Router         → SPA page navigation
├── AIEngine       → Simulated AI interaction logic
└── ModalManager   → Centralized modal open/close/reset
```

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

**Bedirhan** — Story Architect & Developer
