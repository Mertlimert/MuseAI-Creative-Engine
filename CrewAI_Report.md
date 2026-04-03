# Assignment: CrewAI Integration Report

**Project Name:** MuseAI – Creative Engine (D&D Campaign Edition)  
**Git Repository:** [https://github.com/Mertlimert/MuseAI-Creative-Engine.git](https://github.com/Mertlimert/MuseAI-Creative-Engine.git)  
**Author:** Bedirhan  

---

## 1. Project Overview & Homework 2 Integration

This project is a direct continuation and integration of **Homework 2 (Creative Engine)**. Rather than being an independent application, the CrewAI integration serves as the "Live Encounter Mode" for the worlds and characters created in the previous assignment.

**How it integrates with Homework 2:**
- **Dynamic Context Injection:** When a user selects a character (e.g., *Aethelgard the Wise*) and a location (e.g., *Silverpeak Citadel*) from the frontend UI created in Homework 2, the frontend extracts local `DataStore` stats (Strength, Intellect, Agility, Charisma), character traits, location moods, and danger levels.
- **Rules Engine:** These specific stats are injected directly into the CrewAI Game Master's prompt context. When the Game Master resolves an action, it inherently checks the Homework 2 character stats (e.g., using a high Intellect stat to solve a magical ward).

---

## 2. Technical Architecture: Two-Pass Dynamic Spawning

To create a natural D&D flow where the Game Master narrates the world but the NPCs speak for themselves, I implemented a **Two-Pass CrewAI Architecture**:

1. **Pass 1 (Game Master Routing):** The Game Master evaluates the player's action against the campaign history and stats. It outputs a **Pydantic Structured JSON**. This JSON contains the narration of the event AND an array of `NPCRequest` objects if a character needs to speak.
2. **Pass 2 (Dynamic Sub-Agent Spawning):** The backend intercepts the Game Master's JSON. For every NPC requested, it dynamically spins up a **new, dedicated CrewAI Agent on the fly** with a specific persona and interaction history, ensuring the NPC speaks purely in character without narrating the entire world.

---

## 3. Implementation Logic & Code Snippets

### Agents Configuration (`backend/config/agents.yaml`)
We strictly define the Game Master to never speak for NPCs.
```yaml
game_master:
  role: "Dungeon Master"
  goal: "Drive the campaign narrative forward. Process the player's action according to their stats and the history. Narrate the outcome vividly. Decide if any NPCs are present and need to speak."
  backstory: >
    You are an impartial, highly creative, and dramatic Game Master orchestrating a D&D campaign.
    You know the rules of the world perfectly.
    You must always narrate the world around the player.
    You NEVER speak for the NPCs. Instead, you spawn them by defining their persona and the instructions for how they should react, and let them speak for themselves.
```

### Tasks Configuration (`backend/config/tasks.yaml`)
The prompt strictly forces the Game Master to consider the player stats (from Homework 2) and output a JSON array of `npcs_to_activate`.
```yaml
resolve_action:
  description: >
    Evaluate the player's latest action and advance the campaign.
    Current Player Stats: {player_stats}
    Location Concept: {location_context}
    Overall Story Premise: {story_premise}
    Campaign History: {campaign_history}
    Player's New Action: "{action}"
    
    1. Read the past Campaign History.
    2. Read the Player's New Action.
    3. Generate a vivid narration of what happens next. Use Player Stats to determine success/failure.
    4. If there are characters in the scene who should react, add them to the "npcs_to_activate" list. Provide their name, persona, and strict instructions.
  expected_output: >
    A JSON object matching the GMResponse schema, containing the narration and an optional list of NPCs to speak.
  agent: game_master
```

### Python Kickoff & Dynamic Execution (`backend/crew_engine.py`)
This snippet demonstrates the two-pass architecture. We capture the GM's structured output and dynamically spawn the sub-agents.
```python
# Pass 1: The Game Master decides what happens and who speaks
gm_crew = DnDGameMasterCrew().crew()
gm_result = gm_crew.kickoff(inputs=inputs)

structured_gm: GMResponse = gm_result.pydantic
final_npc_dialogues = []

# Pass 2: Dynamically spawn NPC Agents on the fly based on GM instructions
for npc_req in structured_gm.npcs_to_activate:
    specific_history = npc_histories.get(npc_req.name, "No previous interactions.")
    
    # run_npc_subagent spins up a mini-crew with a dynamically created Agent
    npc_reply = run_npc_subagent(
        npc=npc_req, 
        gm_narration=structured_gm.narration,
        player_action=action,
        specific_npc_history=specific_history
    )
    
    final_npc_dialogues.append({"name": npc_req.name, "dialogue": npc_reply})
```

---

## 4. Example Campaign Execution Flow (Walkthrough)

Here is a step-by-step example of how the CrewAI system is running the encounter based on user inputs and backend logs.

### Step 1: Campaign Initialization (Frontend)
The user selects a character and location from Homework 2 databases and sets a Story Premise: *"I am searching for the legendary 'Sunken Atrium'..."*
![Encounter Setup](assets/report/1_setup.png)

### Step 2: Player Action Processing
The player submits an action relying on their specific class traits: *"I focus my intense intellect to analyze the ancient magical ward..."* The frontend sends this action along with the character's INT stat to the CrewAI backend.
![Player Action](assets/report/2_action_input.png)

### Step 3: Game Master Processing & Narration (Pass 1)
**Terminal view:** The `resolve_action` task executes. The Game Master processes the intellect stat against the magical ward, concluding it is a success. It outputs a Pydantic JSON generating the narration and instructing an NPC named "Elianor Vane" to react.
![Terminal GM Task](assets/report/3_terminal_gm.png)

**UI view:** The frontend perfectly renders the Dungeon Master's dramatic narration of the ward shattering and the arrival of the translucent figure.
![UI GM Narration](assets/report/4_ui_gm.png)

### Step 4: Sub-Agent Spawning & Interaction (Pass 2)
**Terminal view:** A completely new CrewAI task is dynamically generated for the entity "Elianor Vane, The Bound Warden". She receives her persona rules from the GM and executes her response.
![Terminal NPC Sub-agent](assets/report/5_terminal_npc.png)

**UI view:** Elianor Vane responds to the player in-character as a separate, distinct entity in the chat log, completely separated from the Game Master's global narration. The API request completes successfully (`POST /api/action HTTP/1.1" 200 OK`).
![UI NPC Dialogue](assets/report/6_ui_npc.png)

---
*End of Report.*
