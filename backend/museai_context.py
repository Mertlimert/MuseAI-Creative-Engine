from __future__ import annotations

from copy import deepcopy
import random
import unicodedata
from typing import Any, Dict, List


CHARACTERS: Dict[str, Dict[str, Any]] = {
    "aethelgard the wise": {
        "name": "Aethelgard the Wise",
        "class": "Archmage",
        "role": "Protagonist",
        "race": "Human",
        "level": 45,
        "traits": ["Aggressive", "Wise", "Cowardly"],
        "stats": {"strength": 12, "intellect": 98, "agility": 45, "charisma": 62},
        "lore": (
            "A senior mage carrying knowledge of old wards and political mistakes. "
            "His high intellect makes magical investigation and pattern recognition especially strong."
        ),
    },
    "grog the brutal": {
        "name": "Grog the Brutal",
        "class": "Berserker",
        "role": "Side Character",
        "race": "Orc",
        "level": 32,
        "traits": ["Aggressive", "Brave"],
        "stats": {"strength": 95, "intellect": 18, "agility": 55, "charisma": 25},
        "lore": "A direct warrior whose strongest narrative use is intimidation, combat pressure, and clan loyalty.",
    },
    "xyla the rogue": {
        "name": "Xyla the Rogue",
        "class": "Shadow Dancer",
        "role": "Antagonist",
        "race": "Elf",
        "level": 38,
        "traits": ["Cunning", "Cowardly"],
        "stats": {"strength": 35, "intellect": 72, "agility": 94, "charisma": 80},
        "lore": "A former noble turned spy-master, useful for stealth scenes, deception, and political intrigue.",
    },
    "derya demir": {
        "name": "Derya Demir",
        "class": "Ward Engineer",
        "role": "Protagonist",
        "race": "Human",
        "level": 27,
        "traits": ["Wise", "Brave", "Cunning"],
        "stats": {"strength": 34, "intellect": 91, "agility": 58, "charisma": 69},
        "lore": "A practical Turkish ward specialist from Kadikoy who reads magical systems like engineering diagrams.",
    },
    "baran koroglu": {
        "name": "Baran Koroglu",
        "class": "Relic Hunter",
        "role": "Side Character",
        "race": "Human",
        "level": 21,
        "traits": ["Brave", "Cunning"],
        "stats": {"strength": 62, "intellect": 67, "agility": 74, "charisma": 55},
        "lore": "A restless relic hunter who knows old Anatolian routes, hidden tunnels, and black-market artifact rumors.",
    },
}


LOCATIONS: Dict[str, Dict[str, Any]] = {
    "silverpeak citadel": {
        "name": "Silverpeak Citadel",
        "type": "city",
        "mood": "mysterious",
        "danger_level": 3,
        "features": ["Noble Quarter", "Guard Towers", "Underground Tunnels"],
        "lore": (
            "A fortress city built into a mountain. Its council vaults are protected by old glyph wards, "
            "and noble politics can become as dangerous as open combat."
        ),
    },
    "the sunken crypt": {
        "name": "The Sunken Crypt",
        "type": "dungeon",
        "mood": "eerie",
        "danger_level": 8,
        "features": ["Trap Corridor", "Boss Chamber", "Hidden Passage"],
        "lore": "A flooded royal crypt where ancient dead, traps, and sealed chambers create high-risk exploration.",
    },
    "whisperwood": {
        "name": "Whisperwood",
        "type": "wilderness",
        "mood": "mysterious",
        "danger_level": 5,
        "features": ["Ancient Ruins", "Herb Garden", "Ritual Circle"],
        "lore": "An old forest where hidden fey observers and ritual sites can steer encounters toward mystery.",
    },
    "yerebatan arsivi": {
        "name": "Yerebatan Arsivi",
        "type": "dungeon",
        "mood": "mysterious",
        "danger_level": 6,
        "features": ["Sarnic Gecitleri", "Muhurlu Raflar", "Kayip Harita Odasi"],
        "lore": "An underground archive below old Istanbul where sealed records and warded cistern passages protect forgotten relic files.",
    },
    "galata gozetleme kulesi": {
        "name": "Galata Gozetleme Kulesi",
        "type": "landmark",
        "mood": "bustling",
        "danger_level": 4,
        "features": ["Ruzgar Terasi", "Gizli Rasathane", "Kurye Hatti"],
        "lore": "A tower used by scouts, messengers, and discreet mages to monitor political movement across the city.",
    },
    "kapalicarsi golge pazari": {
        "name": "Kapalicarsi Golge Pazari",
        "type": "building",
        "mood": "dangerous",
        "danger_level": 7,
        "features": ["Gizli Tezgahlar", "Sifreli Kapilar", "Emanet Sandiklari"],
        "lore": "A hidden market under the Grand Bazaar where relics, favors, and dangerous information are traded quietly.",
    },
}


