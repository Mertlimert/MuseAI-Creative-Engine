# CrewAI Implementation Report: MuseAI Dynamic Campaign Engine

**Project:** MuseAI – Creative Engine (D&D Edition)  
**Git URL:** https://github.com/Mertlimert/MuseAI-Creative-Engine.git  
**Author:** Mert Kedik

---

## 1. Project Overview & Homework 2 Integration
Bu proje, **Homework 2 (Creative Engine)** üzerine inşa edilen, statik dünya inşasını dinamik bir oyun motoruna dönüştüren bir CrewAI uygulamasıdır. 

### Entegrasyon Detayları:
- **Homework 2 Foundation:** Daha önce oluşturulan "Character Forge" ve "Location Forge" verileri (karakter istatistikleri, yetenekler, mekanın ruh hali), CrewAI ajanlarına **dinamik context** olarak enjekte edilir.
- **Dinamik Veri Akışı:** Kullanıcı arayüzünde seçilen karakterin gücü (Strength) veya zekası (Intellect), CrewAI'nın Game Master ajanı tarafından zar atma (resolution logic) mekaniğinde kullanılır.

---

## 2. Technical Architecture: The Two-Pass System
Projede, performans ve rol yapma tutarlılığını artırmak için iki aşamalı (Two-Pass) bir CrewAI mimarisi kullanılmıştır.

1.  **Pass 1 (Game Master):** DM, dünyayı anlatır ve aksiyonları çözer. Eğer sahnede biri konuşmalıysa, bir NPC Sub-Agent tetiklenmesini "Pydantic" yapısıyla komuta eder.
2.  **Pass 2 (NPC Sub-Agents):** Sistem, DM'in direktifiyle anında bağımsız bir CrewAI ajanı oluşturur. Bu ajan, DM'den gelen "persona" ve oyuncuyla olan özel "npc_history" (hafıza) bilgisiyle konuşur.

---

## 3. Configuration Files (YAML)

### Agents Configuration (`agents.yaml`)
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

### Tasks Configuration (`tasks.yaml`)
```yaml
resolve_action:
  description: >
    Evaluate the player's latest action and advance the campaign.
    Current Player Stats: {player_stats}
    Location Concept: {location_context}
    Overall Story Premise: {story_premise}
    Player's New Action: "{action}"
  expected_output: >
    A JSON object matching the GMResponse schema, containing the narration and an optional list of NPCs to speak.
  agent: game_master
```

---

## 4. Implementation Logic (Python Snippets)

### Kickoff & Output Handling
Aşağıdaki kod parçası, DM'in çıktılarını Pydantic formatında alıp, sistemin dinamik olarak NPC ajanları üretmesini sağlar.

```python
# Pass 1: The Game Master decides what happens
gm_crew = DnDGameMasterCrew().crew()
gm_result = gm_crew.kickoff(inputs=inputs)

# Pass 2: Dynamically spawn NPC Agents if requested
for npc_req in structured_gm.npcs_to_activate:
    npc_reply = run_npc_subagent(
        npc=npc_req, 
        gm_narration=structured_gm.narration,
        player_action=action,
        specific_npc_history=specific_history
    )
```

---

## 5. Visual Summary & Screenshots
Proje arayüzü, CrewAI'yı bir oyun motoru olarak kullanır. 

-   **Frontend:** `app_v2.js` üzerinden `http://localhost:8000/api/action` endpoint'ine veri gönderir.
-   **Backend:** `FastAPI` + `CrewAI` kombinasyonu ile LLM (Gemini/GPT) üzerinden yanıtları üretir.

*(Buraya Active Encounter ekran görüntüsü gelecektir)*

