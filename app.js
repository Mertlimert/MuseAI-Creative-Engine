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
    return _data;
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
          <div class="stat-card__label">Total Universes</div>
          <div class="stat-card__value">${stats.totalUniverses}</div>
        </div>
        <div class="stat-card__icon">🌐</div>
      </div>
      <div class="stat-card animate-slide stagger-2">
        <div>
          <div class="stat-card__label">Active Characters</div>
          <div class="stat-card__value">${stats.activeCharacters}</div>
        </div>
        <div class="stat-card__icon">👥</div>
      </div>
      <div class="stat-card animate-slide stagger-3">
        <div>
          <div class="stat-card__label">Quests Completed</div>
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
          <span class="universe-card__badge badge--${uni.genre}">${escapeHtml(uni.genre)}</span>
        </div>
        <div class="card__body">
          <h3 class="universe-card__title">${escapeHtml(uni.name)}</h3>
          <p class="universe-card__desc">${escapeHtml(uni.description)}</p>
          <div class="universe-card__stats">
            <div>
              <div class="universe-card__stat-label">Characters</div>
              <div class="universe-card__stat-value">${uni.characters}</div>
            </div>
            <div>
              <div class="universe-card__stat-label">Quests</div>
              <div class="universe-card__stat-value">${uni.quests}</div>
            </div>
          </div>
        </div>
        <div class="card__footer">
          <span class="universe-card__meta">Last edited ${escapeHtml(uni.lastEdited)}</span>
          <div class="flex gap-sm">
            <button class="btn btn--sm btn--outline btn-edit-universe" data-id="${uni.id}" title="Edit">✏️</button>
            <button class="btn btn--sm btn--danger btn-delete-universe" data-id="${uni.id}" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');

    html += `
      <div class="card universe-card--new animate-slide stagger-${universes.length + 1}" id="btn-new-universe">
        <div class="universe-card--new__icon">＋</div>
        <div class="universe-card--new__title">New Universe</div>
        <p class="universe-card--new__desc">Start a new story thread and build your world from scratch.</p>
      </div>
    `;

    container.innerHTML = html;
  }

  // ── Character List ──
  function renderCharacterList(container, characters, activeId) {
    if (characters.length === 0) {
      container.innerHTML = '<div class="empty-state"><p class="text-muted">No characters yet</p></div>';
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
          <div class="char-list-item__role">${escapeHtml(char.charClass)} · ${escapeHtml(char.roleType)}</div>
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
          <div class="empty-state__title">Select a Character</div>
          <p class="empty-state__desc">Choose a character from the library to edit their details</p>
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
            <span class="tag tag--level">Level ${char.level}</span>
            <span class="tag tag--race">${escapeHtml(char.race)}</span>
          </div>
        </div>
      </div>

      <div class="char-section animate-slide">
        <h3 class="char-section__title"><span>📖</span> Backstory & Origins</h3>
        <textarea class="char-backstory" id="char-backstory-edit" data-id="${char.id}">${escapeHtml(char.backstory)}</textarea>
      </div>

      <div class="char-section animate-slide">
        <h3 class="char-section__title"><span>🎯</span> Personality Traits</h3>
        <div class="traits-container" id="traits-container">
          ${char.traits.map((trait, idx) => `
            <div class="trait-chip trait-chip--${trait.type}">
              <span class="trait-chip__icon">${getTraitIcon(trait.type)}</span>
              <span>${escapeHtml(trait.name)}</span>
              <button class="trait-chip__remove btn-remove-trait" data-char-id="${char.id}" data-index="${idx}">✕</button>
            </div>
          `).join('')}
          <button class="add-trait-btn" id="btn-add-trait" data-char-id="${char.id}">+ Add Trait</button>
        </div>
      </div>

      <div class="char-actions animate-slide">
        <button class="btn btn--danger btn-delete-char" data-id="${char.id}">🗑️ Delete Character</button>
        <button class="btn btn--primary btn-save-backstory" data-id="${char.id}">💾 Save Changes</button>
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
        <h3 class="stat-block__title"><span>📊</span> Core Stats</h3>
        ${renderStatRow('Strength', char.stats.strength, 'strength', char.id)}
        ${renderStatRow('Intellect', char.stats.intellect, 'intellect', char.id)}
        ${renderStatRow('Agility', char.stats.agility, 'agility', char.id)}
        ${renderStatRow('Charisma', char.stats.charisma, 'charisma', char.id)}
      </div>
      <div class="ai-insights animate-slide">
        <h3 class="ai-insights__title"><span>✨</span> AI Insights</h3>
        <p class="ai-insights__text" id="ai-char-insight">${generateCharInsight(char)}</p>
        <button class="btn btn--primary btn--sm w-full" id="btn-apply-suggestion">Apply Suggestion</button>
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
      return `"${char.name}'s high intellect suggests they would likely use illusion magic to cover any cowardly retreat. Consider adding 'Deceptive' to their trait list to align with their secret backstory."`;
    }
    if (traitNames.includes('aggressive') && char.stats.strength < 30) {
      return `"${char.name} has aggressive tendencies but low strength. This could create interesting internal conflict — perhaps their aggression is verbal, not physical."`;
    }
    if (traitNames.includes('brave') && traitNames.includes('aggressive')) {
      return `"${char.name}'s bravery combined with aggression makes them a natural frontline leader. Consider giving them a squad to command in battle scenarios."`;
    }
    return `"${char.name}'s unique combination of traits creates narrative opportunities. Consider how their ${char.charClass} abilities interact with their personality in critical moments."`;
  }

  // ── Quest List ──
  function renderQuestList(container, quests, activeId) {
    if (quests.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📜</div>
          <div class="empty-state__title">No Quests Yet</div>
          <p class="empty-state__desc">Create your first quest to start building your narrative</p>
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
            <span class="status-badge status-badge--${quest.status}">${quest.status}</span>
          </div>
          <div class="quest-card__type">${capitalize(quest.type)} · ${quest.phase}</div>
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
          <div class="empty-state__title">Select a Quest</div>
          <p class="empty-state__desc">Choose a quest from the list to see its details and milestones</p>
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
          <span class="status-badge status-badge--${quest.status}">${quest.status}</span>
        </div>
        <p style="font-size:0.88rem;color:var(--color-text-secondary);margin-bottom:var(--space-md);">${escapeHtml(quest.description)}</p>

        <div class="quest-detail__section-title">Progress — ${progressPct}%</div>
        <div class="stat-bar mb-lg">
          <div class="stat-bar__fill" style="width:${progressPct}%;background:linear-gradient(90deg,var(--color-accent-green),var(--color-accent-cyan));"></div>
        </div>

        <div class="quest-detail__section-title">Milestones</div>
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
          <button class="btn btn--danger btn--sm btn-delete-quest" data-id="${quest.id}">🗑️ Delete</button>
          <button class="btn btn--outline btn--sm btn-edit-quest" data-id="${quest.id}">✏️ Edit</button>
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
    ModalManager.setupBackdropClose();
    bindNavigation();
    bindWorldHub();
    bindCharacterForge();
    bindQuestLedger();
    bindMobileToggle();
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
        if (confirm('Are you sure you want to delete this universe?')) {
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
      titleEl.textContent = 'Edit Universe';
      submitBtn.textContent = 'Save Changes';
      hiddenId.value = editId;
      document.getElementById('universe-name').value = uni.name;
      document.getElementById('universe-genre').value = uni.genre;
      document.getElementById('universe-desc').value = uni.description;
    } else {
      titleEl.textContent = 'Create Universe';
      submitBtn.textContent = 'Create';
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
      showToast('Backstory saved!');
    });

    // Delete character
    document.querySelector('.btn-delete-char')?.addEventListener('click', (e) => {
      const charId = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this character?')) {
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
      showToast('AI suggestion applied! (simulated)');
    });
  }

  function openCharacterModal(editId) {
    const titleEl = document.getElementById('modal-character-title');
    const submitBtn = document.getElementById('modal-character-submit');
    const hiddenId = document.getElementById('char-edit-id');

    if (editId) {
      const char = DataStore.getCharacter(editId);
      if (!char) return;
      titleEl.textContent = 'Edit Character';
      submitBtn.textContent = 'Save Changes';
      hiddenId.value = editId;
      document.getElementById('char-name').value = char.name;
      document.getElementById('char-class').value = char.charClass;
      document.getElementById('char-role-type').value = char.roleType;
      document.getElementById('char-backstory-input').value = char.backstory;
    } else {
      titleEl.textContent = 'Create Character';
      submitBtn.textContent = 'Create';
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
      if (confirm('Are you sure you want to delete this quest?')) {
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
      titleEl.textContent = 'Edit Quest';
      submitBtn.textContent = 'Save Changes';
      hiddenId.value = editId;
      document.getElementById('quest-name').value = quest.title;
      document.getElementById('quest-type').value = quest.type;
      document.getElementById('quest-status-input').value = quest.status;
      document.getElementById('quest-desc-input').value = quest.description;
    } else {
      titleEl.textContent = 'Create Quest';
      submitBtn.textContent = 'Create';
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
        <div class="ai-gen-step__label">✨ Generated Name</div>
        <div class="ai-gen-step__value ai-gen-step__value--large">${Renderer.escapeHtml(char.name)}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">⚔️ Class & Race</div>
        <div class="ai-gen-step__value">${Renderer.escapeHtml(char.charClass)} · ${Renderer.escapeHtml(char.race)} · Level ${char.level}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📊 Core Stats</div>
        <div class="ai-gen-stats">
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">Strength</span><span class="ai-gen-stat__value" style="color:var(--color-accent-red)">${char.stats.strength}</span></div>
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">Intellect</span><span class="ai-gen-stat__value" style="color:var(--color-accent-cyan)">${char.stats.intellect}</span></div>
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">Agility</span><span class="ai-gen-stat__value" style="color:var(--color-accent-green)">${char.stats.agility}</span></div>
          <div class="ai-gen-stat"><span class="ai-gen-stat__label">Charisma</span><span class="ai-gen-stat__value" style="color:var(--color-accent-pink)">${char.stats.charisma}</span></div>
        </div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">🎯 Personality Traits</div>
        <div class="ai-gen-traits">
          ${char.traits.map(t => `<div class="trait-chip trait-chip--${t.type}"><span class="trait-chip__icon">${Renderer.escapeHtml(getTraitIcon(t.type))}</span> ${Renderer.escapeHtml(t.name)}</div>`).join('')}
        </div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📖 Generated Backstory</div>
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
        <div class="ai-gen-step__label">${loc.icon} Generated Location</div>
        <div class="ai-gen-step__value ai-gen-step__value--large">${Renderer.escapeHtml(loc.name)}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📌 Type & Atmosphere</div>
        <div class="ai-gen-step__value">${Renderer.capitalize(loc.type)} · ${Renderer.capitalize(loc.mood)} · Danger Level: ${loc.dangerLevel}/10</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">📝 Description</div>
        <div class="ai-gen-step__value ai-gen-step__value--text">${Renderer.escapeHtml(loc.description)}</div>
      </div>
      <div class="ai-gen-step">
        <div class="ai-gen-step__label">🗝️ Key Features</div>
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
  ];

  // Inject locations into DataStore on first load
  const _origLoad = DataStore.load;
  DataStore.load = function() {
    const data = _origLoad.call(DataStore);
    if (!data.locations) {
      data.locations = structuredClone(LOCATION_DEFAULTS);
      DataStore.save();
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
            <div class="location-card__type">${Renderer.capitalize(loc.type)} · Danger: ${loc.dangerLevel || '?'}/10</div>
          </div>
        </div>
        <p class="location-card__desc">${Renderer.escapeHtml(loc.description)}</p>
        ${loc.features && loc.features.length ? `
          <div class="location-features mb-md">${loc.features.map(f => `<span class="location-feature">${Renderer.escapeHtml(f)}</span>`).join('')}</div>
        ` : ''}
        <div class="location-card__footer">
          <span class="location-card__mood">${loc.mood ? Renderer.capitalize(loc.mood) : ''}</span>
          <button class="btn btn--sm btn--danger btn-delete-location" data-id="${loc.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    html += `
      <div class="location-card location-card--new" id="btn-new-loc-card">
        <div class="universe-card--new__icon">＋</div>
        <div class="universe-card--new__title">New Location</div>
        <p class="universe-card--new__desc">Add a new place to your world</p>
      </div>
    `;

    grid.innerHTML = html;

    // Bind card events
    grid.querySelectorAll('.btn-delete-location').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this location?')) {
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

  function generateCharacterUI() {
    const genre = document.getElementById('ai-char-genre')?.value || 'fantasy';
    const role = document.getElementById('ai-char-role')?.value || 'NPC';
    const theme = document.getElementById('ai-char-theme')?.value || 'balanced';

    const configEl = document.getElementById('ai-gen-char-config');
    const outputEl = document.getElementById('ai-gen-char-output');
    const resultEl = document.getElementById('ai-gen-char-result');

    configEl?.classList.add('hidden');
    outputEl?.classList.remove('hidden');
    resultEl.innerHTML = '<div class="ai-gen-loading"><div class="ai-gen-spinner"></div>Generating character...</div>';

    setTimeout(() => {
      _lastGenChar = AIGenerator.generateCharacter(genre, role, theme);
      resultEl.innerHTML = AIGenerator.renderCharacterResult(_lastGenChar);
    }, 1200);
  }

  function generateLocationUI() {
    const genre = document.getElementById('ai-loc-genre')?.value || 'fantasy';
    const type = document.getElementById('ai-loc-type')?.value || 'city';
    const mood = document.getElementById('ai-loc-mood')?.value || 'mysterious';

    const configEl = document.getElementById('ai-gen-loc-config');
    const outputEl = document.getElementById('ai-gen-loc-output');
    const resultEl = document.getElementById('ai-gen-loc-result');

    configEl?.classList.add('hidden');
    outputEl?.classList.remove('hidden');
    resultEl.innerHTML = '<div class="ai-gen-loading"><div class="ai-gen-spinner"></div>Generating location...</div>';

    setTimeout(() => {
      _lastGenLoc = AIGenerator.generateLocation(genre, type, mood);
      resultEl.innerHTML = AIGenerator.renderLocationResult(_lastGenLoc);
    }, 1200);
  }
  function bindCrewAI() {
    const btnStart = document.getElementById('btn-start-encounter');
    const btnEnd = document.getElementById('btn-end-encounter');
    const btnSend = document.getElementById('btn-ai-send');
    const charSelect = document.getElementById('enc-character');
    const locSelect = document.getElementById('enc-location');
    const engineSelect = document.getElementById('enc-engine');
    const engineHint = document.getElementById('enc-engine-hint');
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
    
    // State logic for Campaign
    let campaignHistory = "";
    let npcHistories = {};

    const getSelectedEngine = () => {
      const value = engineSelect?.value || 'crewai';
      return ENGINE_CONFIG[value] ? value : 'crewai';
    };

    const syncEncounterEngineUI = (engineKey = getSelectedEngine()) => {
      const cfg = ENGINE_CONFIG[engineKey];
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
    
    // Populate dropdowns when page is active
    const populateDropdowns = () => {
      const chars = DataStore.getCharacters();
      const locs = DataStore.getLocations();
      
      if(charSelect) {
        charSelect.innerHTML = '<option value="">Select a character...</option>' + 
          chars.map(c => `<option value="${c.id}">${c.name} (${c.charClass})</option>`).join('');
      }
      if(locSelect) {
        locSelect.innerHTML = '<option value="">Select a location...</option>' + 
          locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
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
        alert('Please select a character, location, and set a story premise.');
        return;
      }

      // Reset histories
      campaignHistory = "--- CAMPAIGN START ---\\nInitial Premise: " + premiseDesc + "\\n";
      npcHistories = {};
      syncEncounterEngineUI();

      document.getElementById('encounter-setup').classList.add('hidden');
      document.getElementById('ai-chat').classList.remove('hidden');
      
      const activeEngine = ENGINE_CONFIG[getSelectedEngine()];
      const msgs = document.getElementById('ai-messages');
      msgs.innerHTML = `
        <div class="ai-msg ai-msg--ai">
          <div class="ai-msg__label">Dungeon Master System</div>
          <div>${Renderer.escapeHtml(activeEngine.startMessage)}</div>
        </div>
      `;
    });

    btnEnd?.addEventListener('click', () => {
      document.getElementById('encounter-setup').classList.remove('hidden');
      document.getElementById('ai-chat').classList.add('hidden');
      document.getElementById('ai-input').value = '';
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
      const engineConfig = ENGINE_CONFIG[selectedEngine];
      
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
      loadingDiv.innerHTML = `<div class="ai-msg__label">System</div><div><span class="ai-chat__status" style="display:inline-block; margin-right:8px;"></span> ${Renderer.escapeHtml(engineConfig.loadingText)}</div>`;
      msgs.appendChild(loadingDiv);
      msgs.scrollTop = msgs.scrollHeight;

      try {
        const response = await fetch('http://localhost:8000/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_stats,
            story_premise,
            campaign_history: campaignHistory,
            npc_histories: npcHistories,
            action,
            location_context,
            engine: selectedEngine
          })
        });

        const data = await response.json();
        msgs.removeChild(loadingDiv);
        
        if (data.status === 'success') {
          const result = data.data;
          const resultEngine = ENGINE_CONFIG[result.engine] ? result.engine : selectedEngine;
          const resultConfig = ENGINE_CONFIG[resultEngine];
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
          
          // Add Sub-Agents (NPC) Dialogues
          if (result.npc_reactions && result.npc_reactions.length > 0) {
            for (const npc of result.npc_reactions) {
              campaignHistory += `\\n${npc.name}: ${npc.dialogue}`;
              
              if (!npcHistories[npc.name]) npcHistories[npc.name] = "";
              npcHistories[npc.name] += `\\nPlayer did: ${action}\\nYou replied: ${npc.dialogue}`;
              
              const npcDiv = document.createElement('div');
              npcDiv.className = 'ai-msg ai-msg--ai';
              npcDiv.innerHTML = `<div class="ai-msg__label">${Renderer.escapeHtml(npc.name)} (${Renderer.escapeHtml(resultConfig.npcLabel)})</div><div><em>${Renderer.escapeHtml(npc.dialogue)}</em></div>`;
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
        errDiv.innerHTML = `<div class="ai-msg__label">Error</div><div style="color:red;">API Failure. Error: ${err.message}</div>`;
        msgs.appendChild(errDiv);
      }
      msgs.scrollTop = msgs.scrollHeight;
    }

    engineSelect?.addEventListener('change', () => syncEncounterEngineUI());
    syncEncounterEngineUI();
  }
})();

document.addEventListener('DOMContentLoaded', Controller.init);
