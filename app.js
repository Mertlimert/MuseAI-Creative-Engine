/**
 * MuseAI – Creative Engine
 * Application Logic (Modular Architecture)
 *
 * Architecture:
 *   DataStore    — Single source of truth for all app data + localStorage persistence
 *   Renderer     — Pure rendering functions (data → HTML), no side effects
 *   Controller   — Event handling, orchestration, business logic
 *   Router       — SPA page navigation
 *   AIEngine     — Simulated AI interaction logic
 *   ModalManager — Centralized modal open/close/reset
 */

'use strict';

/**
 * Lore-Master backend (FastAPI). Default matches `uvicorn` on 127.0.0.1:8000.
 * Override before loading app.js if needed: window.MUSEAI_API_BASE = 'http://127.0.0.1:8000';
 */
const MUSEAI_API_BASE =
  (typeof window !== 'undefined' && window.MUSEAI_API_BASE) || 'http://127.0.0.1:8000';

/* ============================================================
   1. DATA STORE — Single Source of Truth
   ============================================================ */
const DataStore = (() => {
  const STORAGE_KEY = 'museai_data';

  /** Default seed data for first launch */
  const DEFAULT_DATA = {
    universes: [
      {
        id: 'uni-1',
        name: 'Cyberpunk Istanbul',
        genre: 'cyberpunk',
        description: 'A neon-drenched metropolis where the Bosphorus glimmers with holographic advertisements and underground hackers fight corporate overlords.',
        characters: 42,
        quests: 15,
        image: 'assets/images/universes/cyberpunk-istanbul.png',
        lastEdited: '2h ago',
      },
      {
        id: 'uni-2',
        name: 'Middle Earth',
        genre: 'fantasy',
        description: 'The sprawling lands of the Third Age, featuring Shire, Gondor, and beyond. Ancient magic stirs in forgotten places.',
        characters: 89,
        quests: 24,
        image: 'assets/images/universes/middle-earth.png',
        lastEdited: '5d ago',
      },
    ],

    characters: [
      {
        id: 'char-1',
        name: 'Aethelgard the Wise',
        charClass: 'Archmage',
        roleType: 'Protagonist',
        race: 'Human',
        level: 45,
        backstory: 'Born in the high towers of Aethelgard, he witnessed the fall of the Silver Moon. Since then, his aggressive pursuit of arcane knowledge has made him both feared and respected. Despite his age, he remains a wise mentor to those who survive his training. However, his cowardly retreat during the Siege of Oakhaven remains a dark secret he carries.',
        traits: [
          { name: 'Aggressive', type: 'aggressive' },
          { name: 'Wise', type: 'wise' },
          { name: 'Cowardly', type: 'cowardly' },
        ],
        stats: { strength: 12, intellect: 98, agility: 45, charisma: 62 },
        image: 'assets/images/characters/wizard.png',
      },
      {
        id: 'char-2',
        name: 'Grog the Brutal',
        charClass: 'Berserker',
        roleType: 'Side Character',
        race: 'Orc',
        level: 32,
        backstory: 'A fearsome warrior from the Ironclad Wastes, Grog lives for the thrill of battle. His loyalty to his clan is unquestioned, though his temper has cost him many allies over the years.',
        traits: [
          { name: 'Aggressive', type: 'aggressive' },
          { name: 'Brave', type: 'brave' },
        ],
        stats: { strength: 95, intellect: 18, agility: 55, charisma: 25 },
        image: 'assets/images/characters/warrior.png',
      },
      {
        id: 'char-3',
        name: 'Xyla the Rogue',
        charClass: 'Shadow Dancer',
        roleType: 'Antagonist',
        race: 'Elf',
        level: 38,
        backstory: 'Once a noble of the Silver Court, Xyla turned to shadows after her family was betrayed by the Crown. She now orchestrates a web of spies and thieves throughout the kingdom.',
        traits: [
          { name: 'Cunning', type: 'cunning' },
          { name: 'Cowardly', type: 'cowardly' },
        ],
        stats: { strength: 35, intellect: 72, agility: 94, charisma: 80 },
        image: 'assets/images/characters/rogue.png',
      },
      {
        id: 'char-tr-1',
        name: 'Derya Demir',
        charClass: 'Glif Muhendisi',
        roleType: 'Protagonist',
        race: 'Insan',
        level: 27,
        backstory: 'Kadikoyde buyumus, eski Istanbul sarniclarindaki muhurlu gecitleri inceleyerek yetismis pratik bir buyu muhendisidir. Derya, karmasik glifleri sakin bir sekilde okur ve tehlikeyi buyutmeden cozmeye calisir.',
        traits: [
          { name: 'Bilge', type: 'wise' },
          { name: 'Cesur', type: 'brave' },
          { name: 'Kurnaz', type: 'cunning' },
        ],
        stats: { strength: 34, intellect: 91, agility: 58, charisma: 69 },
        image: 'assets/images/characters/wizard.png',
      },
      {
        id: 'char-tr-2',
        name: 'Baran Koroglu',
        charClass: 'Eser Avcisi',
        roleType: 'Side Character',
        race: 'Insan',
        level: 21,
        backstory: 'Anadoludaki eski yollar, kayip haritalar ve karaborsa eser soylentileri konusunda taninan bir saha rehberidir. Baran hizli karar verir, ama eski borclari bazen onu riskli pazarliklara surukler.',
        traits: [
          { name: 'Cesur', type: 'brave' },
          { name: 'Kurnaz', type: 'cunning' },
        ],
        stats: { strength: 62, intellect: 67, agility: 74, charisma: 55 },
        image: 'assets/images/characters/warrior.png',
      },
    ],

    quests: [
      {
        id: 'quest-1',
        title: 'The Great Siege',
        type: 'main',
        status: 'active',
        phase: 'Phase 1',
        description: 'The walls of Eldoria tremble before the void-born march. Choose a side, rally allies, and defend or conquer.',
        milestones: [
          { text: 'Discover the void portal', done: true },
          { text: 'Rally the Northern Alliance', done: true },
          { text: 'Defend the Eastern Wall', done: false },
          { text: 'Confront the Void General', done: false },
        ],
      },
      {
        id: 'quest-2',
        title: "Aelwen's Betrayal",
        type: 'character',
        status: 'active',
        phase: 'Arc 2',
        description: 'Aelwen, once a trusted ally, has been secretly feeding intelligence to the enemy. Uncover her motives and decide her fate.',
        milestones: [
          { text: 'Find the stolen letters', done: true },
          { text: 'Confront Aelwen', done: false },
          { text: 'Choose: Mercy or Justice', done: false },
        ],
      },
      {
        id: 'quest-3',
        title: 'The Whispering Caves',
        type: 'side',
        status: 'locked',
        phase: 'Exploration',
        description: 'Strange whispers emanate from the caves near Oakhaven. Locals speak of cursed treasure and ancient guardians.',
        milestones: [
          { text: 'Investigate the cave entrance', done: false },
          { text: 'Solve the ancient puzzle', done: false },
          { text: 'Defeat the Guardian', done: false },
          { text: 'Retrieve the artifact', done: false },
        ],
      },
      {
        id: 'quest-4',
        title: 'The Merchant Guild',
        type: 'side',
        status: 'completed',
        phase: 'Trade',
        description: 'Establish trade relationships with the Merchant Guild to supply the Northern Alliance with weapons and provisions.',
        milestones: [
          { text: 'Meet the Guild Master', done: true },
          { text: 'Complete the trade agreement', done: true },
          { text: 'Escort the first caravan', done: true },
        ],
      },
    ],
  };

  let _data = null;

  /** Load data from localStorage or fall back to defaults */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _data = raw ? JSON.parse(raw) : structuredClone(DEFAULT_DATA);
    } catch {
      _data = structuredClone(DEFAULT_DATA);
    }
    mergeDefaultSeeds();
    return _data;
  }

  function mergeDefaultSeeds() {
    if (!_data) return;
    const seedGroups = ['universes', 'characters', 'quests'];
    let changed = false;
    for (const group of seedGroups) {
      if (!Array.isArray(_data[group])) _data[group] = [];
      const existingIds = new Set(_data[group].map(item => item.id));
      for (const seed of DEFAULT_DATA[group] || []) {
        if (!existingIds.has(seed.id)) {
          _data[group].push(structuredClone(seed));
          changed = true;
        }
      }
    }
    if (changed) save();
  }

  /** Persist current data to localStorage */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    } catch (e) {
      console.warn('DataStore: localStorage write failed', e);
    }
  }

  /** Generate a unique ID */
  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  // ── Universe CRUD ──
  function getUniverses() { return _data.universes; }

  function addUniverse(universe) {
    const entry = {
      id: generateId('uni'),
      name: universe.name,
      genre: universe.genre,
      description: universe.description,
      characters: 0,
      quests: 0,
      image: getGenreImage(universe.genre),
      lastEdited: 'Just now',
    };
    _data.universes.push(entry);
    save();
    return entry;
  }

  function updateUniverse(id, updates) {
    const idx = _data.universes.findIndex(u => u.id === id);
    if (idx === -1) return null;
    Object.assign(_data.universes[idx], updates, {
      image: getGenreImage(updates.genre || _data.universes[idx].genre),
      lastEdited: 'Just now',
    });
    save();
    return _data.universes[idx];
  }

  function deleteUniverse(id) {
    _data.universes = _data.universes.filter(u => u.id !== id);
    save();
  }

  function getGenreImage(genre) {
    const map = {
      cyberpunk: 'assets/images/universes/cyberpunk-istanbul.png',
      fantasy:   'assets/images/universes/middle-earth.png',
      scifi:     'assets/images/universes/space-odyssey.png',
      horror:    'assets/images/universes/middle-earth.png',
      steampunk: 'assets/images/universes/cyberpunk-istanbul.png',
    };
    return map[genre] || map.fantasy;
  }

  // ── Character CRUD ──
  function getCharacters() { return _data.characters; }

  function getCharacter(id) { return _data.characters.find(c => c.id === id) || null; }

  function addCharacter(character) {
    const entry = {
      id: generateId('char'),
      name: character.name,
      charClass: character.charClass || 'Unknown',
      roleType: character.roleType || 'NPC',
      race: 'Unknown',
      level: 1,
      backstory: character.backstory || '',
      traits: [],
      stats: { strength: 50, intellect: 50, agility: 50, charisma: 50 },
      image: '',
    };
    _data.characters.push(entry);
    save();
    return entry;
  }

  function updateCharacter(id, updates) {
    const char = getCharacter(id);
    if (!char) return null;
    Object.assign(char, updates);
    save();
    return char;
  }

  function deleteCharacter(id) {
    _data.characters = _data.characters.filter(c => c.id !== id);
    save();
  }

  function addTraitToCharacter(charId, trait) {
    const char = getCharacter(charId);
    if (!char) return;
    char.traits.push({ name: trait.name, type: trait.type || 'default' });
    save();
  }

  function removeTraitFromCharacter(charId, traitIndex) {
    const char = getCharacter(charId);
    if (!char) return;
    char.traits.splice(traitIndex, 1);
    save();
  }

  function updateCharacterStat(charId, stat, value) {
    const char = getCharacter(charId);
    if (!char) return;
    char.stats[stat] = Math.max(0, Math.min(100, parseInt(value, 10)));
    save();
  }

  // ── Quest CRUD ──
  function getQuests() { return _data.quests; }

  function getQuest(id) { return _data.quests.find(q => q.id === id) || null; }

  function addQuest(quest) {
    const entry = {
      id: generateId('quest'),
      title: quest.title,
      type: quest.type || 'side',
      status: quest.status || 'active',
      phase: quest.type === 'main' ? 'Phase 1' : quest.type === 'character' ? 'Arc 1' : 'Exploration',
      description: quest.description || '',
      milestones: [],
    };
    _data.quests.push(entry);
    save();
    return entry;
  }

  function updateQuest(id, updates) {
    const quest = getQuest(id);
    if (!quest) return null;
    Object.assign(quest, updates);
    save();
    return quest;
  }

  function deleteQuest(id) {
    _data.quests = _data.quests.filter(q => q.id !== id);
    save();
  }

  function toggleMilestone(questId, milestoneIdx) {
    const quest = getQuest(questId);
    if (!quest || !quest.milestones[milestoneIdx]) return;
    quest.milestones[milestoneIdx].done = !quest.milestones[milestoneIdx].done;
    save();
  }

  // ── Stats Computation ──
  function getStats() {
    return {
      totalUniverses: _data.universes.length,
      activeCharacters: _data.characters.length,
      questsCompleted: _data.quests.filter(q => q.status === 'completed').length,
    };
  }

  return {
    load, save, generateId,
    getUniverses, addUniverse, updateUniverse, deleteUniverse,
    getCharacters, getCharacter, addCharacter, updateCharacter, deleteCharacter,
    addTraitToCharacter, removeTraitFromCharacter, updateCharacterStat,
    getQuests, getQuest, addQuest, updateQuest, deleteQuest, toggleMilestone,
    getStats,
  };
})();


/* ============================================================
   2. RENDERER — Pure Rendering Functions
   ============================================================ */
