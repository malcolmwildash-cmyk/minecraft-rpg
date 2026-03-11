export interface ClassDef {
  id: string;
  name: string;
  archetype: string;
  description: string;
  color: number;
  baseStats: Stats;
  growthRates: Stats;
  startingAbilities: string[];
  passiveDesc: string;
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spellPower: number;
  speed: number;
}

export const CLASSES: Record<string, ClassDef> = {
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    archetype: 'Barbarian',
    description: 'Iron Golem-inspired raw melee power. High HP, devastating hits.',
    color: 0x888888,
    baseStats: { hp: 45, attack: 14, defense: 10, spellPower: 3, speed: 8 },
    growthRates: { hp: 8, attack: 4, defense: 3, spellPower: 1, speed: 2 },
    startingAbilities: ['iron_fist', 'rage'],
    passiveDesc: 'Iron Constitution: +20% max HP',
  },
  minstrel: {
    id: 'minstrel',
    name: 'Noteblock Minstrel',
    archetype: 'Bard',
    description: 'Buff and debuff using noteblock magic. The ultimate support.',
    color: 0xffaa00,
    baseStats: { hp: 30, attack: 8, defense: 7, spellPower: 12, speed: 11 },
    growthRates: { hp: 5, attack: 2, defense: 2, spellPower: 4, speed: 3 },
    startingAbilities: ['inspire', 'discord'],
    passiveDesc: 'Harmony: Party members gain +2 to all stats in combat',
  },
  biome_shaper: {
    id: 'biome_shaper',
    name: 'Biome Shaper',
    archetype: 'Druid',
    description: 'Nature magic, animal summons, and terrain manipulation.',
    color: 0x228b22,
    baseStats: { hp: 35, attack: 9, defense: 9, spellPower: 13, speed: 9 },
    growthRates: { hp: 6, attack: 2, defense: 3, spellPower: 4, speed: 2 },
    startingAbilities: ['wolf_summon', 'entangle'],
    passiveDesc: 'Natural Attunement: Regenerate 5% HP each turn outdoors',
  },
  swordsman: {
    id: 'swordsman',
    name: 'Swordsman',
    archetype: 'Fighter',
    description: 'Classic balanced melee fighter with diamond gear affinity.',
    color: 0x55cdfc,
    baseStats: { hp: 38, attack: 13, defense: 11, spellPower: 5, speed: 10 },
    growthRates: { hp: 7, attack: 3, defense: 3, spellPower: 1, speed: 3 },
    startingAbilities: ['power_strike', 'parry'],
    passiveDesc: 'Diamond Edge: +15% weapon damage',
  },
  skeleton_hunter: {
    id: 'skeleton_hunter',
    name: 'Skeleton Hunter',
    archetype: 'Ranger',
    description: 'Bow specialist with tracking, traps, and ranged combat.',
    color: 0xc0c0c0,
    baseStats: { hp: 32, attack: 12, defense: 7, spellPower: 8, speed: 13 },
    growthRates: { hp: 5, attack: 3, defense: 2, spellPower: 2, speed: 4 },
    startingAbilities: ['aimed_shot', 'set_trap'],
    passiveDesc: 'Dead Eye: Ranged attacks never miss',
  },
  cave_stalker: {
    id: 'cave_stalker',
    name: 'Cave Stalker',
    archetype: 'Rogue',
    description: 'Stealth, critical hits, poison, and blazing speed.',
    color: 0x2f2f2f,
    baseStats: { hp: 28, attack: 11, defense: 6, spellPower: 7, speed: 15 },
    growthRates: { hp: 4, attack: 3, defense: 2, spellPower: 2, speed: 5 },
    startingAbilities: ['backstab', 'smoke_bomb'],
    passiveDesc: 'Shadow Strike: 25% chance to deal double damage',
  },
  ender_mage: {
    id: 'ender_mage',
    name: 'Ender Mage',
    archetype: 'Sorcerer',
    description: 'Raw End magic, high spell power, teleportation abilities.',
    color: 0x8b00ff,
    baseStats: { hp: 25, attack: 6, defense: 5, spellPower: 16, speed: 12 },
    growthRates: { hp: 4, attack: 1, defense: 2, spellPower: 5, speed: 3 },
    startingAbilities: ['ender_bolt', 'phase_shift'],
    passiveDesc: 'Void Channel: Spells cost 20% less spell power',
  },
  wither_pact: {
    id: 'wither_pact',
    name: 'Wither Pact',
    archetype: 'Warlock',
    description: 'Dark Nether magic. High risk, high reward, life drain.',
    color: 0x1a1a2e,
    baseStats: { hp: 30, attack: 8, defense: 6, spellPower: 15, speed: 11 },
    growthRates: { hp: 5, attack: 2, defense: 2, spellPower: 5, speed: 3 },
    startingAbilities: ['soul_drain', 'wither_curse'],
    passiveDesc: 'Dark Pact: Attacks heal for 15% of damage dealt',
  },
  enchanter: {
    id: 'enchanter',
    name: 'Enchanter',
    archetype: 'Wizard',
    description: 'Learned spells, enchanting mastery, largest spellbook.',
    color: 0x0066cc,
    baseStats: { hp: 27, attack: 5, defense: 6, spellPower: 14, speed: 10 },
    growthRates: { hp: 4, attack: 1, defense: 2, spellPower: 5, speed: 3 },
    startingAbilities: ['arcane_missile', 'shield_enchant'],
    passiveDesc: 'Arcane Mastery: Learn spells 1 level earlier, enchanting costs halved',
  },
};

export const CLASS_LIST = Object.values(CLASSES);

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function applyGrowth(base: Stats, growth: Stats, levels: number): Stats {
  return {
    hp: base.hp + growth.hp * levels,
    attack: base.attack + growth.attack * levels,
    defense: base.defense + growth.defense * levels,
    spellPower: base.spellPower + growth.spellPower * levels,
    speed: base.speed + growth.speed * levels,
  };
}