GENERATOR_CHARACTER_POOLS = {
    "tr": {
        "names": ["Derya Demir", "Baran Koroglu", "Selin Aydin", "Mahir Yildiz", "Ece Karaca", "Tuna Arslan"],
        "classes": ["Muhafiz Buyucusu", "Eser Avcisi", "Konsey Casusu", "Sarnic Rehberi", "Glif Muhendisi"],
        "races": ["Insan", "Elf", "Yari-Ork", "Golge Dokunmus"],
        "traits": [("Cesur", "brave"), ("Bilge", "wise"), ("Kurnaz", "cunning"), ("Dikkatli", "wise"), ("Sert", "aggressive")],
        "origins": [
            "Istanbul'un eski semtlerinde buyumus, sehrin gizli gecitlerini cocuklugundan beri bilen biri.",
            "Bir konsey sorusturmasinda ailesini kaybettikten sonra eski kayitlari takip etmeye basladi.",
            "Sarnic muhurlari ve eski glifler uzerinde calisan pratik bir saha uzmani.",
        ],
    },
    "en": {
        "names": ["Mira Vale", "Corin Ash", "Tessa Warden", "Riven Hale", "Alaric Stone"],
        "classes": ["Ward Analyst", "Relic Scout", "Council Informant", "Vault Guide", "Glyph Engineer"],
        "races": ["Human", "Elf", "Half-Orc", "Aether-Touched"],
        "traits": [("Brave", "brave"), ("Wise", "wise"), ("Cunning", "cunning"), ("Careful", "wise"), ("Direct", "aggressive")],
        "origins": [
            "Raised near old vault districts and trained to read hidden routes and sealed records.",
            "Became a field investigator after a council case exposed a network of stolen relics.",
            "Works with practical wardcraft and knows how to inspect magical security without triggering it.",
        ],
    },
}


GENERATOR_LOCATION_POOLS = {
    "tr": {
        "city": ["Kadikoy Tilsim Limani", "Uskudar Konsey Meydani", "Beyoglu Gece Hatti"],
        "dungeon": ["Yerebatan Arsivi", "Ayasofya Alt Dehlizi", "Kuzguncuk Muhur Odalari"],
        "wilderness": ["Belgrad Golu Korulugu", "Riva Sis Patikasi", "Polonezkoy Eski Cemberi"],
        "building": ["Kapalicarsi Golge Pazari", "Galata Gizli Rasathanesi", "Balat Emanet Hani"],
        "landmark": ["Galata Gozetleme Kulesi", "Kiz Kulesi Muhur Noktasi", "Sultanahmet Tas Cemberi"],
        "features": ["Gizli Gecit", "Muhurlu Kapi", "Eski Harita", "Nobetci Noktasi", "Tilsimli Oda", "Kayit Raflari"],
    },
    "en": {
        "city": ["Ember Quay", "Northgate Ward", "Crown Market"],
        "dungeon": ["The Sealed Cistern", "Old Vault Passage", "Moonwell Archive"],
        "wilderness": ["Mistline Grove", "Ravenfield Road", "The Old Circle"],
        "building": ["The Hidden Ledger House", "Vault Inspector's Office", "The Brass Lantern Inn"],
        "landmark": ["The Watcher's Tower", "The Broken Seal", "Council Waystone"],
        "features": ["Hidden Passage", "Sealed Door", "Old Map", "Guard Post", "Warded Room", "Record Shelves"],
    },
}