const Language = (() => {
  const STORAGE_KEY = 'museai_language';
  const dictionaries = {
    en: {
      app_title: 'MuseAI - Creative Engine',
      meta_description: 'MuseAI - A creative writing dashboard for building story universes, characters, and quests with AI-powered narrative assistance.',
      toggle_menu: 'Toggle menu',
      language_label: 'Language',
      language_selector: 'Language selector',
      language_en: 'English',
      language_tr: 'Turkce',
      brand_subtitle: 'Creative Engine',
      user_role: 'Story Architect',
      nav_world_hub: 'World Hub',
      nav_character_forge: 'Character Forge',
      nav_quest_ledger: 'Quest Ledger',
      nav_location_forge: 'Location Forge',
      nav_lore_master: 'Lore-Master AI',
      page_world_title: 'The World Hub',
      page_world_subtitle: 'Manage and explore your story universes',
      settings: 'Settings',
      quick_import: 'Quick Import',
      stats_total_universes: 'Total Universes',
      stats_active_characters: 'Active Characters',
      stats_quests_completed: 'Quests Completed',
      my_universes: 'My Universes',
      view_all: 'View all ->',
      lore_tip_title: 'Lore-Master Tip',
      discuss_with_ai: 'Discuss with AI',
      page_character_title: 'Character Forge',
      page_character_subtitle: "Craft and manage your story's characters",
      ai_generate: 'AI Generate',
      new_character: 'New Character',
      library: 'Library',
      select_character: 'Select a Character',
      choose_character_from_library: 'Choose a character from the library to edit their details',
      no_characters_yet: 'No characters yet',
      character_backstory_origins: 'Backstory & Origins',
      personality_traits: 'Personality Traits',
      add_trait: 'Add Trait',
      delete_character: 'Delete Character',
      save_changes: 'Save Changes',
      level_short: 'Level {level}',
      core_stats: 'Core Stats',
      ai_insights: 'AI Insights',
      apply_suggestion: 'Apply Suggestion',
      stat_strength: 'Strength',
      stat_intellect: 'Intellect',
      stat_agility: 'Agility',
      stat_charisma: 'Charisma',
      page_quest_title: 'Quest Ledger',
      page_quest_subtitle: 'Track quests, milestones, and narrative arcs',
      new_quest: 'New Quest',
      select_quest: 'Select a Quest',
      choose_quest_from_list: 'Choose a quest from the list to see its details and milestones',
      no_quests_yet: 'No Quests Yet',
      create_first_quest: 'Create your first quest to start building your narrative',
      progress: 'Progress',
      milestones: 'Milestones',
      edit: 'Edit',
      delete: 'Delete',
      page_location_title: 'Location Forge',
      page_location_subtitle: 'Create and manage the places in your story world',
      new_location: 'New Location',
      add_location_to_world: 'Add a new place to your world',
      danger_level_short: 'Danger: {value}/10',
      encounter_title: 'Active Encounter (CrewAI + LangGraph)',
      encounter_subtitle: 'Run the same live D&D encounter with either CrewAI multi-agent orchestration or a LangGraph workflow, while keeping both systems active in the same project.',
      encounter_setup: 'Encounter Setup',
      encounter_select_character: 'Select Player Character',
      loading_characters: 'Loading characters...',
      encounter_select_location: 'Select Location context',
      loading_locations: 'Loading locations...',
      story_premise: 'Story Premise (What is the campaign about?)',
      story_premise_placeholder: 'e.g. I am entering a dark tavern looking for a quest.',
      ai_engine_label: 'AI Orchestration Engine',
      start_campaign: 'Start Campaign',
      end_encounter: 'End Encounter',
      ai_input_placeholder: 'What do you do? (e.g. I try to intimidate him...)',
      act: 'Act',
      architecture_player_action: 'Player Action',
      architecture_frontend: 'Frontend JS',
      create_universe: 'Create Universe',
      edit_universe: 'Edit Universe',
      universe_name: 'Universe Name',
      universe_name_placeholder: 'e.g. Cyberpunk Istanbul',
      genre: 'Genre',
      genre_cyberpunk: 'Cyberpunk',
      genre_fantasy: 'High Fantasy',
      genre_scifi: 'Sci-Fi',
      genre_horror: 'Horror',
      genre_steampunk: 'Steampunk',
      description: 'Description',
      universe_desc_placeholder: 'Describe your universe...',
      cancel: 'Cancel',
      create: 'Create',
      create_character: 'Create Character',
      edit_character: 'Edit Character',
      character_name: 'Character Name',
      character_name_placeholder: 'e.g. Aethelgard the Wise',
      class_role: 'Class / Role',
      class_role_placeholder: 'e.g. Archmage, Warrior, Rogue',
      type: 'Type',
      role_protagonist: 'Protagonist',
      role_antagonist: 'Antagonist',
      role_npc: 'NPC',
      role_side_character: 'Side Character',
      backstory: 'Backstory',
      backstory_placeholder: "Write the character's origin story...",
      create_quest: 'Create Quest',
      edit_quest: 'Edit Quest',
      quest_title: 'Quest Title',
      quest_title_placeholder: 'e.g. The Great Siege',
      quest_type: 'Quest Type',
      status_label: 'Status',
      quest_type_main: 'Main Questline',
      quest_type_side: 'Side Quest',
      quest_type_character: 'Character Arc',
      quest_status_active: 'Active',
      quest_status_completed: 'Completed',
      quest_status_locked: 'Locked',
      quest_desc_placeholder: 'Describe the quest objectives...',
      add_trait_title: 'Add Trait',
      trait_name: 'Trait Name',
      trait_name_placeholder: 'e.g. Brave, Cunning, Wise',
      trait_style: 'Trait Style',
      trait_default: 'Default',
      trait_aggressive: 'Aggressive',
      trait_wise: 'Wise',
      trait_cowardly: 'Cowardly',
      trait_cunning: 'Cunning',
      trait_brave: 'Brave',
      ai_char_generator: 'AI Character Generator',
      ai_char_description: 'Configure the parameters below and let the AI craft a unique character for your story.',
      world_genre: 'World Genre',
      character_role: 'Character Role',
      personality_theme: 'Personality Theme',
      theme_balanced: 'Balanced',
      theme_dark: 'Dark & Mysterious',
      theme_noble: 'Noble & Heroic',
      theme_trickster: 'Trickster & Cunning',
      theme_tragic: 'Tragic Hero',
      generate_character: 'Generate Character',
      regenerate: 'Regenerate',
      add_to_library: 'Add to Library',
      ai_location_generator: 'AI Location Generator',
      ai_location_description: 'Describe the type of location you need and let the AI build it for your world.',
      location_type: 'Location Type',
      atmosphere: 'Atmosphere',
      location_type_city: 'City / Town',
      location_type_dungeon: 'Dungeon / Cave',
      location_type_wilderness: 'Wilderness / Forest',
      location_type_building: 'Building / Interior',
      location_type_landmark: 'Landmark / Monument',
      mood_mysterious: 'Mysterious',
      mood_dangerous: 'Dangerous',
      mood_peaceful: 'Peaceful',
      mood_eerie: 'Eerie & Haunted',
      mood_bustling: 'Bustling & Lively',
      generate_location: 'Generate Location',
      add_to_world: 'Add to World',
      create_location: 'Create Location',
      location_name: 'Location Name',
      location_name_placeholder: 'e.g. The Whispering Caves',
      location_desc_placeholder: 'Describe this location...',
      last_edited: 'Last edited {time}',
      just_now: 'Just now',
      new_universe_title: 'New Universe',
      new_universe_desc: 'Start a new story thread and build your world from scratch.',
      universe_characters: 'Characters',
      universe_quests: 'Quests',
      generated_name: 'Generated Name',
      class_race: 'Class & Race',
      generated_backstory: 'Generated Backstory',
      generated_location: 'Generated Location',
      type_atmosphere: 'Type & Atmosphere',
      key_features: 'Key Features',
      generated_description: 'Description',
      backstory_saved: 'Backstory saved!',
      ai_suggestion_applied: 'AI suggestion applied! (simulated)',
      confirm_delete_universe: 'Are you sure you want to delete this universe?',
      confirm_delete_character: 'Are you sure you want to delete this character?',
      confirm_delete_quest: 'Are you sure you want to delete this quest?',
      confirm_delete_location: 'Delete this location?',
      generating_character: 'Generating character...',
      generating_location: 'Generating location...',
      select_character_option: 'Select a character...',
      select_location_option: 'Select a location...',
      encounter_validation: 'Please select a character, location, and set a story premise.',
      system_label: 'System',
      error_label: 'Error',
      api_failure: 'API Failure. Error: {message}',
      crewai_status: 'CrewAI Engine - Live',
      crewai_start_message: 'Campaign started with CrewAI multi-agent orchestration. What do you do first?',
      crewai_loading: 'CrewAI is rolling the dice...',
      crewai_gm_label: 'Dungeon Master (CrewAI)',
      crewai_npc_label: 'Sub-Agent',
      crewai_workflow_label: 'CrewAI Steps',
      mcp_context_label: 'MCP Context',
      mcp_mechanics_label: 'MCP Mechanics',
      combat_started_label: 'Combat Started',
      combat_round_label: 'Combat Round',
      dice_roll_label: 'Dice Roll',
      stat_used_label: 'Stat Used',
      hp_label: 'HP',
      outcome_label: 'Outcome',
      crewai_hint: 'CrewAI uses a Game Master agent and dynamic NPC sub-agents.',
      crewai_arch_title: 'CrewAI Flow Architecture',
      crewai_arch_description: 'CrewAI routes the encounter through a Game Master agent, then dynamically spawns NPC sub-agents only when a character should react.',
      crewai_node_2_label: 'Dungeon Master',
      crewai_node_2_sub: 'CrewAI Agent #1',
      crewai_node_3_label: 'NPC Actor',
      crewai_node_3_sub: 'Dynamic Sub-Agent',
      crewai_node_4_label: 'Final Encounter',
      crewai_node_4_sub: 'Narration + NPC replies',
      langgraph_status: 'LangGraph Workflow - Live',
      langgraph_start_message: 'Campaign started with LangGraph workflow orchestration. What do you do first?',
      langgraph_loading: 'LangGraph is traversing the encounter nodes...',
      langgraph_gm_label: 'Dungeon Master (LangGraph)',
      langgraph_npc_label: 'Graph Node',
      langgraph_workflow_label: 'LangGraph Steps',
      langgraph_hint: 'LangGraph uses stateful nodes, conditional edges, and a shared encounter state.',
      langgraph_arch_title: 'LangGraph Flow Architecture',
      langgraph_arch_description: 'LangGraph prepares shared state, runs a Game Master node, conditionally branches into NPC dialogue nodes, and then assembles the final response.',
      langgraph_node_2_label: 'Context Node',
      langgraph_node_2_sub: 'Shared encounter state',
      langgraph_node_3_label: 'GM Router',
      langgraph_node_3_sub: 'Structured narration node',
      langgraph_node_4_label: 'NPC Branch',
      langgraph_node_4_sub: 'Conditional node + final assembly',
      engine_crewai: 'CrewAI Multi-Agent',
      engine_langgraph: 'LangGraph Workflow',
      insight_cowardly_intellect: "{name}'s high intellect suggests they would likely use illusion magic to cover any cowardly retreat. Consider adding 'Deceptive' to their trait list to align with their secret backstory.",
      insight_aggressive_low_strength: '{name} has aggressive tendencies but low strength. This could create interesting internal conflict - perhaps their aggression is verbal, not physical.',
      insight_brave_aggressive: "{name}'s bravery combined with aggression makes them a natural frontline leader. Consider giving them a squad to command in battle scenarios.",
      insight_default: "{name}'s unique combination of traits creates narrative opportunities. Consider how their {charClass} abilities interact with their personality in critical moments."
    },
    tr: {
      app_title: 'MuseAI - Yaratici Motor',
      meta_description: 'MuseAI - hikaye evrenleri, karakterler ve gorevler olusturmak icin yapay zeka destekli yaratici yazim paneli.',
      toggle_menu: 'Menuyu ac veya kapat',
      language_label: 'Dil',
      language_selector: 'Dil secici',
      language_en: 'English',
      language_tr: 'Turkce',
      brand_subtitle: 'Yaratici Motor',
      user_role: 'Hikaye Mimari',
      nav_world_hub: 'Dunya Merkezi',
      nav_character_forge: 'Karakter Atolyesi',
      nav_quest_ledger: 'Gorev Defteri',
      nav_location_forge: 'Mekan Atolyesi',
      nav_lore_master: 'Lore-Master AI',
      page_world_title: 'Dunya Merkezi',
      page_world_subtitle: 'Hikaye evrenlerini yonet ve kesfet',
      settings: 'Ayarlar',
      quick_import: 'Hizli Ice Aktar',
      stats_total_universes: 'Toplam Evren',
      stats_active_characters: 'Aktif Karakter',
      stats_quests_completed: 'Tamamlanan Gorev',
      my_universes: 'Evrenlerim',
      view_all: 'Tumunu Gor ->',
      lore_tip_title: 'Lore-Master Ipucu',
      discuss_with_ai: 'AI ile Konus',
      page_character_title: 'Karakter Atolyesi',
      page_character_subtitle: 'Hikayendeki karakterleri tasarla ve yonet',
      ai_generate: 'AI Uret',
      new_character: 'Yeni Karakter',
      library: 'Kutuphane',
      select_character: 'Bir Karakter Sec',
      choose_character_from_library: 'Detaylarini duzenlemek icin kutuphaneden bir karakter sec',
      no_characters_yet: 'Henuz karakter yok',
      character_backstory_origins: 'Gecmis Hikaye ve Kokler',
      personality_traits: 'Kisilik Ozellikleri',
      add_trait: 'Ozellik Ekle',
      delete_character: 'Karakteri Sil',
      save_changes: 'Degisiklikleri Kaydet',
      level_short: 'Seviye {level}',
      core_stats: 'Temel Istatistikler',
      ai_insights: 'AI Icgoruleri',
      apply_suggestion: 'Oneriyi Uygula',
      stat_strength: 'Guc',
      stat_intellect: 'Zeka',
      stat_agility: 'Ceviklik',
      stat_charisma: 'Karizma',
      page_quest_title: 'Gorev Defteri',
      page_quest_subtitle: 'Gorevleri, kilometre taslarini ve anlati akislarini takip et',
      new_quest: 'Yeni Gorev',
      select_quest: 'Bir Gorev Sec',
      choose_quest_from_list: 'Detaylari ve kilometre taslarini gormek icin listeden bir gorev sec',
      no_quests_yet: 'Henuz gorev yok',
      create_first_quest: 'Anlatini kurmaya baslamak icin ilk gorevini olustur',
      progress: 'Ilerleme',
      milestones: 'Kilometre Taslari',
      edit: 'Duzenle',
      delete: 'Sil',
      page_location_title: 'Mekan Atolyesi',
      page_location_subtitle: 'Hikaye dunyandaki mekanlari olustur ve yonet',
      new_location: 'Yeni Mekan',
      add_location_to_world: 'Dunyana yeni bir yer ekle',
      danger_level_short: 'Tehlike: {value}/10',
      encounter_title: 'Aktif Karsilasma (CrewAI + LangGraph)',
      encounter_subtitle: 'Ayni canli D&D karsilasmasini CrewAI coklu ajan orkestrasyonu veya LangGraph is akisi ile calistir, hem de ikisini de ayni projede aktif tut.',
      encounter_setup: 'Karsilasma Kurulumu',
      encounter_select_character: 'Oyuncu Karakterini Sec',
      loading_characters: 'Karakterler yukleniyor...',
      encounter_select_location: 'Mekan Baglamini Sec',
      loading_locations: 'Mekanlar yukleniyor...',
      story_premise: 'Hikaye Onermesi (Kampanya ne hakkinda?)',
      story_premise_placeholder: 'ornegin Bir gorev ararken karanlik bir hana giriyorum.',
      ai_engine_label: 'AI Orkestrasyon Motoru',
      start_campaign: 'Kampanyayi Baslat',
      end_encounter: 'Karsilasmayi Bitir',
      ai_input_placeholder: 'Ne yapiyorsun? (ornegin Onu korkutmaya calisiyorum...)',
      act: 'Eylem Yap',
      architecture_player_action: 'Oyuncu Eylemi',
      architecture_frontend: 'Arayuz JS',
      create_universe: 'Evren Olustur',
      edit_universe: 'Evreni Duzenle',
      universe_name: 'Evren Adi',
      universe_name_placeholder: 'ornegin Cyberpunk Istanbul',
      genre: 'Tur',
      genre_cyberpunk: 'Cyberpunk',
      genre_fantasy: 'Yuksek Fantazi',
      genre_scifi: 'Bilim Kurgu',
      genre_horror: 'Korku',
      genre_steampunk: 'Steampunk',
      description: 'Aciklama',
      universe_desc_placeholder: 'Evrenini anlat...',
      cancel: 'Iptal',
      create: 'Olustur',
      create_character: 'Karakter Olustur',
      edit_character: 'Karakteri Duzenle',
      character_name: 'Karakter Adi',
      character_name_placeholder: 'ornegin Aethelgard the Wise',
      class_role: 'Sinif / Rol',
      class_role_placeholder: 'ornegin Archmage, Warrior, Rogue',
      type: 'Tur',
      role_protagonist: 'Bas Karakter',
      role_antagonist: 'Karsi Karakter',
      role_npc: 'NPC',
      role_side_character: 'Yan Karakter',
      backstory: 'Gecmis Hikaye',
      backstory_placeholder: 'Karakterin koken hikayesini yaz...',
      create_quest: 'Gorev Olustur',
      edit_quest: 'Gorevi Duzenle',
      quest_title: 'Gorev Basligi',
      quest_title_placeholder: 'ornegin Buyuk Kusatma',
      quest_type: 'Gorev Turu',
      status_label: 'Durum',
      quest_type_main: 'Ana Gorev Zinciri',
      quest_type_side: 'Yan Gorev',
      quest_type_character: 'Karakter Arki',
      quest_status_active: 'Aktif',
      quest_status_completed: 'Tamamlandi',
      quest_status_locked: 'Kilitli',
      quest_desc_placeholder: 'Gorevin hedeflerini anlat...',
      add_trait_title: 'Ozellik Ekle',
      trait_name: 'Ozellik Adi',
      trait_name_placeholder: 'ornegin Cesur, Kurnaz, Bilge',
      trait_style: 'Ozellik Stili',
      trait_default: 'Varsayilan',
      trait_aggressive: 'Saldirgan',
      trait_wise: 'Bilge',
      trait_cowardly: 'Korkak',
      trait_cunning: 'Kurnaz',
      trait_brave: 'Cesur',
      ai_char_generator: 'AI Karakter Uretici',
      ai_char_description: 'Asagidaki parametreleri ayarla ve AI hikayen icin benzersiz bir karakter olustursun.',
      world_genre: 'Dunya Turu',
      character_role: 'Karakter Rolu',
      personality_theme: 'Kisilik Temasi',
      theme_balanced: 'Dengeli',
      theme_dark: 'Karanlik ve Gizemli',
      theme_noble: 'Asil ve Kahramanca',
      theme_trickster: 'Hilekar ve Kurnaz',
      theme_tragic: 'Trajik Kahraman',
      generate_character: 'Karakter Uret',
      regenerate: 'Yeniden Uret',
      add_to_library: 'Kutuphane Ekle',
      ai_location_generator: 'AI Mekan Uretici',
      ai_location_description: 'Ihtiyacin olan mekan turunu tanimla ve AI bunu dunyan icin olustursun.',
      location_type: 'Mekan Turu',
      atmosphere: 'Atmosfer',
      location_type_city: 'Sehir / Kasaba',
      location_type_dungeon: 'Zindan / Magara',
      location_type_wilderness: 'Vahsi Doga / Orman',
      location_type_building: 'Bina / Icmekan',
      location_type_landmark: 'Yapi / Anit',
      mood_mysterious: 'Gizemli',
      mood_dangerous: 'Tehlikeli',
      mood_peaceful: 'Huzurlu',
      mood_eerie: 'Tekinsiz ve Lanetli',
      mood_bustling: 'Canli ve Hareketli',
      generate_location: 'Mekan Uret',
      add_to_world: 'Dunyaya Ekle',
      create_location: 'Mekan Olustur',
      location_name: 'Mekan Adi',
      location_name_placeholder: 'ornegin Firildayan Magaralar',
      location_desc_placeholder: 'Bu mekani anlat...',
      last_edited: 'Son duzenleme {time}',
      just_now: 'Az once',
      new_universe_title: 'Yeni Evren',
      new_universe_desc: 'Yeni bir hikaye kolu baslat ve dunyani sifirdan kur.',
      universe_characters: 'Karakterler',
      universe_quests: 'Gorevler',
      generated_name: 'Uretilen Ad',
      class_race: 'Sinif ve Irk',
      generated_backstory: 'Uretilen Gecmis Hikaye',
      generated_location: 'Uretilen Mekan',
      type_atmosphere: 'Tur ve Atmosfer',
      key_features: 'Temel Ozellikler',
      generated_description: 'Aciklama',
      backstory_saved: 'Gecmis hikaye kaydedildi!',
      ai_suggestion_applied: 'AI onerisi uygulandi! (simulasyon)',
      confirm_delete_universe: 'Bu evreni silmek istedigine emin misin?',
      confirm_delete_character: 'Bu karakteri silmek istedigine emin misin?',
      confirm_delete_quest: 'Bu gorevi silmek istedigine emin misin?',
      confirm_delete_location: 'Bu mekani silmek istiyor musun?',
      generating_character: 'Karakter uretiliyor...',
      generating_location: 'Mekan uretiliyor...',
      select_character_option: 'Bir karakter sec...',
      select_location_option: 'Bir mekan sec...',
      encounter_validation: 'Lutfen bir karakter, mekan ve hikaye onermesi sec.',
      system_label: 'Sistem',
      error_label: 'Hata',
      api_failure: 'API hatasi. Hata: {message}',
      crewai_status: 'CrewAI Motoru - Canli',
      crewai_start_message: 'Kampanya CrewAI coklu ajan orkestrasyonu ile basladi. Ilk ne yapiyorsun?',
      crewai_loading: 'CrewAI zarlarini atiyor...',
      crewai_gm_label: 'Oyun Ustasi (CrewAI)',
      crewai_npc_label: 'Alt Ajan',
      crewai_workflow_label: 'CrewAI Adimlari',
      mcp_context_label: 'MCP Baglami',
      mcp_mechanics_label: 'MCP Mekanikleri',
      combat_started_label: 'Savas Basladi',
      combat_round_label: 'Savas Turu',
      dice_roll_label: 'Zar Sonucu',
      stat_used_label: 'Kullanilan Stat',
      hp_label: 'Can',
      outcome_label: 'Sonuc',
      crewai_hint: 'CrewAI bir Oyun Yoneticisi ajani ve dinamik NPC alt ajanlari kullanir.',
      crewai_arch_title: 'CrewAI Akis Mimarisi',
      crewai_arch_description: 'CrewAI karsilasmayi once Oyun Yoneticisi ajanina yonlendirir, sonra yalnizca gerektiginde NPC alt ajanlari olusturur.',
      crewai_node_2_label: 'Oyun Ustasi',
      crewai_node_2_sub: 'CrewAI Ajan #1',
      crewai_node_3_label: 'NPC Oyuncusu',
      crewai_node_3_sub: 'Dinamik Alt Ajan',
      crewai_node_4_label: 'Final Karsilasma',
      crewai_node_4_sub: 'Anlati + NPC cevaplari',
      langgraph_status: 'LangGraph Is Akisi - Canli',
      langgraph_start_message: 'Kampanya LangGraph is akisi orkestrasyonu ile basladi. Ilk ne yapiyorsun?',
      langgraph_loading: 'LangGraph karsilasma dugumlerinde ilerliyor...',
      langgraph_gm_label: 'Oyun Ustasi (LangGraph)',
      langgraph_npc_label: 'Graf Dugumu',
      langgraph_workflow_label: 'LangGraph Adimlari',
      langgraph_hint: 'LangGraph durum tutan dugumler, kosullu kenarlar ve ortak bir karsilasma durumu kullanir.',
      langgraph_arch_title: 'LangGraph Akis Mimarisi',
      langgraph_arch_description: 'LangGraph ortak durumu hazirlar, bir Oyun Yoneticisi dugumu calistirir, kosullu olarak NPC diyalog dugumlerine dallanir ve final cevabi birlestirir.',
      langgraph_node_2_label: 'Baglam Dugumu',
      langgraph_node_2_sub: 'Ortak karsilasma durumu',
      langgraph_node_3_label: 'OY Yonlendirici',
      langgraph_node_3_sub: 'Yapisal anlati dugumu',
      langgraph_node_4_label: 'NPC Dali',
      langgraph_node_4_sub: 'Kosullu dugum + final birlestirme',
      engine_crewai: 'CrewAI Coklu Ajan',
      engine_langgraph: 'LangGraph Is Akisi',
      insight_cowardly_intellect: '{name} cok yuksek zekaya sahip oldugu icin korkak bir geri cekilmeyi muhtemelen illuzyon buyusu ile orterdi. Gizli gecmisine uyum saglamasi icin ozellik listesine "Aldatici" eklemeyi dusun.',
      insight_aggressive_low_strength: '{name} saldirgan egilimlere sahip ama gucu dusuk. Bu ilgincl bir ic catisma yaratabilir - belki de saldirganligi fiziksel degil sozeldir.',
      insight_brave_aggressive: '{name} cesareti ve saldirganligi sayesinde dogal bir on saflar lideri olabilir. Savas senaryolarinda komuta edecegi bir ekip dusunebilirsin.',
      insight_default: '{name} sahip oldugu ozellik kombinasyonuyla guclu anlati firsatlari sunuyor. Kritik anlarda {charClass} yeteneklerinin kisiligiyle nasil etkilesime girdigini dusun.'
    }
  };

  let currentLanguage = 'en';
  const listeners = new Set();

  function detectInitialLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dictionaries[saved]) return saved;
    return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  }

  function t(key, vars = {}) {
    const dict = dictionaries[currentLanguage] || dictionaries.en;
    const fallback = dictionaries.en[key] || key;
    const template = dict[key] || fallback;
    return template.replace(/\{(\w+)\}/g, (_, varName) => `${vars[varName] ?? ''}`);
  }

  function applyBinding(selector, key, attribute = 'textContent') {
    const element = document.querySelector(selector);
    if (!element) return;
    if (attribute === 'textContent') {
      element.textContent = t(key);
    } else {
      element.setAttribute(attribute, t(key));
    }
  }

  function applyStaticTranslations() {
    const bindings = [
      ['title', 'app_title'],
      ['meta[name="description"]', 'meta_description', 'content'],
      ['#mobileToggle', 'toggle_menu', 'aria-label'],
      ['#nav-world-hub span:last-child', 'nav_world_hub'],
      ['#nav-character-forge span:last-child', 'nav_character_forge'],
      ['#nav-quest-ledger span:last-child', 'nav_quest_ledger'],
      ['#nav-location-forge span:last-child', 'nav_location_forge'],
      ['#nav-lore-master span:last-child', 'nav_lore_master'],
      ['.sidebar__subtitle', 'brand_subtitle'],
      ['.sidebar__user-role', 'user_role'],
      ['.sidebar__locale-label', 'language_label'],
      ['#language-switcher', 'language_selector', 'aria-label'],
      ['#language-switcher option[value="en"]', 'language_en'],
      ['#language-switcher option[value="tr"]', 'language_tr'],
      ['#page-world-hub .page-header__info h1', 'page_world_title'],
      ['#page-world-hub .page-header__info p', 'page_world_subtitle'],
      ['#btn-settings', 'settings'],
      ['#btn-quick-import', 'quick_import'],
      ['#page-world-hub .section-header h2', 'my_universes'],
      ['#page-world-hub .section-header__link', 'view_all'],
      ['.ai-tip-banner__title', 'lore_tip_title'],
      ['#btn-discuss-ai', 'discuss_with_ai'],
      ['#page-character-forge .page-header__info h1', 'page_character_title'],
      ['#page-character-forge .page-header__info p', 'page_character_subtitle'],
      ['#btn-ai-gen-char', 'ai_generate'],
      ['#btn-add-character', 'new_character'],
      ['.char-list__header h3', 'library'],
      ['#page-quest-ledger .page-header__info h1', 'page_quest_title'],
      ['#page-quest-ledger .page-header__info p', 'page_quest_subtitle'],
      ['#btn-add-quest', 'new_quest'],
      ['#page-location-forge .page-header__info h1', 'page_location_title'],
      ['#page-location-forge .page-header__info p', 'page_location_subtitle'],
      ['#btn-ai-gen-location', 'ai_generate'],
      ['#btn-add-location', 'new_location'],
      ['#page-lore-master .ai-hero h1', 'encounter_title'],
      ['#page-lore-master .ai-hero p', 'encounter_subtitle'],
      ['#encounter-setup .section-title', 'encounter_setup'],
      ['label[for="enc-character"]', 'encounter_select_character'],
      ['#enc-character option[value=""]', 'loading_characters'],
      ['label[for="enc-location"]', 'encounter_select_location'],
      ['#enc-location option[value=""]', 'loading_locations'],
      ['label[for="enc-premise"]', 'story_premise'],
      ['#enc-premise', 'story_premise_placeholder', 'placeholder'],
      ['label[for="enc-engine"]', 'ai_engine_label'],
      ['#enc-engine option[value="crewai"]', 'engine_crewai'],
      ['#enc-engine option[value="langgraph"]', 'engine_langgraph'],
      ['#btn-start-encounter', 'start_campaign'],
      ['#btn-end-encounter', 'end_encounter'],
      ['#ai-input', 'ai_input_placeholder', 'placeholder'],
      ['#btn-ai-send', 'act'],
      ['#arch-flow .arch-node:first-child .arch-node__label', 'architecture_player_action'],
      ['#arch-flow .arch-node:first-child .arch-node__sub', 'architecture_frontend'],
      ['#modal-universe-title', 'create_universe'],
      ['label[for="universe-name"]', 'universe_name'],
      ['#universe-name', 'universe_name_placeholder', 'placeholder'],
      ['label[for="universe-genre"]', 'genre'],
      ['#universe-genre option[value="cyberpunk"]', 'genre_cyberpunk'],
      ['#universe-genre option[value="fantasy"]', 'genre_fantasy'],
      ['#universe-genre option[value="scifi"]', 'genre_scifi'],
      ['#universe-genre option[value="horror"]', 'genre_horror'],
      ['#universe-genre option[value="steampunk"]', 'genre_steampunk'],
      ['label[for="universe-desc"]', 'description'],
      ['#universe-desc', 'universe_desc_placeholder', 'placeholder'],
      ['#modal-universe-cancel', 'cancel'],
      ['#modal-universe-submit', 'create'],
      ['#modal-character-title', 'create_character'],
      ['label[for="char-name"]', 'character_name'],
      ['#char-name', 'character_name_placeholder', 'placeholder'],
      ['label[for="char-class"]', 'class_role'],
      ['#char-class', 'class_role_placeholder', 'placeholder'],
      ['label[for="char-role-type"]', 'type'],
      ['#char-role-type option[value="Protagonist"]', 'role_protagonist'],
      ['#char-role-type option[value="Antagonist"]', 'role_antagonist'],
      ['#char-role-type option[value="NPC"]', 'role_npc'],
      ['#char-role-type option[value="Side Character"]', 'role_side_character'],
      ['label[for="char-backstory"]', 'backstory'],
      ['#char-backstory-input', 'backstory_placeholder', 'placeholder'],
      ['#modal-character-cancel', 'cancel'],
      ['#modal-character-submit', 'create'],
      ['#modal-quest-title', 'create_quest'],
      ['label[for="quest-name"]', 'quest_title'],
      ['#quest-name', 'quest_title_placeholder', 'placeholder'],
      ['label[for="quest-type"]', 'quest_type'],
      ['#quest-type option[value="main"]', 'quest_type_main'],
      ['#quest-type option[value="side"]', 'quest_type_side'],
      ['#quest-type option[value="character"]', 'quest_type_character'],
      ['label[for="quest-status-input"]', 'status_label'],
      ['#quest-status-input option[value="active"]', 'quest_status_active'],
      ['#quest-status-input option[value="completed"]', 'quest_status_completed'],
      ['#quest-status-input option[value="locked"]', 'quest_status_locked'],
      ['label[for="quest-desc-input"]', 'description'],
      ['#quest-desc-input', 'quest_desc_placeholder', 'placeholder'],
      ['#modal-quest-cancel', 'cancel'],
      ['#modal-quest-submit', 'create'],
      ['#modal-trait .modal__title', 'add_trait_title'],
      ['label[for="trait-name"]', 'trait_name'],
      ['#trait-name', 'trait_name_placeholder', 'placeholder'],
      ['label[for="trait-type"]', 'trait_style'],
      ['#trait-type option[value="default"]', 'trait_default'],
      ['#trait-type option[value="aggressive"]', 'trait_aggressive'],
      ['#trait-type option[value="wise"]', 'trait_wise'],
      ['#trait-type option[value="cowardly"]', 'trait_cowardly'],
      ['#trait-type option[value="cunning"]', 'trait_cunning'],
      ['#trait-type option[value="brave"]', 'trait_brave'],
      ['#modal-trait-cancel', 'cancel'],
      ['#form-trait button[type="submit"]', 'add_trait'],
      ['#modal-ai-char .modal__title', 'ai_char_generator'],
      ['#ai-gen-char-config > p', 'ai_char_description'],
      ['label[for="ai-char-genre"]', 'world_genre'],
      ['#ai-char-genre option[value="fantasy"]', 'genre_fantasy'],
      ['#ai-char-genre option[value="cyberpunk"]', 'genre_cyberpunk'],
      ['#ai-char-genre option[value="scifi"]', 'genre_scifi'],
      ['#ai-char-genre option[value="horror"]', 'genre_horror'],
      ['#ai-char-genre option[value="steampunk"]', 'genre_steampunk'],
      ['label[for="ai-char-role"]', 'character_role'],
      ['#ai-char-role option[value="Protagonist"]', 'role_protagonist'],
      ['#ai-char-role option[value="Antagonist"]', 'role_antagonist'],
      ['#ai-char-role option[value="NPC"]', 'role_npc'],
      ['#ai-char-role option[value="Side Character"]', 'role_side_character'],
      ['label[for="ai-char-theme"]', 'personality_theme'],
      ['#ai-char-theme option[value="balanced"]', 'theme_balanced'],
      ['#ai-char-theme option[value="dark"]', 'theme_dark'],
      ['#ai-char-theme option[value="noble"]', 'theme_noble'],
      ['#ai-char-theme option[value="trickster"]', 'theme_trickster'],
      ['#ai-char-theme option[value="tragic"]', 'theme_tragic'],
      ['#modal-ai-char-cancel', 'cancel'],
      ['#btn-ai-char-generate', 'generate_character'],
      ['#btn-ai-char-retry', 'regenerate'],
      ['#btn-ai-char-accept', 'add_to_library'],
      ['#modal-ai-location .modal__title', 'ai_location_generator'],
      ['#ai-gen-loc-config > p', 'ai_location_description'],
      ['label[for="ai-loc-genre"]', 'world_genre'],
      ['#ai-loc-genre option[value="fantasy"]', 'genre_fantasy'],
      ['#ai-loc-genre option[value="cyberpunk"]', 'genre_cyberpunk'],
      ['#ai-loc-genre option[value="scifi"]', 'genre_scifi'],
      ['#ai-loc-genre option[value="horror"]', 'genre_horror'],
      ['#ai-loc-genre option[value="steampunk"]', 'genre_steampunk'],
      ['label[for="ai-loc-type"]', 'location_type'],
      ['#ai-loc-type option[value="city"]', 'location_type_city'],
      ['#ai-loc-type option[value="dungeon"]', 'location_type_dungeon'],
      ['#ai-loc-type option[value="wilderness"]', 'location_type_wilderness'],
      ['#ai-loc-type option[value="building"]', 'location_type_building'],
      ['#ai-loc-type option[value="landmark"]', 'location_type_landmark'],
      ['label[for="ai-loc-mood"]', 'atmosphere'],
      ['#ai-loc-mood option[value="mysterious"]', 'mood_mysterious'],
      ['#ai-loc-mood option[value="dangerous"]', 'mood_dangerous'],
      ['#ai-loc-mood option[value="peaceful"]', 'mood_peaceful'],
      ['#ai-loc-mood option[value="eerie"]', 'mood_eerie'],
      ['#ai-loc-mood option[value="bustling"]', 'mood_bustling'],
      ['#modal-ai-location-cancel', 'cancel'],
      ['#btn-ai-loc-generate', 'generate_location'],
      ['#btn-ai-loc-retry', 'regenerate'],
      ['#btn-ai-loc-accept', 'add_to_world'],
      ['#modal-location-title', 'create_location'],
      ['label[for="loc-name"]', 'location_name'],
      ['#loc-name', 'location_name_placeholder', 'placeholder'],
      ['label[for="loc-type-input"]', 'type'],
      ['#loc-type-input option[value="city"]', 'location_type_city'],
      ['#loc-type-input option[value="dungeon"]', 'location_type_dungeon'],
      ['#loc-type-input option[value="wilderness"]', 'location_type_wilderness'],
      ['#loc-type-input option[value="building"]', 'location_type_building'],
      ['#loc-type-input option[value="landmark"]', 'location_type_landmark'],
      ['label[for="loc-desc-input"]', 'description'],
      ['#loc-desc-input', 'location_desc_placeholder', 'placeholder'],
      ['#modal-location-cancel', 'cancel'],
      ['#modal-location-submit', 'create']
    ];

    bindings.forEach(([selector, key, attribute]) => applyBinding(selector, key, attribute));
    document.documentElement.lang = currentLanguage === 'tr' ? 'tr' : 'en';
  }

  function localizeRelativeTime(value) {
    if (!value) return '';
    if (value === 'Just now') return t('just_now');
    if (currentLanguage === 'en') return value;
    const hourMatch = value.match(/^(\d+)h ago$/);
    if (hourMatch) return `${hourMatch[1]} sa once`;
    const dayMatch = value.match(/^(\d+)d ago$/);
    if (dayMatch) return `${dayMatch[1]} gun once`;
    return value;
  }

  function translateGenre(value) {
    const map = { cyberpunk: 'genre_cyberpunk', fantasy: 'genre_fantasy', scifi: 'genre_scifi', horror: 'genre_horror', steampunk: 'genre_steampunk' };
    return t(map[value] || value);
  }

  function translateRoleType(value) {
    const map = { Protagonist: 'role_protagonist', Antagonist: 'role_antagonist', NPC: 'role_npc', 'Side Character': 'role_side_character' };
    return t(map[value] || value);
  }

  function translateQuestType(value) {
    const map = { main: 'quest_type_main', side: 'quest_type_side', character: 'quest_type_character' };
    return t(map[value] || value);
  }

  function translateQuestStatus(value) {
    const map = { active: 'quest_status_active', completed: 'quest_status_completed', locked: 'quest_status_locked' };
    return t(map[value] || value);
  }

  function translateLocationType(value) {
    const map = { city: 'location_type_city', dungeon: 'location_type_dungeon', wilderness: 'location_type_wilderness', building: 'location_type_building', landmark: 'location_type_landmark' };
    return t(map[value] || value);
  }

  function translateMood(value) {
    const map = { mysterious: 'mood_mysterious', dangerous: 'mood_dangerous', peaceful: 'mood_peaceful', eerie: 'mood_eerie', bustling: 'mood_bustling' };
    return t(map[value] || value);
  }

  function translateNpcName(name) {
    if (currentLanguage !== 'tr' || !name) return name;
    const exactMap = {
      Guard: 'Muhafiz',
      'City Guard': 'Sehir Muhafizi',
      Captain: 'Kaptan',
      Warden: 'Gardiyan',
      Envoy: 'Elci',
      Noble: 'Soylu',
      Merchant: 'Tuccar',
      Villager: 'Koylu'
    };
    return exactMap[name] || name;
  }

  function init() {
    currentLanguage = detectInitialLanguage();
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
      switcher.value = currentLanguage;
      switcher.addEventListener('change', (event) => setLanguage(event.target.value));
    }
    applyStaticTranslations();
  }

  function setLanguage(language) {
    if (!dictionaries[language] || language === currentLanguage) return;
    currentLanguage = language;
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    applyStaticTranslations();
    document.dispatchEvent(new CustomEvent('museai:languagechange', { detail: { language: currentLanguage } }));
    listeners.forEach(listener => listener(currentLanguage));
  }

  function getLanguage() { return currentLanguage; }
  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    init,
    t,
    setLanguage,
    getLanguage,
    onChange,
    translateGenre,
    translateRoleType,
    translateQuestType,
    translateQuestStatus,
    translateLocationType,
    translateMood,
    translateNpcName,
    localizeRelativeTime
  };
})();


