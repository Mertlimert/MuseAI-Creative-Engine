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
   5. AI ENGINE — Simulated AI Interaction
   ============================================================ */
const AIEngine = (() => {
  const SCENARIOS = {
    dragon: {
      userMessage: 'Karakter Ahmethan, ejderhanın karşısına çıkıyor. Ne yapmalı?',
      aiResponse: `<div class="ai-msg__label">Lore-Master AI — Consistency Analysis</div>
        <p><strong>Karakter Analizi:</strong> Ahmethan'ın "Korkak" özelliği tespit edildi.</p>
        <br>
        <p><strong>🟢 Seçenek 1 — Kaçmak (Tutarlı):</strong> Ahmethan, ejderhayı gördüğü an paniğe kapılır ve en yakın sığınağa doğru koşar. Bu, korkak karakteriyle uyumludur.</p>
        <br>
        <p><strong>🟢 Seçenek 2 — Saklanmak (Tutarlı):</strong> Ahmethan sessizce bir kayanın arkasına gizlenir ve ejderhanın geçmesini bekler.</p>
        <br>
        <p><strong>🔴 Seçenek 3 — Saldırmak (TUTARSIZ!):</strong> ⚠️ <em>Uyarı: Ahmethan korkak bir karakter. Doğrudan saldırı, karakter profiline aykırıdır. Eğer saldırmasını istiyorsanız, bir motivasyon eklemeyi düşünün (örn: sevdiği biri tehlikede).</em></p>`,
    },
    betrayal: {
      userMessage: "Güvenilir müttefik Aelwen'in ihanet ettiği ortaya çıkıyor. Karakter tutarlılığını kontrol et.",
      aiResponse: `<div class="ai-msg__label">Lore-Master AI — Plot Analysis</div>
        <p><strong>İhanet Analizi:</strong> Aelwen'in backstory'si ve karakter özellikleri incelendi.</p>
        <br>
        <p><strong>✅ Tutarlılık Raporu:</strong> Aelwen'in "Cunning" (Kurnaz) özelliği, uzun vadeli bir ihanet planı ile uyumludur. Ancak, eğer "Loyal" (Sadık) özelliği varsa, ihanetin bir zorlanma veya tehdit sonucu olduğu açıklanmalıdır.</p>
        <br>
        <p><strong>💡 Öneri:</strong> İhanetin arkasında kişisel bir motivasyon ekleyin — örneğin ailesini korumak veya eski bir borç.</p>`,
    },
    treasure: {
      userMessage: 'Efsanevi bir hazine keşfedildi. Hangi karakter peşine düşer?',
      aiResponse: `<div class="ai-msg__label">Lore-Master AI — Character Matching</div>
        <p><strong>Hazine Analizi:</strong> Mevcut karakterler incelendi.</p>
        <br>
        <p><strong>🏆 En Uygun:</strong> Xyla the Rogue — "Cunning" özelliği ve Shadow Dancer sınıfı, hazine avı için ideal bir adaydır. Yüksek Agility (94) ile tuzaklardan kolayca kurtulabilir.</p>
        <br>
        <p><strong>⚔️ Olası Çatışma:</strong> Grog the Brutal da hazineyi isteyebilir — güç ile elde etmeye çalışır. Bu iki karakter arasında rekabet yaratabilirsiniz.</p>
        <br>
        <p><strong>🚫 Uyumsuz:</strong> Aethelgard the Wise — Bilge karakterler genellikle maddi zenginlik peşinde koşmaz. Ancak eğer hazine büyülü bir artifact ise, ilgisini çekebilir.</p>`,
    },
  };

  /** General responses for free-form chat */
  const GENERAL_RESPONSES = [
    `Harika bir soru! Karakter tutarlılığı açısından bakarsak, bu sahne için karakterin geçmiş deneyimlerini ve kişilik özelliklerini göz önünde bulundurmanızı öneririm. Eğer belirli bir karakter hakkında analiz isterseniz, ismini yazabilirsiniz.`,
    `Lore-Master olarak size şunu önerebilirim: Her kritik karar noktasında, karakterin en az 2 tutarlı ve 1 sürpriz seçeneğe sahip olmasını planlayın. Sürpriz seçenek, karakter gelişimi için harika bir fırsat olabilir!`,
    `İlginç bir yaklaşım! Hikaye yapınızda "3 Perde" kuralını uygulayabilirsiniz: 1) Tanıtım ve çatışma kurulumu, 2) Tırmanma ve komplikasyonlar, 3) Doruk nokta ve çözüm. Bu yapı, okuyucunun ilgisini sürekli canlı tutar.`,
    `Karakter ilişkilerini derinleştirmek istiyorsanız, her karaktere en az bir "gizli bağlantı" ekleyin. Bu, hikayenin ilerleyen bölümlerinde sürpriz dönüm noktaları yaratmanıza yardımcı olur.`,
  ];

  let responseIndex = 0;

  function getScenarioResponse(scenarioKey) {
    return SCENARIOS[scenarioKey] || null;
  }

  function getGeneralResponse() {
    const response = GENERAL_RESPONSES[responseIndex % GENERAL_RESPONSES.length];
    responseIndex++;
    return response;
  }

  return { getScenarioResponse, getGeneralResponse };
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
    bindLoreMaster();
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
     LORE-MASTER AI
     ───────────────────────────────────────── */
  function bindLoreMaster() {
    // Scenario cards
    document.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', () => {
        const scenario = card.getAttribute('data-scenario');
        handleScenario(scenario);
      });
    });

    // Chat input
    document.getElementById('btn-ai-send')?.addEventListener('click', handleAIChatSend);
    document.getElementById('ai-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAIChatSend();
    });
  }

  function handleScenario(scenarioKey) {
    const scenario = AIEngine.getScenarioResponse(scenarioKey);
    if (!scenario) return;

    const messagesEl = document.getElementById('ai-messages');
    appendChatMessage(messagesEl, 'user', scenario.userMessage);

    // Simulate typing delay
    setTimeout(() => {
      appendChatMessage(messagesEl, 'ai', scenario.aiResponse, true);
    }, 800);
  }

  function handleAIChatSend() {
    const input = document.getElementById('ai-input');
    const text = input.value.trim();
    if (!text) return;

    const messagesEl = document.getElementById('ai-messages');
    appendChatMessage(messagesEl, 'user', Renderer.escapeHtml(text));
    input.value = '';

    setTimeout(() => {
      const response = AIEngine.getGeneralResponse();
      appendChatMessage(messagesEl, 'ai', response);
    }, 1000);
  }

  function appendChatMessage(container, type, content, isHtml = false) {
    const div = document.createElement('div');
    div.className = `ai-msg ai-msg--${type}`;
    if (type === 'ai') {
      div.innerHTML = `<div class="ai-msg__label">Lore-Master AI</div><div>${isHtml ? content : Renderer.escapeHtml(content)}</div>`;
    } else {
      div.textContent = content;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
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
   7. BOOTSTRAP — Initialize App
   ============================================================ */
document.addEventListener('DOMContentLoaded', Controller.init);