def _lookup(collection: Dict[str, Dict[str, Any]], name: str) -> Dict[str, Any]:
    normalized = (name or "").strip().lower()
    if normalized in collection:
        return deepcopy(collection[normalized])

    for key, value in collection.items():
        if normalized and (normalized in key or key in normalized):
            return deepcopy(value)

    first_item = next(iter(collection.values()))
    fallback = deepcopy(first_item)
    fallback["match_warning"] = f"No exact match for '{name}'. Returned default demo context."
    return fallback


def get_character_context(name: str) -> Dict[str, Any]:
    return _lookup(CHARACTERS, name)


def get_location_context(name: str) -> Dict[str, Any]:
    return _lookup(LOCATIONS, name)


def search_lore(query: str) -> List[Dict[str, str]]:
    normalized = (query or "").strip().lower()
    results: List[Dict[str, str]] = []

    for item in [*CHARACTERS.values(), *LOCATIONS.values()]:
        text = f"{item['name']} {item.get('lore', '')} {' '.join(item.get('features', []))}".lower()
        if not normalized or normalized in text:
            results.append({"name": item["name"], "lore": item.get("lore", "")})

    return results[:5]


_DICE = random.SystemRandom()
_TURKISH_TRANSLATION = str.maketrans(
    {
        "\u0131": "i",
        "\u0130": "I",
        "\u011f": "g",
        "\u011e": "G",
        "\u00fc": "u",
        "\u00dc": "U",
        "\u015f": "s",
        "\u015e": "S",
        "\u00f6": "o",
        "\u00d6": "O",
        "\u00e7": "c",
        "\u00c7": "C",
    }
)


def _lang(language: str) -> str:
    return "tr" if language == "tr" else "en"