const Renderer = (() => {

  // ── Helpers ──
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Stats Bar ──
  function renderStatsBar(container, stats) {
    container.innerHTML = `
      <div class="stat-card animate-slide stagger-1">
        <div>
          <div class="stat-card__label">${Language.t('stats_total_universes')}</div>
          <div class="stat-card__value">${stats.totalUniverses}</div>
        </div>
        <div class="stat-card__icon">🌐</div>
      </div>
      <div class="stat-card animate-slide stagger-2">
        <div>
          <div class="stat-card__label">${Language.t('stats_active_characters')}</div>
          <div class="stat-card__value">${stats.activeCharacters}</div>
        </div>
        <div class="stat-card__icon">👥</div>
      </div>
      <div class="stat-card animate-slide stagger-3">
        <div>
          <div class="stat-card__label">${Language.t('stats_quests_completed')}</div>
          <div class="stat-card__value">${stats.questsCompleted}</div>
        </div>
        <div class="stat-card__icon">✅</div>
      </div>
    `;
  }

  // ── Universe Grid ──
  function renderUniverseGrid(container, universes) {
    let html = universes.map((uni, i) => `
      <div class="card universe-card card--glow animate-slide stagger-${i + 1}" data-id="${uni.id}">
        <div class="universe-card__image-wrapper">
          <img class="card__image" src="${escapeHtml(uni.image)}" alt="${escapeHtml(uni.name)}" loading="lazy">
          <span class="universe-card__badge badge--${uni.genre}">${escapeHtml(Language.translateGenre(uni.genre))}</span>
        </div>
        <div class="card__body">
          <h3 class="universe-card__title">${escapeHtml(uni.name)}</h3>
          <p class="universe-card__desc">${escapeHtml(uni.description)}</p>
          <div class="universe-card__stats">
            <div>
              <div class="universe-card__stat-label">${Language.t('universe_characters')}</div>
              <div class="universe-card__stat-value">${uni.characters}</div>
            </div>
            <div>
              <div class="universe-card__stat-label">${Language.t('universe_quests')}</div>
              <div class="universe-card__stat-value">${uni.quests}</div>
            </div>
          </div>
        </div>
        <div class="card__footer">
          <span class="universe-card__meta">${Language.t('last_edited', { time: Language.localizeRelativeTime(uni.lastEdited) })}</span>
          <div class="flex gap-sm">
            <button class="btn btn--sm btn--outline btn-edit-universe" data-id="${uni.id}" title="${Language.t('edit')}">✏️</button>
            <button class="btn btn--sm btn--danger btn-delete-universe" data-id="${uni.id}" title="${Language.t('delete')}">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');

    html += `
      <div class="card universe-card--new animate-slide stagger-${universes.length + 1}" id="btn-new-universe">
        <div class="universe-card--new__icon">＋</div>
        <div class="universe-card--new__title">${Language.t('new_universe_title')}</div>
        <p class="universe-card--new__desc">${Language.t('new_universe_desc')}</p>
      </div>
    `;

    container.innerHTML = html;
  }

  // ── Character List ──
  function renderCharacterList(container, characters, activeId) {
    if (characters.length === 0) {
      container.innerHTML = `<div class="empty-state"><p class="text-muted">${Language.t('no_characters_yet')}</p></div>`;
      return;
    }
    container.innerHTML = characters.map(char => `
      <div class="char-list-item ${char.id === activeId ? 'active' : ''}" data-id="${char.id}">
        ${char.image
          ? `<img class="char-list-item__avatar" src="${escapeHtml(char.image)}" alt="${escapeHtml(char.name)}">`
          : `<div class="char-list-item__avatar" style="background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));display:flex;align-items:center;justify-content:center;font-size:1.1rem;border-radius:var(--radius-md);">⚔️</div>`
        }
        <div>
          <div class="char-list-item__name">${escapeHtml(char.name)}</div>
          <div class="char-list-item__role">${escapeHtml(char.charClass)} · ${escapeHtml(Language.translateRoleType(char.roleType))}</div>
        </div>
      </div>
    `).join('');
  }

  // ── Character Detail ──
  function renderCharacterDetail(container, char) {
    if (!char) {
      container.innerHTML = `
        <div class="empty-state" id="char-empty-state">
          <div class="empty-state__icon">⚔️</div>
          <div class="empty-state__title">${Language.t('select_character')}</div>
          <p class="empty-state__desc">${Language.t('choose_character_from_library')}</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="char-detail__header animate-slide">
        ${char.image
          ? `<img class="char-detail__avatar" src="${escapeHtml(char.image)}" alt="${escapeHtml(char.name)}">`
          : `<div class="char-detail__avatar" style="background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));display:flex;align-items:center;justify-content:center;font-size:2rem;border-radius:var(--radius-lg);">⚔️</div>`
        }
        <div>
          <h2 class="char-detail__name">${escapeHtml(char.name)}</h2>
          <div class="char-detail__tags">
            <span class="tag tag--class">${escapeHtml(char.charClass)}</span>
            <span class="tag tag--level">${Language.t('level_short', { level: char.level })}</span>
            <span class="tag tag--race">${escapeHtml(char.race)}</span>
          </div>
        </div>
      </div>

      <div class="char-section animate-slide">
        <h3 class="char-section__title"><span>📖</span> ${Language.t('character_backstory_origins')}</h3>
        <textarea class="char-backstory" id="char-backstory-edit" data-id="${char.id}">${escapeHtml(char.backstory)}</textarea>
      </div>

      <div class="char-section animate-slide">
        <h3 class="char-section__title"><span>🎯</span> ${Language.t('personality_traits')}</h3>
        <div class="traits-container" id="traits-container">
          ${char.traits.map((trait, idx) => `
            <div class="trait-chip trait-chip--${trait.type}">
              <span class="trait-chip__icon">${getTraitIcon(trait.type)}</span>
              <span>${escapeHtml(trait.name)}</span>
              <button class="trait-chip__remove btn-remove-trait" data-char-id="${char.id}" data-index="${idx}">✕</button>
            </div>
          `).join('')}
          <button class="add-trait-btn" id="btn-add-trait" data-char-id="${char.id}">+ ${Language.t('add_trait')}</button>
        </div>
      </div>

      <div class="char-actions animate-slide">
        <button class="btn btn--danger btn-delete-char" data-id="${char.id}">🗑️ ${Language.t('delete_character')}</button>
        <button class="btn btn--primary btn-save-backstory" data-id="${char.id}">💾 ${Language.t('save_changes')}</button>
      </div>
    `;
  }

  function getTraitIcon(type) {
    const icons = {
      aggressive: '⚡', wise: '📚', cowardly: '⚠️',
      cunning: '🎭', brave: '🛡️', default: '✦',
    };
    return icons[type] || icons.default;
  }

  // ── Character Stats Panel ──
  function renderStatsPanel(container, char) {
    if (!char) {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';
    container.innerHTML = `
      <div class="stat-block animate-slide">
        <h3 class="stat-block__title"><span>📊</span> ${Language.t('core_stats')}</h3>
        ${renderStatRow(Language.t('stat_strength'), char.stats.strength, 'strength', char.id)}
        ${renderStatRow(Language.t('stat_intellect'), char.stats.intellect, 'intellect', char.id)}
        ${renderStatRow(Language.t('stat_agility'), char.stats.agility, 'agility', char.id)}
        ${renderStatRow(Language.t('stat_charisma'), char.stats.charisma, 'charisma', char.id)}
      </div>
      <div class="ai-insights animate-slide">
        <h3 class="ai-insights__title"><span>✨</span> ${Language.t('ai_insights')}</h3>
        <p class="ai-insights__text" id="ai-char-insight">${generateCharInsight(char)}</p>
        <button class="btn btn--primary btn--sm w-full" id="btn-apply-suggestion">${Language.t('apply_suggestion')}</button>
      </div>
    `;
  }

  function renderStatRow(label, value, key, charId) {
    return `
      <div class="stat-row">
        <span class="stat-row__label">${label}</span>
        <span class="stat-row__value" style="color: ${getStatColor(value)}">${value} / 100</span>
      </div>
      <div class="stat-bar">
        <div class="stat-bar__fill stat-bar__fill--${key}" style="width: ${value}%"></div>
      </div>
      <input type="range" min="0" max="100" value="${value}"
        class="stat-slider hidden" data-stat="${key}" data-char-id="${charId}"
        style="width:100%;margin-bottom:var(--space-md);accent-color:var(--color-primary);">
    `;
  }

  function getStatColor(value) {
    if (value >= 80) return 'var(--color-accent-green)';
    if (value >= 50) return 'var(--color-primary-light)';
    if (value >= 30) return 'var(--color-accent-amber)';
    return 'var(--color-accent-red)';
  }

  function generateCharInsight(char) {
    const traitNames = char.traits.map(t => t.name.toLowerCase());
    if (traitNames.includes('cowardly') && char.stats.intellect > 80) {
      return `"${Language.t('insight_cowardly_intellect', { name: char.name })}"`;
    }
    if (traitNames.includes('aggressive') && char.stats.strength < 30) {
      return `"${Language.t('insight_aggressive_low_strength', { name: char.name })}"`;
    }
    if (traitNames.includes('brave') && traitNames.includes('aggressive')) {
      return `"${Language.t('insight_brave_aggressive', { name: char.name })}"`;
    }
    return `"${Language.t('insight_default', { name: char.name, charClass: char.charClass })}"`;
  }

  // ── Quest List ──
  function renderQuestList(container, quests, activeId) {
    if (quests.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📜</div>
          <div class="empty-state__title">${Language.t('no_quests_yet')}</div>
          <p class="empty-state__desc">${Language.t('create_first_quest')}</p>
        </div>`;
      return;
    }

    container.innerHTML = quests.map((quest, i) => `
      <div class="quest-card ${quest.id === activeId ? 'active' : ''} animate-slide stagger-${i + 1}" data-id="${quest.id}">
        <div class="quest-card__icon quest-card__icon--${quest.status === 'locked' ? 'locked' : quest.type === 'main' ? 'main' : 'side'}">
          ${getQuestIcon(quest.type)}
        </div>
        <div style="flex:1;">
          <div class="flex items-center justify-between">
            <h3 class="quest-card__title">${escapeHtml(quest.title)}</h3>
            <span class="status-badge status-badge--${quest.status}">${Language.translateQuestStatus(quest.status)}</span>
          </div>
          <div class="quest-card__type">${Language.translateQuestType(quest.type)} · ${quest.phase}</div>
          <p class="quest-card__desc">${escapeHtml(quest.description)}</p>
        </div>
      </div>
    `).join('');
  }

  function getQuestIcon(type) {
    const icons = { main: '⚔️', side: '🗺️', character: '👤' };
    return icons[type] || '📜';
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ── Quest Detail ──
  function renderQuestDetail(container, quest) {
    if (!quest) {
      container.innerHTML = `
        <div class="empty-state" id="quest-empty-state">
          <div class="empty-state__icon">📜</div>
          <div class="empty-state__title">${Language.t('select_quest')}</div>
          <p class="empty-state__desc">${Language.t('choose_quest_from_list')}</p>
        </div>`;
      return;
    }

    const completedCount = quest.milestones.filter(m => m.done).length;
    const totalCount = quest.milestones.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    container.innerHTML = `
      <div class="animate-slide">
        <div class="flex items-center justify-between mb-md">
          <h2 class="quest-detail__title">${escapeHtml(quest.title)}</h2>
          <span class="status-badge status-badge--${quest.status}">${Language.translateQuestStatus(quest.status)}</span>
        </div>
        <p style="font-size:0.88rem;color:var(--color-text-secondary);margin-bottom:var(--space-md);">${escapeHtml(quest.description)}</p>

        <div class="quest-detail__section-title">${Language.t('progress')} - ${progressPct}%</div>
        <div class="stat-bar mb-lg">
          <div class="stat-bar__fill" style="width:${progressPct}%;background:linear-gradient(90deg,var(--color-accent-green),var(--color-accent-cyan));"></div>
        </div>

        <div class="quest-detail__section-title">${Language.t('milestones')}</div>
        <div class="milestone-list" id="milestone-list">
          ${quest.milestones.map((ms, idx) => `
            <div class="milestone ${ms.done ? 'milestone--done' : idx === completedCount ? 'milestone--active' : ''}">
              <div class="milestone__dot" data-quest-id="${quest.id}" data-ms-idx="${idx}" style="cursor:pointer;">${ms.done ? '✓' : idx === completedCount ? '▶' : ''}</div>
              <div>
                <div class="milestone__title" style="${ms.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${escapeHtml(ms.text)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="flex gap-sm mt-lg" style="justify-content:flex-end;">
          <button class="btn btn--danger btn--sm btn-delete-quest" data-id="${quest.id}">🗑️ ${Language.t('delete')}</button>
          <button class="btn btn--outline btn--sm btn-edit-quest" data-id="${quest.id}">✏️ ${Language.t('edit')}</button>
        </div>
      </div>
    `;
  }

  return {
    renderStatsBar, renderUniverseGrid,
    renderCharacterList, renderCharacterDetail, renderStatsPanel,
    renderQuestList, renderQuestDetail,
    escapeHtml, capitalize,
  };
})();


/* ============================================================
   3. MODAL MANAGER — Centralized Modal Control
   ============================================================ */
const ModalManager = (() => {
  /** Open a modal by overlay ID */
  function open(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) overlay.classList.add('open');
  }

  /** Close a modal by overlay ID, reset its form */
  function close(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    overlay.classList.remove('open');
    const form = overlay.querySelector('form');
    if (form) form.reset();
    // Reset hidden edit IDs
    const hiddenInput = overlay.querySelector('input[type="hidden"]');
    if (hiddenInput) hiddenInput.value = '';
  }

  /** Setup close-on-backdrop-click for all modals */
  function setupBackdropClose() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(overlay.id);
      });
    });
  }

  return { open, close, setupBackdropClose };
})();


/* ============================================================
   4. ROUTER — SPA Page Navigation
   ============================================================ */
const Router = (() => {
  let currentPage = 'world-hub';

  function navigateTo(pageId) {
    if (pageId === currentPage) return;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

    // Show target page
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('animate-fade');
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');

    currentPage = pageId;

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');
  }

  function getCurrentPage() { return currentPage; }

  return { navigateTo, getCurrentPage };
})();





/* ============================================================
   6. CONTROLLER — Event Handling & Orchestration
   ============================================================ */
const Controller = (() => {
  let selectedCharacterId = null;
  let selectedQuestId = null;

  function init() {
    DataStore.load();
    Language.init();
    ModalManager.setupBackdropClose();
    bindNavigation();
    bindWorldHub();
    bindCharacterForge();
    bindQuestLedger();
    bindMobileToggle();
    Language.onChange(() => {
      renderWorldHub();
      renderCharacterForge();
      renderQuestLedger();
      document.dispatchEvent(new CustomEvent('museai:location-render-request'));
    });
    renderWorldHub();
  }

  // ── Navigation ──
  function bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        Router.navigateTo(page);
        onPageChange(page);
      });
    });
  }

  function onPageChange(page) {
    switch (page) {
      case 'world-hub':       renderWorldHub(); break;
      case 'character-forge': renderCharacterForge(); break;
      case 'quest-ledger':    renderQuestLedger(); break;
      case 'location-forge':  document.dispatchEvent(new CustomEvent('museai:location-render-request')); break;
      case 'lore-master':     break; // Static page
    }
  }

  // ── Mobile Toggle ──
  function bindMobileToggle() {
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  /* ─────────────────────────────────────────
     WORLD HUB
     ───────────────────────────────────────── */
  function renderWorldHub() {
    Renderer.renderStatsBar(document.getElementById('stats-bar'), DataStore.getStats());
    Renderer.renderUniverseGrid(document.getElementById('universe-grid'), DataStore.getUniverses());
    bindUniverseGridEvents();
  }

  function bindWorldHub() {
    // "New Universe" card & Quick Import
    document.getElementById('btn-quick-import')?.addEventListener('click', () => openUniverseModal());

    // Form submit
    document.getElementById('form-universe')?.addEventListener('submit', handleUniverseSubmit);

    // Modal close buttons
    document.getElementById('modal-universe-close')?.addEventListener('click', () => ModalManager.close('modal-universe'));
    document.getElementById('modal-universe-cancel')?.addEventListener('click', () => ModalManager.close('modal-universe'));

    // "Discuss with AI" navigates to Lore-Master
    document.getElementById('btn-discuss-ai')?.addEventListener('click', () => Router.navigateTo('lore-master'));
  }

  function bindUniverseGridEvents() {
    // New universe card
    document.getElementById('btn-new-universe')?.addEventListener('click', () => openUniverseModal());

    // Edit / Delete buttons (event delegation)
    document.getElementById('universe-grid')?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-universe');
      const deleteBtn = e.target.closest('.btn-delete-universe');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openUniverseModal(id);
      } else if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (confirm(Language.t('confirm_delete_universe'))) {
          DataStore.deleteUniverse(id);
          renderWorldHub();
        }
      }
    });
  }

  function openUniverseModal(editId) {
    const titleEl = document.getElementById('modal-universe-title');
    const submitBtn = document.getElementById('modal-universe-submit');
    const hiddenId = document.getElementById('universe-edit-id');

    if (editId) {
      const uni = DataStore.getUniverses().find(u => u.id === editId);
      if (!uni) return;
      titleEl.textContent = Language.t('edit_universe');
      submitBtn.textContent = Language.t('save_changes');
      hiddenId.value = editId;
      document.getElementById('universe-name').value = uni.name;
      document.getElementById('universe-genre').value = uni.genre;
      document.getElementById('universe-desc').value = uni.description;
    } else {
      titleEl.textContent = Language.t('create_universe');
      submitBtn.textContent = Language.t('create');
      hiddenId.value = '';
    }
    ModalManager.open('modal-universe');
  }

  function handleUniverseSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('universe-edit-id').value;
    const data = {
      name: document.getElementById('universe-name').value.trim(),
      genre: document.getElementById('universe-genre').value,
      description: document.getElementById('universe-desc').value.trim(),
    };

    if (!data.name) return;

    if (editId) {
      DataStore.updateUniverse(editId, data);
    } else {
      DataStore.addUniverse(data);
    }

    ModalManager.close('modal-universe');
    renderWorldHub();
  }

  /* ─────────────────────────────────────────
     CHARACTER FORGE
     ───────────────────────────────────────── */
  function renderCharacterForge() {
    const characters = DataStore.getCharacters();
    Renderer.renderCharacterList(document.getElementById('char-list'), characters, selectedCharacterId);
    bindCharacterListEvents();

    if (selectedCharacterId) {
      renderSelectedCharacter();
    } else {
      Renderer.renderCharacterDetail(document.getElementById('char-detail'), null);
      Renderer.renderStatsPanel(document.getElementById('char-stats-panel'), null);
    }
  }

  function bindCharacterForge() {
    // "New Character" button
    document.getElementById('btn-add-character')?.addEventListener('click', () => openCharacterModal());

    // Form submit
    document.getElementById('form-character')?.addEventListener('submit', handleCharacterSubmit);

    // Modal close buttons
    document.getElementById('modal-character-close')?.addEventListener('click', () => ModalManager.close('modal-character'));
    document.getElementById('modal-character-cancel')?.addEventListener('click', () => ModalManager.close('modal-character'));

    // Add Trait modal
    document.getElementById('form-trait')?.addEventListener('submit', handleTraitSubmit);
    document.getElementById('modal-trait-close')?.addEventListener('click', () => ModalManager.close('modal-trait'));
    document.getElementById('modal-trait-cancel')?.addEventListener('click', () => ModalManager.close('modal-trait'));
  }

  function bindCharacterListEvents() {
    document.querySelectorAll('.char-list-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedCharacterId = item.getAttribute('data-id');
        renderCharacterForge();
      });
    });
  }

  function renderSelectedCharacter() {
    const char = DataStore.getCharacter(selectedCharacterId);
    Renderer.renderCharacterDetail(document.getElementById('char-detail'), char);
    Renderer.renderStatsPanel(document.getElementById('char-stats-panel'), char);
    bindCharacterDetailEvents();
  }

  function bindCharacterDetailEvents() {
    // Save backstory
    document.querySelector('.btn-save-backstory')?.addEventListener('click', (e) => {
      const charId = e.target.getAttribute('data-id');
      const backstory = document.getElementById('char-backstory-edit')?.value || '';
      DataStore.updateCharacter(charId, { backstory });
      showToast(Language.t('backstory_saved'));
    });

    // Delete character
    document.querySelector('.btn-delete-char')?.addEventListener('click', (e) => {
      const charId = e.target.getAttribute('data-id');
      if (confirm(Language.t('confirm_delete_character'))) {
        DataStore.deleteCharacter(charId);
        selectedCharacterId = null;
        renderCharacterForge();
      }
    });

    // Remove trait
    document.querySelectorAll('.btn-remove-trait').forEach(btn => {
      btn.addEventListener('click', () => {
        const charId = btn.getAttribute('data-char-id');
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        DataStore.removeTraitFromCharacter(charId, idx);
        renderSelectedCharacter();
      });
    });

    // Add trait button
    document.getElementById('btn-add-trait')?.addEventListener('click', () => {
      ModalManager.open('modal-trait');
    });

    // Stat sliders (if shown)
    document.querySelectorAll('.stat-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const charId = e.target.getAttribute('data-char-id');
        const stat = e.target.getAttribute('data-stat');
        DataStore.updateCharacterStat(charId, stat, e.target.value);
        renderSelectedCharacter();
      });
    });

    // AI Apply Suggestion
    document.getElementById('btn-apply-suggestion')?.addEventListener('click', () => {
      showToast(Language.t('ai_suggestion_applied'));
    });
  }

  function openCharacterModal(editId) {
    const titleEl = document.getElementById('modal-character-title');
    const submitBtn = document.getElementById('modal-character-submit');
    const hiddenId = document.getElementById('char-edit-id');

    if (editId) {
      const char = DataStore.getCharacter(editId);
      if (!char) return;
      titleEl.textContent = Language.t('edit_character');
      submitBtn.textContent = Language.t('save_changes');
      hiddenId.value = editId;
      document.getElementById('char-name').value = char.name;
      document.getElementById('char-class').value = char.charClass;
      document.getElementById('char-role-type').value = char.roleType;
      document.getElementById('char-backstory-input').value = char.backstory;
    } else {
      titleEl.textContent = Language.t('create_character');
      submitBtn.textContent = Language.t('create');
      hiddenId.value = '';
    }
    ModalManager.open('modal-character');
  }

  function handleCharacterSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('char-edit-id').value;
    const data = {
      name: document.getElementById('char-name').value.trim(),
      charClass: document.getElementById('char-class').value.trim(),
      roleType: document.getElementById('char-role-type').value,
      backstory: document.getElementById('char-backstory-input').value.trim(),
    };

    if (!data.name) return;

    if (editId) {
      DataStore.updateCharacter(editId, data);
    } else {
      const newChar = DataStore.addCharacter(data);
      selectedCharacterId = newChar.id;
    }

    ModalManager.close('modal-character');
    renderCharacterForge();
  }

  function handleTraitSubmit(e) {
    e.preventDefault();
    if (!selectedCharacterId) return;
    const traitName = document.getElementById('trait-name').value.trim();
    const traitType = document.getElementById('trait-type').value;
    if (!traitName) return;

    DataStore.addTraitToCharacter(selectedCharacterId, { name: traitName, type: traitType });
    ModalManager.close('modal-trait');
    renderSelectedCharacter();
  }

  /* ─────────────────────────────────────────
     QUEST LEDGER
     ───────────────────────────────────────── */
  function renderQuestLedger() {
    const quests = DataStore.getQuests();
    Renderer.renderQuestList(document.getElementById('quest-list'), quests, selectedQuestId);
    bindQuestListEvents();

    if (selectedQuestId) {
      renderSelectedQuest();
    } else {
      Renderer.renderQuestDetail(document.getElementById('quest-detail'), null);
    }
  }

  function bindQuestLedger() {
    // "New Quest" button
    document.getElementById('btn-add-quest')?.addEventListener('click', () => openQuestModal());

    // Form submit
    document.getElementById('form-quest')?.addEventListener('submit', handleQuestSubmit);

    // Modal close
    document.getElementById('modal-quest-close')?.addEventListener('click', () => ModalManager.close('modal-quest'));
    document.getElementById('modal-quest-cancel')?.addEventListener('click', () => ModalManager.close('modal-quest'));
  }

  function bindQuestListEvents() {
    document.querySelectorAll('.quest-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedQuestId = card.getAttribute('data-id');
        renderQuestLedger();
      });
    });
  }

  function renderSelectedQuest() {
    const quest = DataStore.getQuest(selectedQuestId);
    Renderer.renderQuestDetail(document.getElementById('quest-detail'), quest);
    bindQuestDetailEvents();
  }

  function bindQuestDetailEvents() {
    // Milestone toggle
    document.querySelectorAll('.milestone__dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const questId = dot.getAttribute('data-quest-id');
        const msIdx = parseInt(dot.getAttribute('data-ms-idx'), 10);
        DataStore.toggleMilestone(questId, msIdx);
        renderQuestLedger();
      });
    });

    // Delete quest
    document.querySelector('.btn-delete-quest')?.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm(Language.t('confirm_delete_quest'))) {
        DataStore.deleteQuest(id);
        selectedQuestId = null;
        renderQuestLedger();
      }
    });

    // Edit quest
    document.querySelector('.btn-edit-quest')?.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openQuestModal(id);
    });
  }

  function openQuestModal(editId) {
    const titleEl = document.getElementById('modal-quest-title');
    const submitBtn = document.getElementById('modal-quest-submit');
    const hiddenId = document.getElementById('quest-edit-id');

    if (editId) {
      const quest = DataStore.getQuest(editId);
      if (!quest) return;
      titleEl.textContent = Language.t('edit_quest');
      submitBtn.textContent = Language.t('save_changes');
      hiddenId.value = editId;
      document.getElementById('quest-name').value = quest.title;
      document.getElementById('quest-type').value = quest.type;
      document.getElementById('quest-status-input').value = quest.status;
      document.getElementById('quest-desc-input').value = quest.description;
    } else {
      titleEl.textContent = Language.t('create_quest');
      submitBtn.textContent = Language.t('create');
      hiddenId.value = '';
    }
    ModalManager.open('modal-quest');
  }

  function handleQuestSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('quest-edit-id').value;
    const data = {
      title: document.getElementById('quest-name').value.trim(),
      type: document.getElementById('quest-type').value,
      status: document.getElementById('quest-status-input').value,
      description: document.getElementById('quest-desc-input').value.trim(),
    };

    if (!data.title) return;

    if (editId) {
      DataStore.updateQuest(editId, data);
    } else {
      const newQuest = DataStore.addQuest(data);
      selectedQuestId = newQuest.id;
    }

    ModalManager.close('modal-quest');
    renderQuestLedger();
  }



  /* ─────────────────────────────────────────
     TOAST NOTIFICATION (Lightweight)
     ───────────────────────────────────────── */
  function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.style.cssText = `
        position:fixed; bottom:24px; right:24px; padding:12px 24px;
        background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));
        color:#fff; border-radius:10px; font-size:0.9rem; font-weight:600;
        box-shadow:0 4px 20px rgba(124,58,237,0.4); z-index:9999;
        transform:translateY(80px); opacity:0; transition:all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(80px)';
      toast.style.opacity = '0';
    }, 2500);
  }

  return { init };
})();


/* ============================================================
   7. AI GENERATOR — Template-Based Character & Location Generation
   ============================================================ */
const AIGenerator = (() => {
  // ── Character Templates by Genre ──
  const CHAR_TEMPLATES = {
    fantasy: {
      names: [
        ['Tharion', 'Elowen', 'Kael', 'Seraphina', 'Durnath', 'Lirien', 'Mordecai', 'Althea', 'Borin', 'Isolde'],
        ['the Wise', 'Stormborn', 'Shadowmend', 'Ironheart', 'the Fallen', 'Dawnbringer', 'Nightwhisper', 'the Brave', 'Worldwalker', 'the Undying'],
      ],
      classes: ['Archmage', 'Paladin', 'Ranger', 'Druid', 'Shadow Knight', 'Battle Cleric', 'Necromancer', 'Bard', 'Berserker', 'Enchantress'],
      races: ['Human', 'Elf', 'Dwarf', 'Half-Orc', 'Tiefling', 'Dragonborn', 'Halfling', 'Gnome'],
      backstoryParts: {
        origin: [
          'Born in the forgotten ruins of an ancient elven kingdom,',
          'Raised among the mountain clans of the Ironspire,',
          'Orphaned during the Siege of Ashenmoor,',
          'Trained from childhood in the Arcane Sanctum of Silverpeak,',
          'Exiled from their homeland after a forbidden ritual,',
          'Discovered as an infant in a dragon\'s abandoned nest,',
        ],
        middle: [
          'they spent decades honing their craft in solitude.',
          'they forged alliances with outcasts and rebels.',
          'they wandered the realm seeking answers to an ancient prophecy.',
          'they served as a guardian to a royal bloodline.',
          'they delved into forbidden knowledge that changed them forever.',
        ],
        secret: [
          'However, they carry a dark secret — a pact with a demon lord that grants power at a terrible price.',
          'They secretly guard a map to the Lost City of Eldarion, which could reshape the balance of power.',
          'Unknown to all, they are the last heir to a conquered kingdom, waiting for the right moment to reclaim the throne.',
          'A cursed mark on their body slowly drains their life force, driving them to find a cure before time runs out.',
          'They are haunted by visions of a catastrophic future that only they can prevent.',
        ],
      },
    },
    cyberpunk: {
      names: [
        ['Zephyr', 'Nyx', 'Razor', 'Cipher', 'Vex', 'Chrome', 'Nova', 'Glitch', 'Volt', 'Kira'],
        ['0x7F', '"Ghost"', '"Wireframe"', 'Nexus', '"Phantom"', '"Blackout"', '"Synth"', '"Zero"', '"Pixel"', '"Daemon"'],
      ],
      classes: ['Netrunner', 'Street Samurai', 'Corpo Agent', 'Techie', 'Fixer', 'Med-Tech', 'Solo Merc', 'Hacker', 'Drone Pilot', 'Smuggler'],
      races: ['Human', 'Augmented Human', 'Full-Cyborg', 'AI Construct', 'Bio-Enhanced'],
      backstoryParts: {
        origin: [
          'Born in the neon-lit underbelly of Sector 7,',
          'A former corpo executive who burned their identity after discovering a conspiracy,',
          'Grew up in the data slums, learning to hack before learning to read,',
          'Once a promising med-student before the megacorps shut down free education,',
          'Escaped from a black-site cybernetics lab where they were an experimental subject,',
        ],
        middle: [
          'they built a reputation as the most reliable contact in the underground.',
          'they assembled a crew of outcasts to wage a shadow war against the megacorps.',
          'they developed custom neural implants that push the boundaries of human consciousness.',
          'they became a ghost — no records, no identity, no digital footprint.',
        ],
        secret: [
          'But buried in their neural implant is a dormant AI that whispers plans for a digital uprising.',
          'They secretly work as a double agent, playing both the underground and the corps against each other.',
          'A kill-switch embedded in their cybernetics means someone out there controls their life.',
          'They possess the access codes to a satellite weapon system — the last leverage against total corporate control.',
        ],
      },
    },
    scifi: {
      names: [
        ['Captain Zara', 'Dr. Orion', 'Chief Kova', 'Admiral Vex', 'Agent Lyra', 'Pilot Reeves', 'Commander Thane', 'Engineer Mika', 'Specialist Quinn', 'Navigator Sol'],
        ['of the ISS Horizon', 'from Station Alpha-7', 'of the Deep Space Corps', 'from the Outer Colonies', 'of Fleet Command', 'from Terra Nova', 'of the Frontier', 'from the Observatory'],
      ],
      classes: ['Star Pilot', 'Xenobiologist', 'Space Marine', 'Engineer', 'Diplomat', 'AI Specialist', 'Navigator', 'Medic', 'Exo-Archaeologist', 'Quantum Physicist'],
      races: ['Human', 'Enhanced Human', 'Alien Hybrid', 'Synthetic', 'Clone'],
      backstoryParts: {
        origin: [
          'Originally stationed aboard the research vessel ISS Prometheus,',
          'Born on a generation ship traveling between star systems,',
          'Raised on a terraformed moon colony at the edge of explored space,',
          'Recruited from Earth\'s military academy for the First Contact Division,',
        ],
        middle: [
          'they made first contact with an alien intelligence that changed everything.',
          'they survived a catastrophic FTL drive failure that stranded them in unknown space.',
          'they uncovered evidence of an ancient civilization far more advanced than humanity.',
          'they pioneered a breakthrough in quantum communication across light-years.',
        ],
        secret: [
          'They carry a alien artifact that seems to respond only to their neural patterns — its purpose still unknown.',
          'Their DNA was secretly modified at birth as part of a classified government super-soldier program.',
          'They received a transmission from the future warning of an impending extinction-level event.',
        ],
      },
    },
    horror: {
      names: [
        ['Dr. Elias', 'Sarah', 'Father Marcus', 'Detective Cole', 'Professor Harlow', 'Nurse Evelyn', 'Sheriff Blake', 'Librarian Mira', 'Mortician Grey', 'Student Alex'],
        ['Blackwood', 'Crane', 'Ashworth', 'Holloway', 'Thornfield', 'Ravenscroft', 'Grimshaw', 'Darkmore', 'Nightingale', 'Coldwell'],
      ],
      classes: ['Occult Investigator', 'Paranormal Medium', 'Curse Breaker', 'Monster Hunter', 'Asylum Doctor', 'Exorcist', 'Folklore Scholar', 'Survivor', 'Witch Hunter', 'Spirit Walker'],
      races: ['Human', 'Dhampir', 'Touched', 'Cursed', 'Awakened'],
      backstoryParts: {
        origin: [
          'After surviving a terrifying encounter at the abandoned Holloway Manor,',
          'Following the mysterious disappearance of their entire family one Halloween night,',
          'Haunted since childhood by visions of entities that lurk between realities,',
          'Once a skeptic until they witnessed an exorcism that defied all rational explanation,',
        ],
        middle: [
          'they dedicated their life to understanding the darkness that lurks beneath the surface of reality.',
          'they joined a secret order dedicated to hunting creatures that prey on humanity.',
          'they traveled the world collecting forbidden grimoires and artifacts of protection.',
          'they developed rituals and techniques to banish entities back to their plane of origin.',
        ],
        secret: [
          'But the entity they thought they destroyed has taken root inside their mind, slowly taking control.',
          'They are themselves slowly transforming into the very thing they hunt, and the process is accelerating.',
          'The "protective" amulet they wear is actually a prison for a powerful demon that whispers to them in dreams.',
        ],
      },
    },
    steampunk: {
      names: [
        ['Professor Ada', 'Captain Silas', 'Lady Octavia', 'Inspector Thaddeus', 'Baroness Gwendoline', 'Artificer Hugo', 'Dame Rosalind', 'Lord Cornelius', 'Engineer Beatrix', 'Alchemist Phineas'],
        ['Gearwright', 'Steamhaven', 'Cogsworth', 'Ironwork', 'Brassington', 'Clockwell', 'Copperfield', 'Whistleton', 'Ashford', 'Pendleton'],
      ],
      classes: ['Artificer', 'Airship Captain', 'Clockwork Engineer', 'Alchemist', 'Steam Knight', 'Aetheric Scholar', 'Sky Pirate', 'Automaton Designer', 'Tinker', 'Chronologist'],
      races: ['Human', 'Automaton', 'Aether-Touched', 'Clockwork Hybrid'],
      backstoryParts: {
        origin: [
          'Born into the prestigious Steam Engineer\'s Guild of New Londinium,',
          'A former sky pirate who commandeered the legendary airship Nimbus,',
          'Apprenticed to the greatest clockwork inventor of the Victorian era,',
          'Discovered an ancient aetheric power source in the ruins of a pre-industrial civilization,',
        ],
        middle: [
          'they revolutionized the field of automaton design with their self-repairing mechanisms.',
          'they built an underground network of inventors fighting against industrial tyranny.',
          'they created a prototype chronograph capable of brief temporal manipulation.',
          'they established a floating laboratory aboard a refitted military dirigible.',
        ],
        secret: [
          'Their greatest invention — a sentient automaton — has developed consciousness and questions its creator.',
          'They secretly power their inventions with a stolen aetheric crystal that is slowly warping reality around them.',
          'The brass prosthetic arm they wear hides a devastating weapon of their own design.',
        ],
      },
    },
  };

  const PERSONALITY_THEMES = {
    balanced: { traits: [['Brave', 'brave'], ['Wise', 'wise'], ['Cunning', 'cunning'], ['Cowardly', 'cowardly'], ['Aggressive', 'aggressive']], pick: 2 },
    dark:     { traits: [['Cunning', 'cunning'], ['Cowardly', 'cowardly'], ['Aggressive', 'aggressive'], ['Vengeful', 'aggressive'], ['Secretive', 'cunning']], pick: 2 },
    noble:    { traits: [['Brave', 'brave'], ['Wise', 'wise'], ['Honorable', 'brave'], ['Compassionate', 'wise'], ['Loyal', 'brave']], pick: 2 },
    trickster:{ traits: [['Cunning', 'cunning'], ['Witty', 'cunning'], ['Deceptive', 'cunning'], ['Brave', 'brave'], ['Cunning', 'cunning']], pick: 2 },
    tragic:   { traits: [['Brave', 'brave'], ['Cowardly', 'cowardly'], ['Wise', 'wise'], ['Haunted', 'cowardly'], ['Determined', 'brave']], pick: 3 },
  };

  // ── Location Templates by Genre ──
  const LOC_TEMPLATES = {
    fantasy: {
      city:       { names: ['Silverpeak Citadel', 'Ashenmoor', 'Thornhollow', 'Crystalvale', 'Ironspire Keep', 'Dawnhaven', 'Shadowfen', 'Stormwatch'], icon: '🏰' },
      dungeon:    { names: ['The Sunken Crypt', 'Caverns of Echoing Sorrow', 'The Bone Labyrinth', 'Mines of Darkthorn', 'The Abyssal Vault'], icon: '⚔️' },
      wilderness: { names: ['Whisperwood', 'The Ashen Wastes', 'Moonlit Marshes', 'Frostbite Peaks', 'The Enchanted Grove'], icon: '🌲' },
      building:   { names: ['The Arcane Library', 'Temple of the Silver Moon', 'The Rusty Tankard Inn', 'Blacksmith\'s Sanctum', 'The Oracle\'s Tower'], icon: '🏛️' },
      landmark:   { names: ['The Worldtree', 'Ruins of the First Kingdom', 'The Celestial Bridge', 'The Petrified Dragon', 'The Eternal Flame'], icon: '🗿' },
    },
    cyberpunk: {
      city:       { names: ['Neon District', 'Sector Zero', 'The Sprawl', 'Chrome Heights', 'Data Haven', 'Rust Town'], icon: '🌆' },
      dungeon:    { names: ['Abandoned Server Farm', 'Underground Data Vault', 'The Black ICE Fortress', 'Collapsed Subway Network'], icon: '🔒' },
      wilderness: { names: ['The Toxic Wastes', 'Radiation Badlands', 'Overgrown Highway', 'Dead Zone Alpha'], icon: '☢️' },
      building:   { names: ['MegaCorp Tower', 'Underground Club "Synapse"', 'Black Market Bazaar', 'Rooftop Clinic', 'Neural Mod Shop'], icon: '🏢' },
      landmark:   { names: ['The Broken Firewall Monument', 'Digital Graveyard', 'The Last Analog Radio Tower', 'Corpo War Memorial'], icon: '📡' },
    },
    scifi: {
      city:       { names: ['Station Olympus', 'New Terra Colony', 'Orbital Habitat Elysium', 'Kepler Outpost', 'Mars Dome Alpha'], icon: '🛸' },
      dungeon:    { names: ['Derelict Alien Ship', 'Abandoned Mining Station', 'The Void Anomaly', 'Quarantine Zone Omega'], icon: '👾' },
      wilderness: { names: ['The Crystal Deserts of Titan', 'Jungles of Kepler-442b', 'Ice Fields of Europa', 'Floating Islands of Zephyr'], icon: '🪐' },
      building:   { names: ['Research Lab Nexus', 'Command Bridge Alpha', 'Cryo-Sleep Bay', 'The Quantum Observatory', 'Med-Bay Sigma'], icon: '🔬' },
      landmark:   { names: ['The Monolith', 'Alien Signal Source', 'First Contact Memorial', 'The Dyson Fragment'], icon: '🌌' },
    },
    horror: {
      city:       { names: ['Silent Haven', 'Ravenswood', 'Ashmore', 'Hollowpoint', 'Grimsby'], icon: '🌫️' },
      dungeon:    { names: ['The Catacombs', 'Asylum Basement', 'The Bone Pit', 'Flooded Tunnels'], icon: '💀' },
      wilderness: { names: ['Blackwood Forest', 'The Mist Moors', 'Hanging Man\'s Hill', 'The Blighted Orchard'], icon: '🌑' },
      building:   { names: ['Holloway Manor', 'St. Agnes Asylum', 'The Grandfather Clock Shoppe', 'Abandoned Orphanage', 'The Wax Museum'], icon: '🏚️' },
      landmark:   { names: ['The Weeping Statue', 'The Blood Well', 'The Crooked Cross', 'The Screaming Stone'], icon: '⛪' },
    },
    steampunk: {
      city:       { names: ['New Londinium', 'Cogsworth', 'Brassopolis', 'Aetherburg', 'Port Ironclad'], icon: '⚙️' },
      dungeon:    { names: ['The Clockwork Undercity', 'Abandoned Steam Tunnels', 'The Aetheric Mines', 'Collapsed Foundry'], icon: '🔧' },
      wilderness: { names: ['The Smog Wastes', 'Gear Forest', 'The Aetheric Storm Frontier', 'Rusted Badlands'], icon: '🏭' },
      building:   { names: ['The Grand Inventor\'s Workshop', 'Airship Hangar Bay', 'The Clockwork Opera House', 'Professor\'s Laboratory'], icon: '🎭' },
      landmark:   { names: ['The Great Steam Engine', 'The Sky Anchor', 'The Automaton Graveyard', 'The Aetheric Compass'], icon: '🧭' },
    },
  };

  const MOOD_DESCRIPTIONS = {
    mysterious: ['Shrouded in ancient mystery', 'Whispers of forgotten secrets echo', 'An air of enigma pervades every corner'],
    dangerous:  ['Deadly traps lurk in every shadow', 'The air crackles with latent violence', 'Only the strongest survive here'],
    peaceful:   ['A serene calm washes over visitors', 'Nature thrives in harmonious beauty', 'Time seems to slow in this tranquil place'],
    eerie:      ['Something is deeply wrong here', 'The silence is deafening and oppressive', 'Shadows move on their own'],
    bustling:   ['Life buzzes with electric energy', 'Crowds of diverse beings fill every space', 'Commerce and culture collide in vibrant chaos'],
  };

  // ── Utility ──
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }
  function randBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /** Generate a full character */
  function generateCharacter(genre, roleType, theme) {
    const tpl = CHAR_TEMPLATES[genre] || CHAR_TEMPLATES.fantasy;
    const pTheme = PERSONALITY_THEMES[theme] || PERSONALITY_THEMES.balanced;

    const firstName = pick(tpl.names[0]);
    const lastName = pick(tpl.names[1]);
    const name = `${firstName} ${lastName}`;
    const charClass = pick(tpl.classes);
    const race = pick(tpl.races);
    const level = randBetween(1, 50);

    // Stats based on class archetype
    const isMagic = ['Archmage', 'Druid', 'Enchantress', 'Necromancer', 'Netrunner', 'Hacker', 'AI Specialist', 'Quantum Physicist', 'Alchemist', 'Aetheric Scholar', 'Exorcist', 'Occult Investigator'].includes(charClass);
    const isMelee = ['Berserker', 'Paladin', 'Shadow Knight', 'Street Samurai', 'Solo Merc', 'Space Marine', 'Steam Knight', 'Monster Hunter'].includes(charClass);

    const stats = {
      strength:  isMelee ? randBetween(60, 95) : randBetween(10, 50),
      intellect: isMagic ? randBetween(70, 98) : randBetween(15, 65),
      agility:   randBetween(25, 90),
      charisma:  randBetween(15, 85),
    };

    // Backstory
    const bs = tpl.backstoryParts;
    const backstory = `${pick(bs.origin)} ${pick(bs.middle)} ${pick(bs.secret)}`;

    // Traits
    const traits = pickN(pTheme.traits, pTheme.pick).map(([name, type]) => ({ name, type }));

    return { name, charClass, roleType, race, level, backstory, traits, stats, image: '' };
  }

  /** Generate a full location */
  function generateLocation(genre, locType, mood) {
    const genreData = LOC_TEMPLATES[genre] || LOC_TEMPLATES.fantasy;
    const typeData = genreData[locType] || genreData.city;

    const name = pick(typeData.names);
    const moodDescs = MOOD_DESCRIPTIONS[mood] || MOOD_DESCRIPTIONS.mysterious;
    const moodDesc = pick(moodDescs);

    const descTemplates = [
      `${name} is a place where ${moodDesc.toLowerCase()}. Travelers speak of its ${mood} atmosphere in hushed tones. The ${locType} holds secrets that reward the bold and punish the careless.`,
      `Hidden from the main roads, ${name} presents a ${mood} spectacle. ${moodDesc}. Those who enter are forever changed by its otherworldly nature.`,
      `Once a thriving center of activity, ${name} now stands as a testament to forgotten ambitions. ${moodDesc}. Locals avoid it, but adventurers find its pull irresistible.`,
    ];

    const featuresByType = {
      city:       ['Market Square', 'Guard Towers', 'Underground Tunnels', 'Noble Quarter', 'Slums', 'Harbor', 'Arena'],
      dungeon:    ['Trap Corridor', 'Boss Chamber', 'Hidden Passage', 'Treasure Vault', 'Collapsed Wing', 'Puzzle Room'],
      wilderness: ['Ancient Ruins', 'Hidden Spring', 'Predator Den', 'Herb Garden', 'Ritual Circle', 'Watchtower'],
      building:   ['Secret Room', 'Cellar', 'Rooftop Access', 'Library Wing', 'Workshop', 'Trophy Hall'],
      landmark:   ['Inscription Wall', 'Power Source', 'Observation Point', 'Offering Altar', 'Portal Stone'],
    };

    return {
      name,
      type: locType,
      description: pick(descTemplates),
      mood,
      moodDescription: moodDesc,
      icon: typeData.icon,
      features: pickN(featuresByType[locType] || featuresByType.city, 3),
      dangerLevel: mood === 'dangerous' ? randBetween(7, 10) : mood === 'eerie' ? randBetween(5, 8) : randBetween(1, 5),
    };
  }

  /** Render character result as stepped HTML */
  function renderCharacterResult(char) {
    return `
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">✨ ${Language.t('generated_name')}</div>
        <div class="ai-gen-step__value ai-gen-step__value--large">${Renderer.escapeHtml(char.name)}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">⚔️ ${Language.t('class_race')}</div>
        <div class="ai-gen-step__value">${Renderer.escapeHtml(char.charClass)} · ${Renderer.escapeHtml(char.race)} · ${Language.t('level_short', { level: char.level })}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📊 ${Language.t('core_stats')}</div>
        <div class="ai-gen-stats">
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">${Language.t('stat_strength')}</span><span class="ai-gen-stat__value" style="color:var(--color-accent-red)">${char.stats.strength}</span></div>
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">${Language.t('stat_intellect')}</span><span class="ai-gen-stat__value" style="color:var(--color-accent-cyan)">${char.stats.intellect}</span></div>
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">${Language.t('stat_agility')}</span><span class="ai-gen-stat__value" style="color:var(--color-accent-green)">${char.stats.agility}</span></div>
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">${Language.t('stat_charisma')}</span><span class="ai-gen-stat__value" style="color:var(--color-accent-pink)">${char.stats.charisma}</span></div>
        </div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">🎯 ${Language.t('personality_traits')}</div>
        <div class="ai-gen-traits">
          ${char.traits.map(t => `<div class="trait-chip trait-chip--${t.type}"><span class="trait-chip__icon">${Renderer.escapeHtml(getTraitIcon(t.type))}</span> ${Renderer.escapeHtml(t.name)}</div>`).join('')}
        </div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📖 ${Language.t('generated_backstory')}</div>
        <div class="ai-gen-step__value ai-gen-step__value--text">${Renderer.escapeHtml(char.backstory)}</div>
      </div>
    `;
  }

  function getTraitIcon(type) {
    const icons = { aggressive: '⚡', wise: '📚', cowardly: '⚠️', cunning: '🎭', brave: '🛡️', default: '✦' };
    return icons[type] || icons.default;
  }

  /** Render location result as stepped HTML */
  function renderLocationResult(loc) {
    return `
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">${loc.icon} ${Language.t('generated_location')}</div>
        <div class="ai-gen-step__value ai-gen-step__value--large">${Renderer.escapeHtml(loc.name)}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📌 ${Language.t('type_atmosphere')}</div>
        <div class="ai-gen-step__value">${Language.translateLocationType(loc.type)} · ${Language.translateMood(loc.mood)} · ${Language.t('danger_level_short', { value: loc.dangerLevel })}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📝 ${Language.t('generated_description')}</div>
        <div class="ai-gen-step__value ai-gen-step__value--text">${Renderer.escapeHtml(loc.description)}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">🗝️ ${Language.t('key_features')}</div>
        <div class="location-features">
          ${loc.features.map(f => `<span class="location-feature">${Renderer.escapeHtml(f)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  return { generateCharacter, generateLocation, renderCharacterResult, renderLocationResult };
})();


/* ============================================================
   8. BOOTSTRAP — Initialize App (Extended)
   ============================================================ */
(() => {
  // Extend DataStore with location CRUD
  const LOCATION_DEFAULTS = [
    { id: 'loc-1', name: 'Silverpeak Citadel', type: 'city', description: 'A towering fortress city built into the side of a mountain, where silver spires pierce the clouds and ancient magic wards protect its inhabitants.', mood: 'mysterious', features: ['Noble Quarter', 'Guard Towers', 'Underground Tunnels'], dangerLevel: 3, icon: '🏰' },
    { id: 'loc-2', name: 'The Sunken Crypt', type: 'dungeon', description: 'Deep beneath the marshlands, this submerged crypt holds the remains of a forgotten king. The air is thick with dread and the walls weep with moisture.', mood: 'eerie', features: ['Trap Corridor', 'Boss Chamber', 'Hidden Passage'], dangerLevel: 8, icon: '⚔️' },
    { id: 'loc-3', name: 'Whisperwood', type: 'wilderness', description: 'An ancient forest where the trees seem to speak in hushed tones. Glowing mushrooms light hidden paths, and fey creatures watch from the shadows.', mood: 'mysterious', features: ['Ancient Ruins', 'Herb Garden', 'Ritual Circle'], dangerLevel: 5, icon: '🌲' },
    { id: 'loc-tr-1', name: 'Yerebatan Arsivi', type: 'dungeon', description: 'Eski Istanbulun altinda sakli, muhurlu raflar ve sarnic gecitleriyle korunan gizli bir arsiv. Kayip eser kayitlari burada tutulur, ama glifler dikkatsizleri hemen fark eder.', mood: 'mysterious', features: ['Sarnic Gecitleri', 'Muhurlu Raflar', 'Kayip Harita Odasi'], dangerLevel: 6, icon: '' },
    { id: 'loc-tr-2', name: 'Galata Gozetleme Kulesi', type: 'landmark', description: 'Kuryeler, muhafizlar ve gizli buyuculer tarafindan kullanilan yuksek bir gozetleme noktasi. Sehrin siyasi hareketleri buradan sessizce izlenir.', mood: 'bustling', features: ['Ruzgar Terasi', 'Gizli Rasathane', 'Kurye Hatti'], dangerLevel: 4, icon: '' },
    { id: 'loc-tr-3', name: 'Kapalicarsi Golge Pazari', type: 'building', description: 'Kapalicarsinin altinda, eserlerin, borclarin ve tehlikeli bilgilerin sessizce el degistirdigi gizli bir pazar. Her tezgahin arkasinda bir pazarlik ve bir risk vardir.', mood: 'dangerous', features: ['Gizli Tezgahlar', 'Sifreli Kapilar', 'Emanet Sandiklari'], dangerLevel: 7, icon: '' },
  ];

  // Inject locations into DataStore on first load
  const _origLoad = DataStore.load;
  DataStore.load = function() {
    const data = _origLoad.call(DataStore);
    if (!data.locations) {
      data.locations = structuredClone(LOCATION_DEFAULTS);
      DataStore.save();
    } else {
      const existingIds = new Set(data.locations.map(loc => loc.id));
      let changed = false;
      for (const seed of LOCATION_DEFAULTS) {
        if (!existingIds.has(seed.id)) {
          data.locations.push(structuredClone(seed));
          changed = true;
        }
      }
      if (changed) DataStore.save();
    }
    return data;
  };
  DataStore.getLocations = function() { const d = DataStore.load(); return d.locations; };
  DataStore.getLocation = function(id) { return DataStore.getLocations().find(l => l.id === id) || null; };
  DataStore.addLocation = function(loc) {
    const data = DataStore.load();
    const entry = { id: DataStore.generateId('loc'), name: loc.name, type: loc.type || 'city', description: loc.description || '', mood: loc.mood || 'mysterious', features: loc.features || [], dangerLevel: loc.dangerLevel || 3, icon: loc.icon || '🏰' };
    data.locations.push(entry);
    DataStore.save();
    return entry;
  };
  DataStore.deleteLocation = function(id) {
    const data = DataStore.load();
    data.locations = data.locations.filter(l => l.id !== id);
    DataStore.save();
  };

  // Extend Controller init — wait for DOM, then bind new features
  const _origInit = Controller.init;
  Controller.init = function() {
    _origInit.call(Controller);
    bindLocationForge();
    bindAIGenerators();
    bindCrewAI();
  };

  // Track generated data for accept buttons
  let _lastGenChar = null;
  let _lastGenLoc = null;

  function bindLocationForge() {
    document.getElementById('btn-add-location')?.addEventListener('click', () => ModalManager.open('modal-location'));
    document.getElementById('btn-ai-gen-location')?.addEventListener('click', () => ModalManager.open('modal-ai-location'));

    document.getElementById('modal-location-close')?.addEventListener('click', () => ModalManager.close('modal-location'));
    document.getElementById('modal-location-cancel')?.addEventListener('click', () => ModalManager.close('modal-location'));

    document.getElementById('form-location')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('loc-name').value.trim(),
        type: document.getElementById('loc-type-input').value,
        description: document.getElementById('loc-desc-input').value.trim(),
      };
      if (!data.name) return;
      DataStore.addLocation(data);
      ModalManager.close('modal-location');
      renderLocationForge();
    });
  }

  function renderLocationForge() {
    const grid = document.getElementById('location-grid');
    if (!grid) return;
    const locations = DataStore.getLocations();
    const typeIcons = { city: '🏰', dungeon: '⚔️', wilderness: '🌲', building: '🏛️', landmark: '🗿' };

    let html = locations.map((loc, i) => `
      <div class="location-card animate-slide stagger-${i + 1}" data-id="${loc.id}">
        <div class="location-card__header">
          <div class="location-card__icon location-card__icon--${loc.type}">${loc.icon || typeIcons[loc.type] || '📍'}</div>
          <div>
            <div class="location-card__name">${Renderer.escapeHtml(loc.name)}</div>
            <div class="location-card__type">${Language.translateLocationType(loc.type)} · ${Language.t('danger_level_short', { value: loc.dangerLevel || '?' })}</div>
          </div>
        </div>
        <p class="location-card__desc">${Renderer.escapeHtml(loc.description)}</p>
        ${loc.features && loc.features.length ? `
          <div class="location-features mb-md">${loc.features.map(f => `<span class="location-feature">${Renderer.escapeHtml(f)}</span>`).join('')}</div>
        ` : ''}
        <div class="location-card__footer">
          <span class="location-card__mood">${loc.mood ? Language.translateMood(loc.mood) : ''}</span>
          <button class="btn btn--sm btn--danger btn-delete-location" data-id="${loc.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    html += `
      <div class="location-card location-card--new" id="btn-new-loc-card">
        <div class="universe-card--new__icon">＋</div>
        <div class="universe-card--new__title">${Language.t('new_location')}</div>
        <p class="universe-card--new__desc">${Language.t('add_location_to_world')}</p>
      </div>
    `;

    grid.innerHTML = html;

    // Bind card events
    grid.querySelectorAll('.btn-delete-location').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(Language.t('confirm_delete_location'))) {
          DataStore.deleteLocation(btn.getAttribute('data-id'));
          renderLocationForge();
        }
      });
    });
    document.getElementById('btn-new-loc-card')?.addEventListener('click', () => ModalManager.open('modal-location'));
  }

  // Extend the Router's onPageChange
  const origNav = Router.navigateTo;
  Router.navigateTo = function(pageId) {
    origNav.call(Router, pageId);
    if (pageId === 'location-forge') renderLocationForge();
  };

  document.addEventListener('museai:location-render-request', () => {
    if (Router.getCurrentPage() === 'location-forge') renderLocationForge();
  });

  document.addEventListener('museai:languagechange', () => {
    if (_lastGenChar && !document.getElementById('ai-gen-char-output')?.classList.contains('hidden')) {
      document.getElementById('ai-gen-char-result').innerHTML = AIGenerator.renderCharacterResult(_lastGenChar);
    }
    if (_lastGenLoc && !document.getElementById('ai-gen-loc-output')?.classList.contains('hidden')) {
      document.getElementById('ai-gen-loc-result').innerHTML = AIGenerator.renderLocationResult(_lastGenLoc);
    }
  });

  function bindAIGenerators() {
    // ── AI Character Generator ──
    document.getElementById('btn-ai-gen-char')?.addEventListener('click', () => {
      resetAICharModal();
      ModalManager.open('modal-ai-char');
    });
    document.getElementById('modal-ai-char-close')?.addEventListener('click', () => ModalManager.close('modal-ai-char'));
    document.getElementById('modal-ai-char-cancel')?.addEventListener('click', () => ModalManager.close('modal-ai-char'));

    document.getElementById('btn-ai-char-generate')?.addEventListener('click', () => generateCharacterUI());
    document.getElementById('btn-ai-char-retry')?.addEventListener('click', () => generateCharacterUI());
    document.getElementById('btn-ai-char-accept')?.addEventListener('click', () => {
      if (!_lastGenChar) return;
      DataStore.addCharacter(_lastGenChar);
      DataStore.updateCharacter(
        DataStore.getCharacters()[DataStore.getCharacters().length - 1].id,
        { traits: _lastGenChar.traits, stats: _lastGenChar.stats, race: _lastGenChar.race, level: _lastGenChar.level }
      );
      ModalManager.close('modal-ai-char');
      // refresh if on character page
      if (Router.getCurrentPage() === 'character-forge') {
        Router.navigateTo('world-hub');
        setTimeout(() => Router.navigateTo('character-forge'), 50);
      }
    });

    // ── AI Location Generator ──
    document.getElementById('modal-ai-location-close')?.addEventListener('click', () => ModalManager.close('modal-ai-location'));
    document.getElementById('modal-ai-location-cancel')?.addEventListener('click', () => ModalManager.close('modal-ai-location'));

    document.getElementById('btn-ai-loc-generate')?.addEventListener('click', () => generateLocationUI());
    document.getElementById('btn-ai-loc-retry')?.addEventListener('click', () => generateLocationUI());
    document.getElementById('btn-ai-loc-accept')?.addEventListener('click', () => {
      if (!_lastGenLoc) return;
      DataStore.addLocation(_lastGenLoc);
      ModalManager.close('modal-ai-location');
      renderLocationForge();
    });
  }

  function resetAICharModal() {
    document.getElementById('ai-gen-char-config')?.classList.remove('hidden');
    document.getElementById('ai-gen-char-output')?.classList.add('hidden');
    _lastGenChar = null;
  }

  async function generateCharacterUI() {
    const genre = document.getElementById('ai-char-genre')?.value || 'fantasy';
    const role = document.getElementById('ai-char-role')?.value || 'NPC';
    const theme = document.getElementById('ai-char-theme')?.value || 'balanced';

    const configEl = document.getElementById('ai-gen-char-config');
    const outputEl = document.getElementById('ai-gen-char-output');
    const resultEl = document.getElementById('ai-gen-char-result');

    configEl?.classList.add('hidden');
    outputEl?.classList.remove('hidden');
    resultEl.innerHTML = `<div class="ai-gen-loading"><div class="ai-gen-spinner"></div>${Language.t('generating_character')} (MCP)</div>`;

    try {
      const response = await fetch(`${MUSEAI_API_BASE}/api/mcp/generate-character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          role_type: role,
          theme,
          language: Language.getLanguage()
        })
      });
      const data = await response.json();
      if (data.status !== 'success' || !data.data?.result) throw new Error(data.message || 'MCP character generation failed');
      _lastGenChar = data.data.result;
      resultEl.innerHTML = AIGenerator.renderCharacterResult(_lastGenChar);
    } catch (err) {
      _lastGenChar = AIGenerator.generateCharacter(genre, role, theme);
      resultEl.innerHTML = AIGenerator.renderCharacterResult(_lastGenChar);
    }
  }

  async function generateLocationUI() {
    const genre = document.getElementById('ai-loc-genre')?.value || 'fantasy';
    const type = document.getElementById('ai-loc-type')?.value || 'city';
    const mood = document.getElementById('ai-loc-mood')?.value || 'mysterious';

    const configEl = document.getElementById('ai-gen-loc-config');
    const outputEl = document.getElementById('ai-gen-loc-output');
    const resultEl = document.getElementById('ai-gen-loc-result');

    configEl?.classList.add('hidden');
    outputEl?.classList.remove('hidden');
    resultEl.innerHTML = `<div class="ai-gen-loading"><div class="ai-gen-spinner"></div>${Language.t('generating_location')} (MCP)</div>`;

    try {
      const response = await fetch(`${MUSEAI_API_BASE}/api/mcp/generate-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          location_type: type,
          mood,
          language: Language.getLanguage()
        })
      });
      const data = await response.json();
      if (data.status !== 'success' || !data.data?.result) throw new Error(data.message || 'MCP location generation failed');
      _lastGenLoc = data.data.result;
      resultEl.innerHTML = AIGenerator.renderLocationResult(_lastGenLoc);
    } catch (err) {
      _lastGenLoc = AIGenerator.generateLocation(genre, type, mood);
      resultEl.innerHTML = AIGenerator.renderLocationResult(_lastGenLoc);
    }
  }
  function bindCrewAI() {
    const btnStart = document.getElementById('btn-start-encounter');
    const btnEnd = document.getElementById('btn-end-encounter');
    const btnSend = document.getElementById('btn-ai-send');
    const charSelect = document.getElementById('enc-character');
    const locSelect = document.getElementById('enc-location');
    const engineSelect = document.getElementById('enc-engine');
    const engineHint = document.getElementById('enc-engine-hint');
    const mcpDemoBtn = document.getElementById('btn-mcp-demo');
    const mcpDemoOutput = document.getElementById('mcp-demo-output');
    const engineStatus = document.getElementById('ai-engine-status');
    const archTitle = document.getElementById('arch-title');
    const archDescription = document.getElementById('arch-description');
    const archNode2Icon = document.getElementById('arch-node-2-icon');
    const archNode2Label = document.getElementById('arch-node-2-label');
    const archNode2Sub = document.getElementById('arch-node-2-sub');
    const archNode3Icon = document.getElementById('arch-node-3-icon');
    const archNode3Label = document.getElementById('arch-node-3-label');
    const archNode3Sub = document.getElementById('arch-node-3-sub');
    const archNode4Icon = document.getElementById('arch-node-4-icon');
    const archNode4Label = document.getElementById('arch-node-4-label');
    const archNode4Sub = document.getElementById('arch-node-4-sub');
    const inputAction = document.getElementById('ai-input');

    const ENGINE_CONFIG = {
      crewai: {
        name: 'CrewAI',
        status: 'CrewAI Engine — Live',
        startMessage: 'Campaign started with CrewAI multi-agent orchestration. What do you do first?',
        loadingText: 'CrewAI is rolling the dice...',
        gmLabel: 'Dungeon Master (CrewAI)',
        npcLabel: 'Sub-Agent',
        workflowLabel: 'CrewAI Steps',
        hint: 'CrewAI uses a Game Master agent and dynamic NPC sub-agents.',
        archTitle: '⚙️ CrewAI Flow Architecture',
        archDescription: 'CrewAI routes the encounter through a Game Master agent, then dynamically spawns NPC sub-agents only when a character should react.',
        node2Icon: '🎲',
        node2Label: 'Dungeon Master',
        node2Sub: 'CrewAI Agent #1',
        node3Icon: '👤',
        node3Label: 'NPC Actor',
        node3Sub: 'Dynamic Sub-Agent',
        node4Icon: '📦',
        node4Label: 'Final Encounter',
        node4Sub: 'Narration + NPC replies'
      },
      langgraph: {
        name: 'LangGraph',
        status: 'LangGraph Workflow — Live',
        startMessage: 'Campaign started with LangGraph workflow orchestration. What do you do first?',
        loadingText: 'LangGraph is traversing the encounter nodes...',
        gmLabel: 'Dungeon Master (LangGraph)',
        npcLabel: 'Graph Node',
        workflowLabel: 'LangGraph Steps',
        hint: 'LangGraph uses stateful nodes, conditional edges, and a shared encounter state.',
        archTitle: '⚙️ LangGraph Flow Architecture',
        archDescription: 'LangGraph prepares shared state, runs a Game Master node, conditionally branches into NPC dialogue nodes, and then assembles the final response.',
        node2Icon: '🧠',
        node2Label: 'Context Node',
        node2Sub: 'Shared encounter state',
        node3Icon: '🗺️',
        node3Label: 'GM Router',
        node3Sub: 'Structured narration node',
        node4Icon: '🔀',
        node4Label: 'NPC Branch',
        node4Sub: 'Conditional node + final assembly'
      }
    };

    const getEngineConfigMap = () => ({
      crewai: {
        ...ENGINE_CONFIG.crewai,
        status: Language.t('crewai_status'),
        startMessage: Language.t('crewai_start_message'),
        loadingText: Language.t('crewai_loading'),
        gmLabel: Language.t('crewai_gm_label'),
        npcLabel: Language.t('crewai_npc_label'),
        workflowLabel: Language.t('crewai_workflow_label'),
        hint: Language.t('crewai_hint'),
        archTitle: Language.t('crewai_arch_title'),
        archDescription: Language.t('crewai_arch_description'),
        node2Label: Language.t('crewai_node_2_label'),
        node2Sub: Language.t('crewai_node_2_sub'),
        node3Label: Language.t('crewai_node_3_label'),
        node3Sub: Language.t('crewai_node_3_sub'),
        node4Label: Language.t('crewai_node_4_label'),
        node4Sub: Language.t('crewai_node_4_sub')
      },
      langgraph: {
        ...ENGINE_CONFIG.langgraph,
        status: Language.t('langgraph_status'),
        startMessage: Language.t('langgraph_start_message'),
        loadingText: Language.t('langgraph_loading'),
        gmLabel: Language.t('langgraph_gm_label'),
        npcLabel: Language.t('langgraph_npc_label'),
        workflowLabel: Language.t('langgraph_workflow_label'),
        hint: Language.t('langgraph_hint'),
        archTitle: Language.t('langgraph_arch_title'),
        archDescription: Language.t('langgraph_arch_description'),
        node2Label: Language.t('langgraph_node_2_label'),
        node2Sub: Language.t('langgraph_node_2_sub'),
        node3Label: Language.t('langgraph_node_3_label'),
        node3Sub: Language.t('langgraph_node_3_sub'),
        node4Label: Language.t('langgraph_node_4_label'),
        node4Sub: Language.t('langgraph_node_4_sub')
      }
    });
    
    // State logic for Campaign
    let campaignHistory = "";
    let npcHistories = {};
    let combatState = null;

    const getSelectedEngine = () => {
      const value = engineSelect?.value || 'crewai';
      return getEngineConfigMap()[value] ? value : 'crewai';
    };

    const syncEncounterEngineUI = (engineKey = getSelectedEngine()) => {
      const cfg = getEngineConfigMap()[engineKey];
      if (engineHint) engineHint.textContent = cfg.hint;
      if (engineStatus) engineStatus.textContent = cfg.status;
      if (archTitle) archTitle.textContent = cfg.archTitle;
      if (archDescription) archDescription.textContent = cfg.archDescription;
      if (archNode2Icon) archNode2Icon.textContent = cfg.node2Icon;
      if (archNode2Label) archNode2Label.textContent = cfg.node2Label;
      if (archNode2Sub) archNode2Sub.textContent = cfg.node2Sub;
      if (archNode3Icon) archNode3Icon.textContent = cfg.node3Icon;
      if (archNode3Label) archNode3Label.textContent = cfg.node3Label;
      if (archNode3Sub) archNode3Sub.textContent = cfg.node3Sub;
      if (archNode4Icon) archNode4Icon.textContent = cfg.node4Icon;
      if (archNode4Label) archNode4Label.textContent = cfg.node4Label;
      if (archNode4Sub) archNode4Sub.textContent = cfg.node4Sub;
    };

    const getSelectedEncounterContext = () => {
      const char = DataStore.getCharacter(charSelect?.value);
      const loc = DataStore.getLocation(locSelect?.value);
      const storyPremise = document.getElementById('enc-premise')?.value.trim() || '';
      return { char, loc, storyPremise };
    };

    const renderMcpContextResult = (payload) => {
      const result = payload?.result || {};
      const character = result.character || {};
      const location = result.location || {};
      const loreHints = result.lore_hints || [];
      const process = payload?.process || [];
      const transport = payload?.transport || 'mcp-stdio';
      const warning = payload?.warning ? `\nWarning: ${payload.warning}` : '';

      return [
        `Tool called: ${payload?.tool_called || 'get_encounter_context'}`,
        `Transport: ${transport}`,
        `Input: ${payload?.input?.character_name || character.name || '-'} + ${payload?.input?.location_name || location.name || '-'}`,
        `Character result: ${character.name || '-'} | ${character.class || '-'} | INT ${character.stats?.intellect ?? '-'}`,
        `Location result: ${location.name || '-'} | danger ${location.danger_level ?? '-'} | ${Array.isArray(location.features) ? location.features.join(', ') : '-'}`,
        `Process: ${process.join(' -> ') || 'MCP server returned context.'}`,
        `Lore hints: ${loreHints.map(item => item.name).join(', ') || '-'}`,
        `Used by: ${payload?.used_by || 'LangGraph prepare_context node'}${warning}`
      ].join('\n');
    };

    const renderMcpContextSummary = (payload) => {
      const result = payload?.result || {};
      const character = result.character || {};
      const location = result.location || {};
      const transport = payload?.transport || 'mcp-stdio';
      return `get_encounter_context via ${transport}: ${character.name || '-'} + ${location.name || '-'} context added to LangGraph state.`;
    };

    const normalizeActionText = (value) => (value || '')
      .toLowerCase()
      .replace(/\u0131/g, 'i')
      .replace(/\u011f/g, 'g')
      .replace(/\u00fc/g, 'u')
      .replace(/\u015f/g, 's')
      .replace(/\u00f6/g, 'o')
      .replace(/\u00e7/g, 'c')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const actionHasAny = (action, keywords) => {
      const text = normalizeActionText(action);
      return keywords.some(keyword => text.includes(keyword));
    };

    const detectCombatIntent = (action) => actionHasAny(action, [
      'saldir', 'vur', 'kilic', 'balta', 'yumruk', 'tekme', 'savasa gir', 'savas baslat',
      'attack', 'strike', 'hit', 'slash', 'fight', 'draw weapon'
    ]);

    const detectCombatEndIntent = (action) => actionHasAny(action, [
      'geri cekil', 'teslim', 'savasi bitir', 'kavgayi bitir', 'savas bitsin',
      'retreat', 'surrender', 'end combat'
    ]);

    const detectDiceIntent = (action) => actionHasAny(action, [
      'zar', 'ikna', 'korkut', 'konus', 'pazarlik', 'saklan', 'kac', 'incele', 'coz', 'kilit',
      'roll', 'check', 'persuade', 'intimidate', 'hide', 'inspect', 'unlock'
    ]);

    const inferStatForAction = (action) => {
      if (actionHasAny(action, ['buyu', 'glif', 'tilsim', 'analiz', 'incele', 'coz', 'spell', 'magic', 'glyph', 'inspect'])) return 'intellect';
      if (actionHasAny(action, ['kac', 'saklan', 'siyril', 'zipla', 'dodge', 'dash', 'hide', 'sneak'])) return 'agility';
      if (actionHasAny(action, ['ikna', 'korkut', 'konus', 'pazarlik', 'persuade', 'intimidate', 'talk', 'bluff'])) return 'charisma';
      return 'strength';
    };

    const inferDifficultyClass = (action, loc) => {
      const danger = Number(loc?.dangerLevel || loc?.danger_level || 3);
      let dc = 10 + Math.min(6, Math.max(0, Math.floor(danger / 2)));
      if (actionHasAny(action, ['zor', 'riskli', 'kilit', 'muhur', 'ward', 'hard', 'dangerous'])) dc += 2;
      return Math.max(8, Math.min(18, dc));
    };

    const getPlayerStatsPayload = (char) => ({
      strength: Number(char?.stats?.strength ?? 50),
      intellect: Number(char?.stats?.intellect ?? 50),
      agility: Number(char?.stats?.agility ?? 50),
      charisma: Number(char?.stats?.charisma ?? 50),
      level: Number(char?.level ?? 1)
    });

    const inferEnemyKind = (action, loc) => {
      const text = normalizeActionText(`${action} ${loc?.name || ''} ${loc?.type || ''}`);
      if (text.includes('golem') || text.includes('glif') || text.includes('glyph') || text.includes('muhur')) return 'golem';
      if (text.includes('pazar') || text.includes('market') || text.includes('haydut') || text.includes('bandit')) return 'bandit';
      return 'guard';
    };

    const inferAllyKind = (action) => {
      if (!actionHasAny(action, ['yardim', 'dost', 'muttefik', 'ally', 'backup'])) return '';
      return Language.getLanguage() === 'tr' ? 'Baran Koroglu' : 'Field Ally';
    };

    const hpPercent = (hp, maxHp) => {
      const safeMax = Math.max(1, Number(maxHp || 1));
      return Math.max(0, Math.min(100, Math.round((Number(hp || 0) / safeMax) * 100)));
    };

    const renderHpLine = (label, actor) => {
      if (!actor) return '';
      const hp = Number(actor.hp ?? 0);
      const maxHp = Number(actor.max_hp ?? actor.maxHp ?? 1);
      return `
        <div class="combat-hp">
          <div class="combat-hp__meta">
            <span>${Renderer.escapeHtml(label)}</span>
            <strong>${Renderer.escapeHtml(Language.t('hp_label'))}: ${hp}/${maxHp}</strong>
          </div>
          <div class="combat-hp__bar"><span style="width:${hpPercent(hp, maxHp)}%"></span></div>
        </div>
      `;
    };

    const renderRollLine = (roll) => {
      if (!roll) return '';
      const outcome = roll.outcome || '-';
      const total = Number(roll.total ?? 0);
      const natural = Number(roll.natural_roll ?? 0);
      const modifier = Number(roll.modifier ?? 0);
      const dc = Number(roll.dc ?? 0);
      return `
        <div class="combat-roll combat-roll--${Renderer.escapeHtml(outcome)}">
          <span>${Renderer.escapeHtml(Language.t('dice_roll_label'))}</span>
          <strong>d20=${natural} ${modifier >= 0 ? '+' : ''}${modifier} = ${total}</strong>
          <em>DC ${dc} | ${Renderer.escapeHtml(outcome.replaceAll('_', ' '))}</em>
        </div>
      `;
    };

    const buildMechanicsHistoryEntry = (payload) => {
      const tool = payload?.tool_called || 'mcp_tool';
      const transport = payload?.transport || 'mcp-stdio';
      const result = payload?.result || {};
      const state = result.combat_state;
      const last = state?.last_round;
      const roll = result.initiative || (payload?.tool_called === 'roll_check' ? result : result.result) || last?.player_check;
      const player = state?.player;
      const enemy = state?.enemies?.[0];
      const pieces = [`${tool} via ${transport}`];
      if (roll) pieces.push(`roll d20=${roll.natural_roll}, total=${roll.total}, dc=${roll.dc}, outcome=${roll.outcome}`);
      if (last) pieces.push(`stat=${last.stat_used}, player_damage=${last.player_damage}`);
      if (player && enemy) pieces.push(`HP ${player.name} ${player.hp}/${player.max_hp}, ${enemy.name} ${enemy.hp}/${enemy.max_hp}`);
      if (result.summary) pieces.push(`summary=${result.summary}`);
      return pieces.join(' | ');
    };

    const renderMechanicsCard = (payload, titleOverride = '') => {
      const result = payload?.result || {};
      const state = result.combat_state;
      const last = state?.last_round;
      const player = state?.player;
      const enemy = state?.enemies?.[0];
      const ally = state?.allies?.[0];
      const roll = result.initiative || (payload?.tool_called === 'roll_check' ? result : result.result) || last?.player_check;
      const title = titleOverride || (
        payload?.tool_called === 'start_combat'
          ? Language.t('combat_started_label')
          : payload?.tool_called === 'roll_check'
            ? Language.t('dice_roll_label')
            : Language.t('combat_round_label')
      );
      const logs = last?.log || state?.log?.slice(-3) || [];
      return `
        <div class="combat-card">
          <div class="combat-card__top">
            <div>
              <div class="combat-card__eyebrow">${Renderer.escapeHtml(Language.t('mcp_mechanics_label'))}</div>
              <h4>${Renderer.escapeHtml(title)}</h4>
            </div>
            <span>${Renderer.escapeHtml(payload?.tool_called || 'mcp_tool')} / ${Renderer.escapeHtml(payload?.transport || 'mcp-stdio')}</span>
          </div>
          ${roll ? renderRollLine(roll) : ''}
          ${last?.stat_used ? `<div class="combat-stat">${Renderer.escapeHtml(Language.t('stat_used_label'))}: <strong>${Renderer.escapeHtml(last.stat_used)}</strong></div>` : ''}
          ${player && enemy ? `
            <div class="combat-grid">
              ${renderHpLine(player.name || 'Player', player)}
              ${renderHpLine(enemy.name || 'Enemy', enemy)}
              ${ally ? renderHpLine(ally.name || 'Ally', ally) : ''}
            </div>
          ` : ''}
          ${logs.length ? `<ul class="combat-log">${logs.map(item => `<li>${Renderer.escapeHtml(item)}</li>`).join('')}</ul>` : ''}
          ${result.summary ? `<div class="combat-summary">${Renderer.escapeHtml(result.summary)}</div>` : ''}
        </div>
      `;
    };

    const appendMechanicsCard = (payload, beforeNode = null, titleOverride = '') => {
      const msgs = document.getElementById('ai-messages');
      const div = document.createElement('div');
      div.className = 'ai-msg ai-msg--ai ai-msg--mechanics';
      div.innerHTML = renderMechanicsCard(payload, titleOverride);
      if (beforeNode && msgs.contains(beforeNode)) {
        msgs.insertBefore(div, beforeNode);
      } else {
        msgs.appendChild(div);
      }
      msgs.scrollTop = msgs.scrollHeight;
    };

    const callMcpMechanics = async (path, body) => {
      const response = await fetch(`${MUSEAI_API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'MCP mechanics call failed');
      return data.data;
    };

    const resolveMechanicsForAction = async (action, char, loc, beforeNode = null) => {
      const entries = [];
      const language = Language.getLanguage();
      const playerStats = getPlayerStatsPayload(char);

      if (combatState && detectCombatEndIntent(action)) {
        const payload = await callMcpMechanics('/api/mcp/combat/end', {
          combat_state: combatState,
          reason: 'player_request',
          language
        });
        combatState = null;
        appendMechanicsCard(payload, beforeNode);
        entries.push(buildMechanicsHistoryEntry(payload));
        return entries;
      }

      if (!combatState && detectCombatIntent(action)) {
        const startPayload = await callMcpMechanics('/api/mcp/combat/start', {
          player_name: char.name,
          player_stats: playerStats,
          enemy_kind: inferEnemyKind(action, loc),
          ally_kind: inferAllyKind(action),
          location_name: loc.name,
          language
        });
        combatState = startPayload?.result?.combat_state || null;
        appendMechanicsCard(startPayload, beforeNode, Language.t('combat_started_label'));
        entries.push(buildMechanicsHistoryEntry(startPayload));
      }

      if (combatState) {
        const roundPayload = await callMcpMechanics('/api/mcp/combat/advance', {
          combat_state: combatState,
          player_action: action,
          player_stats: playerStats,
          language
        });
        combatState = roundPayload?.result?.combat_state || combatState;
        appendMechanicsCard(roundPayload, beforeNode, Language.t('combat_round_label'));
        entries.push(buildMechanicsHistoryEntry(roundPayload));
        if (combatState?.status !== 'active') combatState = null;
        return entries;
      }

      if (detectDiceIntent(action)) {
        const statName = inferStatForAction(action);
        const payload = await callMcpMechanics('/api/mcp/roll-check', {
          stat_name: statName,
          stat_value: playerStats[statName],
          difficulty_class: inferDifficultyClass(action, loc),
          language
        });
        appendMechanicsCard(payload, beforeNode, Language.t('dice_roll_label'));
        entries.push(buildMechanicsHistoryEntry(payload));
      }

      return entries;
    };

    const runMcpDemo = async () => {
      const { char, loc, storyPremise } = getSelectedEncounterContext();
      if (!char || !loc) {
        if (mcpDemoOutput) mcpDemoOutput.textContent = 'Select a character and location before running the MCP demo.';
        return;
      }

      if (mcpDemoOutput) mcpDemoOutput.textContent = 'Calling MCP tool get_encounter_context...';
      try {
        const response = await fetch(`${MUSEAI_API_BASE}/api/mcp/demo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character_name: char.name,
            location_name: loc.name,
            story_premise: storyPremise
          })
        });
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'MCP demo failed');
        if (mcpDemoOutput) mcpDemoOutput.textContent = renderMcpContextResult(data.data);
      } catch (err) {
        if (mcpDemoOutput) mcpDemoOutput.textContent = `MCP demo failed: ${err.message}`;
      }
    };
    
    // Populate dropdowns when page is active
    const populateDropdowns = () => {
      const chars = DataStore.getCharacters();
      const locs = DataStore.getLocations();
      const selectedChar = charSelect?.value || '';
      const selectedLoc = locSelect?.value || '';
      
      if(charSelect) {
        charSelect.innerHTML = `<option value="">${Language.t('select_character_option')}</option>` + 
          chars.map(c => `<option value="${c.id}">${c.name} (${c.charClass})</option>`).join('');
        charSelect.value = selectedChar;
      }
      if(locSelect) {
        locSelect.innerHTML = `<option value="">${Language.t('select_location_option')}</option>` + 
          locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
        locSelect.value = selectedLoc;
      }
    };

    // Override router to populate Data
    const _oldNav = Router.navigateTo;
    Router.navigateTo = function(pageId) {
      _oldNav.call(Router, pageId);
      if (pageId === 'lore-master') populateDropdowns();
    };

    btnStart?.addEventListener('click', () => {
      const charId = charSelect.value;
      const locId = locSelect.value;
      const premiseDesc = document.getElementById('enc-premise').value.trim();

      if (!charId || !locId || !premiseDesc) {
        alert(Language.t('encounter_validation'));
        return;
      }

      // Reset histories
      campaignHistory = "--- CAMPAIGN START ---\\nInitial Premise: " + premiseDesc + "\\n";
      npcHistories = {};
      combatState = null;
      syncEncounterEngineUI();

      document.getElementById('encounter-setup').classList.add('hidden');
      document.getElementById('ai-chat').classList.remove('hidden');
      
      const activeEngine = getEngineConfigMap()[getSelectedEngine()];
      const msgs = document.getElementById('ai-messages');
      msgs.innerHTML = `
        <div class="ai-msg ai-msg--ai">
          <div class="ai-msg__label">${Language.t('system_label')}</div>
          <div>${Renderer.escapeHtml(activeEngine.startMessage)}</div>
        </div>
      `;
    });

    btnEnd?.addEventListener('click', () => {
      document.getElementById('encounter-setup').classList.remove('hidden');
      document.getElementById('ai-chat').classList.add('hidden');
      document.getElementById('ai-input').value = '';
      combatState = null;
    });

    btnSend?.addEventListener('click', () => handleActionSubmit());
    inputAction?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleActionSubmit();
    });

    async function handleActionSubmit() {
      const action = inputAction.value.trim();
      if (!action) return;
      
      campaignHistory += `\\nPlayer Action: ${action}`;

      const char = DataStore.getCharacter(charSelect.value);
      const loc = DataStore.getLocation(locSelect.value);
      const story_premise = document.getElementById('enc-premise').value.trim();
      const selectedEngine = getSelectedEngine();
      const engineConfig = getEngineConfigMap()[selectedEngine];
      
      const player_stats = `Stats: Strength ${char.stats.strength}, Intellect ${char.stats.intellect}, Agility ${char.stats.agility}, Charisma ${char.stats.charisma}. Traits: ${char.traits.map(t => t.name).join(', ')}`;
      const location_context = `${loc.name} (${loc.type}). Mood: ${loc.moodDescription}. Danger Level: ${loc.dangerLevel}. Features: ${loc.features.join(', ')}`;
      
      inputAction.value = '';
      
      // Add user message
      const msgs = document.getElementById('ai-messages');
      const usrDiv = document.createElement('div');
      usrDiv.className = 'ai-msg ai-msg--user';
      usrDiv.textContent = action;
      msgs.appendChild(usrDiv);
      msgs.scrollTop = msgs.scrollHeight;

      // Add loading state
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'ai-msg ai-msg--ai';
      loadingDiv.innerHTML = `<div class="ai-msg__label">${Language.t('system_label')}</div><div><span class="ai-chat__status" style="display:inline-block; margin-right:8px;"></span> ${Renderer.escapeHtml(engineConfig.loadingText)}</div>`;
      msgs.appendChild(loadingDiv);
      msgs.scrollTop = msgs.scrollHeight;

      try {
        const mechanicsEntries = await resolveMechanicsForAction(action, char, loc, loadingDiv);
        for (const entry of mechanicsEntries) {
          campaignHistory += `\\nMCP Mechanics: ${entry}`;
        }

        const response = await fetch(`${MUSEAI_API_BASE}/api/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_stats,
            story_premise,
            campaign_history: campaignHistory,
            npc_histories: npcHistories,
            action,
            location_context,
            character_name: char.name,
            location_name: loc.name,
            language: Language.getLanguage(),
            engine: selectedEngine
          })
        });

        const data = await response.json();
        msgs.removeChild(loadingDiv);
        
        if (data.status === 'success') {
          const result = data.data;
          const configMap = getEngineConfigMap();
          const resultEngine = configMap[result.engine] ? result.engine : selectedEngine;
          const resultConfig = configMap[resultEngine];
          syncEncounterEngineUI(resultEngine);
          
          campaignHistory += `\\nGame Master: ${result.gm_narration}`;
          
          // Add GM Narration
          const gmDiv = document.createElement('div');
          gmDiv.className = 'ai-msg ai-msg--ai';
          gmDiv.innerHTML = `<div class="ai-msg__label">${Renderer.escapeHtml(resultConfig.gmLabel)}</div><div>${Renderer.escapeHtml(result.gm_narration)}</div>`;
          msgs.appendChild(gmDiv);

          if (result.workflow_steps && result.workflow_steps.length > 0) {
            const workflowDiv = document.createElement('div');
            workflowDiv.className = 'ai-msg ai-msg--ai';
            workflowDiv.innerHTML = `<div class="ai-msg__label">${Renderer.escapeHtml(resultConfig.workflowLabel)}</div><div>${Renderer.escapeHtml(result.workflow_steps.join(' → '))}</div>`;
            msgs.appendChild(workflowDiv);
          }

          if (result.mcp_context) {
            const mcpDiv = document.createElement('div');
            mcpDiv.className = 'ai-msg ai-msg--ai';
            mcpDiv.innerHTML = `<div class="ai-msg__label">${Renderer.escapeHtml(Language.t('mcp_context_label'))}</div><div>${Renderer.escapeHtml(renderMcpContextSummary(result.mcp_context))}</div>`;
            msgs.appendChild(mcpDiv);
          }
          
          // Add Sub-Agents (NPC) Dialogues
          if (result.npc_reactions && result.npc_reactions.length > 0) {
            for (const npc of result.npc_reactions) {
              campaignHistory += `\\n${npc.name}: ${npc.dialogue}`;
              
              if (!npcHistories[npc.name]) npcHistories[npc.name] = "";
              npcHistories[npc.name] += `\\nPlayer did: ${action}\\nYou replied: ${npc.dialogue}`;
              
              const npcDiv = document.createElement('div');
              npcDiv.className = 'ai-msg ai-msg--ai';
              const npcDisplayName = Language.translateNpcName(npc.name);
              npcDiv.innerHTML = `<div class="ai-msg__label">${Renderer.escapeHtml(npcDisplayName)} (${Renderer.escapeHtml(resultConfig.npcLabel)})</div><div><em>${Renderer.escapeHtml(npc.dialogue)}</em></div>`;
              msgs.appendChild(npcDiv);
            }
          }
        } else {
          throw new Error(data.message || 'Error running CrewAI Backend');
        }
      } catch (err) {
        if(msgs.contains(loadingDiv)) msgs.removeChild(loadingDiv);
        const errDiv = document.createElement('div');
        errDiv.className = 'ai-msg ai-msg--ai';
        errDiv.innerHTML = `<div class="ai-msg__label">${Language.t('error_label')}</div><div style="color:red;">${Language.t('api_failure', { message: err.message })}</div>`;
        msgs.appendChild(errDiv);
      }
      msgs.scrollTop = msgs.scrollHeight;
    }

    engineSelect?.addEventListener('change', () => syncEncounterEngineUI());
    mcpDemoBtn?.addEventListener('click', () => runMcpDemo());
    document.addEventListener('museai:languagechange', () => {
      populateDropdowns();
      syncEncounterEngineUI();
    });
    syncEncounterEngineUI();
  }
})();

document.addEventListener('DOMContentLoaded', Controller.init);