def _normalize_text(value: str) -> str:
    translated = (value or "").translate(_TURKISH_TRANSLATION)
    normalized = unicodedata.normalize("NFKD", translated)
    return normalized.encode("ascii", "ignore").decode("ascii").lower()


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def _stat_modifier(stat_value: Any) -> int:
    score = _clamp(_safe_int(stat_value, 50), 0, 100)
    return _clamp((score - 50) // 10, -2, 6)


def _roll_d20() -> int:
    return _DICE.randint(1, 20)


def _combat_process(tool_name: str) -> List[str]:
    return [
        f"MCP client called {tool_name}.",
        "MCP server resolved RPG mechanics outside the LLM.",
        "MCP server returned structured dice/combat state for the frontend and AI history.",
    ]


def _roll_outcome(natural: int, total: int, dc: int, language: str) -> str:
    if natural == 20:
        return "critical_success"
    if natural == 1:
        return "critical_failure"
    return "success" if total >= dc else "failure"


def _roll_message(outcome: str, natural: int, total: int, dc: int, language: str) -> str:
    lang = _lang(language)
    if lang == "tr":
        labels = {
            "critical_success": "Kritik basari",
            "critical_failure": "Kritik basarisizlik",
            "success": "Basari",
            "failure": "Basarisizlik",
        }
        return f"{labels[outcome]}: d20={natural}, toplam={total}, hedef={dc}."

    labels = {
        "critical_success": "Critical success",
        "critical_failure": "Critical failure",
        "success": "Success",
        "failure": "Failure",
    }
    return f"{labels[outcome]}: d20={natural}, total={total}, DC={dc}."


def roll_d20_check(
    stat_name: str,
    stat_value: Any,
    difficulty_class: Any = 12,
    language: str = "en",
) -> Dict[str, Any]:
    dc = _clamp(_safe_int(difficulty_class, 12), 2, 30)
    natural = _roll_d20()
    modifier = _stat_modifier(stat_value)
    total = natural + modifier
    outcome = _roll_outcome(natural, total, dc, language)

    return {
        "tool_called": "roll_check",
        "input": {
            "stat_name": stat_name,
            "stat_value": _safe_int(stat_value, 50),
            "difficulty_class": dc,
            "language": language,
        },
        "result": {
            "stat_name": stat_name,
            "natural_roll": natural,
            "modifier": modifier,
            "total": total,
            "dc": dc,
            "outcome": outcome,
            "message": _roll_message(outcome, natural, total, dc, language),
        },
        "process": _combat_process("roll_check"),
        "used_by": "MuseAI dice and combat mechanics",
    }


def _select_action_stat(player_action: str) -> str:
    text = _normalize_text(player_action)
    stat_keywords = [
        ("intellect", ["buyu", "glif", "tilsim", "ward", "spell", "magic", "glyph", "analyze", "analiz", "incele", "coz"]),
        ("agility", ["kac", "saklan", "siyril", "zipla", "dodge", "dash", "hide", "sneak", "shoot", "ok at"]),
        ("charisma", ["ikna", "korkut", "konus", "pazarlik", "persuade", "intimidate", "talk", "bluff"]),
        ("strength", ["saldir", "vur", "kilic", "balta", "yumruk", "tekme", "attack", "strike", "hit", "slash"]),
    ]
    for stat_name, keywords in stat_keywords:
        if any(keyword in text for keyword in keywords):
            return stat_name
    return "strength"


def _enemy_template(enemy_kind: str, location_name: str, language: str) -> Dict[str, Any]:
    text = _normalize_text(f"{enemy_kind} {location_name}")
    lang = _lang(language)
    if "golem" in text or "glif" in text or "glyph" in text:
        return {
            "name": "Glif Golemi" if lang == "tr" else "Glyph Golem",
            "max_hp": 26,
            "armor_class": 14,
            "attack_bonus": 5,
            "damage_range": [4, 9],
        }
    if "haydut" in text or "bandit" in text or "pazar" in text or "market" in text:
        return {
            "name": "Sarnic Haydudu" if lang == "tr" else "Cistern Bandit",
            "max_hp": 16,
            "armor_class": 12,
            "attack_bonus": 4,
            "damage_range": [3, 7],
        }
    return {
        "name": "Muhurlu Muhafiz" if lang == "tr" else "Warded Guard",
        "max_hp": 18,
        "armor_class": 12,
        "attack_bonus": 3,
        "damage_range": [3, 6],
    }


def _ally_template(ally_kind: str, language: str) -> Dict[str, Any] | None:
    if not ally_kind or _normalize_text(ally_kind) in {"none", "yok", "no"}:
        return None
    lang = _lang(language)
    return {
        "id": "ally-1",
        "name": ally_kind if ally_kind.strip() else ("Baran Koroglu" if lang == "tr" else "Field Ally"),
        "max_hp": 16,
        "hp": 16,
        "armor_class": 11,
        "attack_bonus": 2,
        "status": "active",
    }


def _player_state(player_name: str, player_stats: Dict[str, Any]) -> Dict[str, Any]:
    strength = _safe_int(player_stats.get("strength"), 50)
    agility = _safe_int(player_stats.get("agility"), 50)
    level = _safe_int(player_stats.get("level"), 1)
    max_hp = _clamp(18 + (level // 2) + (strength // 4), 18, 70)
    return {
        "id": "player",
        "name": player_name or "Player",
        "max_hp": max_hp,
        "hp": max_hp,
        "armor_class": 10 + max(0, _stat_modifier(agility)),
        "status": "active",
    }


def start_combat_encounter(
    player_name: str,
    player_stats: Dict[str, Any] | None = None,
    enemy_kind: str = "guard",
    ally_kind: str = "",
    location_name: str = "",
    language: str = "en",
) -> Dict[str, Any]:
    stats = player_stats or {}
    lang = _lang(language)
    enemy_base = _enemy_template(enemy_kind, location_name, lang)
    enemy = {
        "id": "enemy-1",
        "name": enemy_base["name"],
        "max_hp": enemy_base["max_hp"],
        "hp": enemy_base["max_hp"],
        "armor_class": enemy_base["armor_class"],
        "attack_bonus": enemy_base["attack_bonus"],
        "damage_range": enemy_base["damage_range"],
        "status": "active",
    }
    ally = _ally_template(ally_kind, lang)
    initiative = roll_d20_check("agility", stats.get("agility", 50), 10, lang)["result"]
    combat_state = {
        "id": f"combat-{_DICE.randint(100000, 999999)}",
        "status": "active",
        "round": 1,
        "language": lang,
        "player": _player_state(player_name, stats),
        "enemies": [enemy],
        "allies": [ally] if ally else [],
        "log": [
            (
                f"Savas basladi. Inisiyatif: d20={initiative['natural_roll']} "
                f"+ {initiative['modifier']} = {initiative['total']}."
            )
            if lang == "tr"
            else (
                f"Combat started. Initiative: d20={initiative['natural_roll']} "
                f"+ {initiative['modifier']} = {initiative['total']}."
            )
        ],
        "last_round": None,
    }

    return {
        "tool_called": "start_combat",
        "input": {
            "player_name": player_name,
            "enemy_kind": enemy_kind,
            "ally_kind": ally_kind,
            "location_name": location_name,
            "language": language,
        },
        "result": {
            "combat_state": combat_state,
            "initiative": initiative,
            "summary": "Savas basladi; HP ve zar sonucu MCP tarafinda takip ediliyor."
            if lang == "tr"
            else "Combat started; HP and dice results are tracked by MCP.",
        },
        "process": _combat_process("start_combat"),
        "used_by": "MuseAI combat start flow",
    }


def _first_active_enemy(combat_state: Dict[str, Any]) -> Dict[str, Any] | None:
    for enemy in combat_state.get("enemies", []):
        if enemy.get("status") == "active" and _safe_int(enemy.get("hp"), 0) > 0:
            return enemy
    return None


def _active_ally(combat_state: Dict[str, Any]) -> Dict[str, Any] | None:
    for ally in combat_state.get("allies", []):
        if ally and ally.get("status") == "active" and _safe_int(ally.get("hp"), 0) > 0:
            return ally
    return None


def advance_combat_round(
    combat_state: Dict[str, Any],
    player_action: str,
    player_stats: Dict[str, Any] | None = None,
    language: str = "en",
) -> Dict[str, Any]:
    state = deepcopy(combat_state or {})
    stats = player_stats or {}
    lang = _lang(language or state.get("language", "en"))
    state["language"] = lang
    state.setdefault("log", [])

    if state.get("status") != "active":
        return {
            "tool_called": "advance_combat",
            "input": {"player_action": player_action, "language": language},
            "result": {
                "combat_state": state,
                "summary": "Savas zaten bitmis." if lang == "tr" else "Combat is already over.",
            },
            "process": _combat_process("advance_combat"),
            "used_by": "MuseAI combat round flow",
        }

    player = state.get("player", {})
    round_log: List[str] = []
    action_text = _normalize_text(player_action)

    if any(keyword in action_text for keyword in ["yardim", "dost", "muttefik", "backup", "ally"]) and not _active_ally(state):
        ally_name = "Baran Koroglu" if lang == "tr" else "Field Ally"
        ally = _ally_template(ally_name, lang)
        if ally:
            state.setdefault("allies", []).append(ally)
            round_log.append(
                f"{ally['name']} savasa destek icin katildi."
                if lang == "tr"
                else f"{ally['name']} joins the fight as support."
            )

    if any(keyword in action_text for keyword in ["takviye", "baska dusman", "yeni dusman", "reinforcement", "another enemy"]):
        active_enemy_count = len([enemy for enemy in state.get("enemies", []) if enemy.get("status") == "active"])
        if active_enemy_count < 3:
            enemy_base = _enemy_template("bandit", "", lang)
            enemy_id = f"enemy-{len(state.get('enemies', [])) + 1}"
            new_enemy = {
                "id": enemy_id,
                "name": enemy_base["name"],
                "max_hp": enemy_base["max_hp"],
                "hp": enemy_base["max_hp"],
                "armor_class": enemy_base["armor_class"],
                "attack_bonus": enemy_base["attack_bonus"],
                "damage_range": enemy_base["damage_range"],
                "status": "active",
            }
            state.setdefault("enemies", []).append(new_enemy)
            round_log.append(
                f"Yeni dusman savasa katildi: {new_enemy['name']}."
                if lang == "tr"
                else f"A new enemy joins the fight: {new_enemy['name']}."
            )

    enemy = _first_active_enemy(state)
    if not enemy:
        state["status"] = "ended"
        state["outcome"] = "victory"
        return {
            "tool_called": "advance_combat",
            "input": {"player_action": player_action, "language": language},
            "result": {
                "combat_state": state,
                "summary": "Aktif dusman kalmadi." if lang == "tr" else "No active enemies remain.",
            },
            "process": _combat_process("advance_combat"),
            "used_by": "MuseAI combat round flow",
        }

    stat_name = _select_action_stat(player_action)
    stat_value = stats.get(stat_name, 50)
    player_check = roll_d20_check(stat_name, stat_value, enemy.get("armor_class", 12), lang)["result"]
    player_damage = 0

    if player_check["outcome"] in {"success", "critical_success"}:
        base_damage = _DICE.randint(4, 8)
        player_damage = max(1, base_damage + max(0, player_check["modifier"]))
        if player_check["outcome"] == "critical_success":
            player_damage *= 2
        enemy["hp"] = max(0, _safe_int(enemy.get("hp"), 0) - player_damage)
        if enemy["hp"] <= 0:
            enemy["status"] = "defeated"
        round_log.append(
            f"{player.get('name', 'Oyuncu')} vurdu: {player_damage} hasar."
            if lang == "tr"
            else f"{player.get('name', 'Player')} hits for {player_damage} damage."
        )
    else:
        round_log.append(
            f"{player.get('name', 'Oyuncu')} isabet ettiremedi."
            if lang == "tr"
            else f"{player.get('name', 'Player')} misses."
        )

    ally_action = None
    ally = _active_ally(state)
    if ally and enemy.get("status") == "active":
        ally_roll = _roll_d20()
        ally_total = ally_roll + _safe_int(ally.get("attack_bonus"), 0)
        ally_damage = 0
        if ally_roll == 20 or (ally_roll != 1 and ally_total >= _safe_int(enemy.get("armor_class"), 12)):
            ally_damage = _DICE.randint(2, 5)
            enemy["hp"] = max(0, _safe_int(enemy.get("hp"), 0) - ally_damage)
            if enemy["hp"] <= 0:
                enemy["status"] = "defeated"
        ally_action = {
            "name": ally.get("name", "Ally"),
            "natural_roll": ally_roll,
            "total": ally_total,
            "damage": ally_damage,
        }
        round_log.append(
            f"{ally_action['name']} destek verdi: d20={ally_roll}, hasar={ally_damage}."
            if lang == "tr"
            else f"{ally_action['name']} supports: d20={ally_roll}, damage={ally_damage}."
        )

    enemy_action = None
    if enemy.get("status") == "active":
        enemy_roll = _roll_d20()
        enemy_total = enemy_roll + _safe_int(enemy.get("attack_bonus"), 0)
        enemy_damage = 0
        player_ac = _safe_int(player.get("armor_class"), 10)
        if enemy_roll == 20 or (enemy_roll != 1 and enemy_total >= player_ac):
            low, high = enemy.get("damage_range", [3, 6])
            enemy_damage = _DICE.randint(_safe_int(low, 3), _safe_int(high, 6))
            if enemy_roll == 20:
                enemy_damage *= 2
            player["hp"] = max(0, _safe_int(player.get("hp"), 0) - enemy_damage)
            if player["hp"] <= 0:
                player["status"] = "down"
                state["status"] = "ended"
                state["outcome"] = "defeat"
        enemy_action = {
            "name": enemy.get("name", "Enemy"),
            "natural_roll": enemy_roll,
            "total": enemy_total,
            "target_ac": player_ac,
            "damage": enemy_damage,
            "outcome": "hit" if enemy_damage else "miss",
        }
        round_log.append(
            f"{enemy_action['name']} karsilik verdi: d20={enemy_roll}, hasar={enemy_damage}."
            if lang == "tr"
            else f"{enemy_action['name']} retaliates: d20={enemy_roll}, damage={enemy_damage}."
        )

    if not _first_active_enemy(state) and state.get("status") == "active":
        state["status"] = "ended"
        state["outcome"] = "victory"
        round_log.append("Dusman etkisiz hale geldi." if lang == "tr" else "The enemy is defeated.")

    state["last_round"] = {
        "round": _safe_int(state.get("round"), 1),
        "player_action": player_action,
        "stat_used": stat_name,
        "player_check": player_check,
        "player_damage": player_damage,
        "ally_action": ally_action,
        "enemy_action": enemy_action,
        "log": round_log,
    }
    state["log"].extend(round_log)
    if state.get("status") == "active":
        state["round"] = _safe_int(state.get("round"), 1) + 1

    summary = " ".join(round_log)
    return {
        "tool_called": "advance_combat",
        "input": {
            "player_action": player_action,
            "stat_used": stat_name,
            "language": language,
        },
        "result": {
            "combat_state": state,
            "summary": summary,
        },
        "process": _combat_process("advance_combat"),
        "used_by": "MuseAI combat round flow",
    }


def end_combat_encounter(
    combat_state: Dict[str, Any],
    reason: str = "manual",
    language: str = "en",
) -> Dict[str, Any]:
    state = deepcopy(combat_state or {})
    lang = _lang(language or state.get("language", "en"))
    state["status"] = "ended"
    state["outcome"] = reason or "manual"
    state.setdefault("log", []).append(
        f"Savas bitirildi. Sebep: {reason}." if lang == "tr" else f"Combat ended. Reason: {reason}."
    )
    return {
        "tool_called": "end_combat",
        "input": {"reason": reason, "language": language},
        "result": {
            "combat_state": state,
            "summary": "Savas MCP tool'u ile bitirildi." if lang == "tr" else "Combat was ended by MCP tool.",
        },
        "process": _combat_process("end_combat"),
        "used_by": "MuseAI combat end flow",
    }


def generate_character_seed(
    genre: str = "fantasy",
    role_type: str = "NPC",
    theme: str = "balanced",
    language: str = "en",
) -> Dict[str, Any]:
    lang = "tr" if language == "tr" else "en"
    pool = GENERATOR_CHARACTER_POOLS[lang]
    rng = random.Random(f"{genre}|{role_type}|{theme}|{lang}|{random.random()}")
    name = rng.choice(pool["names"])
    char_class = rng.choice(pool["classes"])
    race = rng.choice(pool["races"])
    traits = [{"name": n, "type": t} for n, t in rng.sample(pool["traits"], k=3 if theme == "tragic" else 2)]
    is_magic = any(word in char_class.lower() for word in ["buyucu", "glif", "ward", "glyph"])
    stats = {
        "strength": rng.randint(25, 70),
        "intellect": rng.randint(72, 96) if is_magic else rng.randint(45, 82),
        "agility": rng.randint(38, 88),
        "charisma": rng.randint(35, 82),
    }
    origin = rng.choice(pool["origins"])
    if lang == "tr":
        backstory = (
            f"{origin} {name}, {char_class} olarak calisir ve kriz anlarinda hizli, net kararlar verir. "
            f"En guclu yani {traits[0]['name'].lower()} tavridir; en buyuk riski ise eski baglantilarinin onu takip etmesidir."
        )
    else:
        backstory = (
            f"{origin} {name} works as a {char_class} and makes clear decisions under pressure. "
            f"Their strongest trait is being {traits[0]['name'].lower()}, but old connections can still pull them into danger."
        )

    return {
        "tool_called": "generate_character_seed",
        "input": {"genre": genre, "role_type": role_type, "theme": theme, "language": language},
        "result": {
            "name": name,
            "charClass": char_class,
            "roleType": role_type,
            "race": race,
            "level": rng.randint(3, 35),
            "backstory": backstory,
            "traits": traits,
            "stats": stats,
            "image": "",
            "mcpGenerated": True,
        },
        "process": [
            "MCP client requested a character seed.",
            "MCP server selected language-aware character pools.",
            "MCP server assembled stats, traits, and a playable backstory.",
        ],
        "used_by": "AI Character Generator modal",
    }


def generate_location_seed(
    genre: str = "fantasy",
    location_type: str = "city",
    mood: str = "mysterious",
    language: str = "en",
) -> Dict[str, Any]:
    lang = "tr" if language == "tr" else "en"
    pool = GENERATOR_LOCATION_POOLS[lang]
    rng = random.Random(f"{genre}|{location_type}|{mood}|{lang}|{random.random()}")
    names = pool.get(location_type) or pool["city"]
    name = rng.choice(names)
    features = rng.sample(pool["features"], k=3)
    danger = rng.randint(7, 10) if mood == "dangerous" else rng.randint(5, 8) if mood == "eerie" else rng.randint(2, 6)
    icon_map = {"city": "", "dungeon": "", "wilderness": "", "building": "", "landmark": ""}
    if lang == "tr":
        mood_text = {
            "mysterious": "gizemli",
            "dangerous": "tehlikeli",
            "peaceful": "sakin",
            "eerie": "tekinsiz",
            "bustling": "hareketli",
        }.get(mood, "gizemli")
        description = (
            f"{name}, {mood_text} bir atmosfere sahip. Burada {features[0].lower()} ve "
            f"{features[1].lower()} dikkat ceker. Oyuncular icin net hedefler, sakli bilgiler "
            f"ve kontrollu risk sunan oynanabilir bir mekandir."
        )
        mood_description = f"{mood_text.capitalize()} ama takip edilebilir bir sahne hissi verir"
    else:
        description = (
            f"{name} has a {mood} atmosphere. {features[0]} and {features[1]} stand out immediately. "
            f"It is built for playable investigation, clear choices, and controlled risk."
        )
        mood_description = f"A {mood} but readable scene"

    return {
        "tool_called": "generate_location_seed",
        "input": {"genre": genre, "location_type": location_type, "mood": mood, "language": language},
        "result": {
            "name": name,
            "type": location_type,
            "description": description,
            "mood": mood,
            "moodDescription": mood_description,
            "icon": icon_map.get(location_type, "🏙️"),
            "features": features,
            "dangerLevel": danger,
            "mcpGenerated": True,
        },
        "process": [
            "MCP client requested a location seed.",
            "MCP server selected language-aware location pools.",
            "MCP server assembled description, features, mood, and danger level.",
        ],
        "used_by": "AI Location Generator modal",
    }


def build_encounter_context(
    character_name: str,
    location_name: str,
    story_premise: str = "",
) -> Dict[str, Any]:
    character = get_character_context(character_name)
    location = get_location_context(location_name)
    lore_hints = search_lore(f"{character['name']} {location['name']}")

    prompt_context = (
        f"MCP Context Provider returned project context for {character['name']} at {location['name']}.\n"
        f"Character: {character['name']} is a level {character['level']} {character['race']} "
        f"{character['class']} with traits {', '.join(character['traits'])} and stats {character['stats']}.\n"
        f"Location: {location['name']} is a {location['mood']} {location['type']} with danger level "
        f"{location['danger_level']} and features {', '.join(location['features'])}.\n"
        f"Lore link: {character.get('lore', '')} {location.get('lore', '')}\n"
        f"Story premise supplied by user: {story_premise or 'No additional premise supplied.'}"
    )

    return {
        "tool_called": "get_encounter_context",
        "input": {
            "character_name": character_name,
            "location_name": location_name,
            "story_premise": story_premise,
        },
        "result": {
            "character": character,
            "location": location,
            "lore_hints": lore_hints,
            "prompt_context": prompt_context,
        },
        "process": [
            "MCP client requested project context.",
            "MCP server resolved character context.",
            "MCP server resolved location context.",
            "MCP server returned structured context for the AI workflow.",
        ],
        "used_by": "LangGraph prepare_context node",
    }
