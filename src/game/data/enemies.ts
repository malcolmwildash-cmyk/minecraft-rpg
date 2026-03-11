import { Stats } from './classes';

export interface EnemyDef {
  id: string;
  name: string;
  color: number;
  stats: Stats;
  xpReward: number;
  goldReward: number;
  drops: { itemId: string; chance: number }[];
  abilities: string[];
  isBoss: boolean;
  area: string;
  description: string;
}

export const ENEMIES: Record<string, EnemyDef> = {
  // Forest/Plains enemies
  zombie: {
    id: 'zombie', name: 'Zombie', color: 0x567d46,
    stats: { hp: 20, attack: 8, defense: 4, spellPower: 0, speed: 3 },
    xpReward: 15, goldReward: 5,
    drops: [{ itemId: 'rotten_flesh', chance: 0.6 }],
    abilities: ['bite'], isBoss: false, area: 'forest',
    description: 'A shambling undead creature.',
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', color: 0xddddcc,
    stats: { hp: 18, attack: 10, defense: 3, spellPower: 0, speed: 6 },
    xpReward: 18, goldReward: 8,
    drops: [{ itemId: 'bone', chance: 0.5 }, { itemId: 'arrow_bundle', chance: 0.3 }],
    abilities: ['arrow_shot'], isBoss: false, area: 'forest',
    description: 'An archer from beyond the grave.',
  },
  spider: {
    id: 'spider', name: 'Spider', color: 0x342d2d,
    stats: { hp: 16, attack: 9, defense: 3, spellPower: 0, speed: 9 },
    xpReward: 14, goldReward: 4,
    drops: [{ itemId: 'string', chance: 0.5 }, { itemId: 'spider_eye', chance: 0.3 }],
    abilities: ['web_shot', 'poison_bite'], isBoss: false, area: 'forest',
    description: 'Fast and venomous.',
  },
  pillager: {
    id: 'pillager', name: 'Pillager', color: 0x6b6b6b,
    stats: { hp: 24, attack: 12, defense: 6, spellPower: 0, speed: 7 },
    xpReward: 25, goldReward: 15,
    drops: [{ itemId: 'crossbow', chance: 0.15 }, { itemId: 'emerald', chance: 0.3 }],
    abilities: ['crossbow_volley'], isBoss: false, area: 'forest',
    description: 'Armed raider of the Illager army.',
  },
  vindicator: {
    id: 'vindicator', name: 'Vindicator', color: 0x595959,
    stats: { hp: 30, attack: 15, defense: 8, spellPower: 0, speed: 8 },
    xpReward: 30, goldReward: 18,
    drops: [{ itemId: 'iron_axe', chance: 0.1 }, { itemId: 'emerald', chance: 0.4 }],
    abilities: ['axe_charge', 'frenzy'], isBoss: false, area: 'forest',
    description: 'Elite Illager with a deadly axe.',
  },
  forest_boss_evoker: {
    id: 'forest_boss_evoker', name: 'The Evoker King', color: 0x8b4513,
    stats: { hp: 120, attack: 14, defense: 10, spellPower: 18, speed: 10 },
    xpReward: 200, goldReward: 100,
    drops: [{ itemId: 'totem_of_undying', chance: 1.0 }, { itemId: 'evoker_robe', chance: 0.5 }],
    abilities: ['summon_vex', 'fang_attack', 'dark_shield'], isBoss: true, area: 'forest',
    description: 'Master of dark illager magic.',
  },

  // Desert Temple enemies
  husk: {
    id: 'husk', name: 'Husk', color: 0xc2b280,
    stats: { hp: 25, attack: 11, defense: 6, spellPower: 0, speed: 4 },
    xpReward: 20, goldReward: 8,
    drops: [{ itemId: 'sand_block', chance: 0.4 }],
    abilities: ['desiccate'], isBoss: false, area: 'desert',
    description: 'A dried-out zombie variant.',
  },
  stray: {
    id: 'stray', name: 'Stray', color: 0xaabbcc,
    stats: { hp: 20, attack: 12, defense: 4, spellPower: 5, speed: 7 },
    xpReward: 22, goldReward: 10,
    drops: [{ itemId: 'tipped_arrow', chance: 0.3 }],
    abilities: ['frost_arrow'], isBoss: false, area: 'desert',
    description: 'Skeleton with icy arrows.',
  },
  desert_boss_redstone_golem: {
    id: 'desert_boss_redstone_golem', name: 'Redstone Monstrosity', color: 0xcc3300,
    stats: { hp: 180, attack: 20, defense: 15, spellPower: 10, speed: 5 },
    xpReward: 350, goldReward: 150,
    drops: [{ itemId: 'redstone_core', chance: 1.0 }, { itemId: 'heavy_plate', chance: 0.4 }],
    abilities: ['ground_slam', 'redstone_mines', 'summon_cubes'], isBoss: true, area: 'desert',
    description: 'A massive construct of redstone and stone.',
  },

  // Swamp enemies
  witch: {
    id: 'witch', name: 'Witch', color: 0x4a0e4e,
    stats: { hp: 26, attack: 8, defense: 5, spellPower: 14, speed: 8 },
    xpReward: 28, goldReward: 20,
    drops: [{ itemId: 'potion_ingredients', chance: 0.5 }, { itemId: 'glowstone', chance: 0.2 }],
    abilities: ['poison_splash', 'heal_self'], isBoss: false, area: 'swamp',
    description: 'Potion-wielding forest dweller.',
  },
  slime: {
    id: 'slime', name: 'Slime', color: 0x77cc44,
    stats: { hp: 35, attack: 7, defense: 8, spellPower: 0, speed: 4 },
    xpReward: 18, goldReward: 6,
    drops: [{ itemId: 'slimeball', chance: 0.7 }],
    abilities: ['split', 'bounce'], isBoss: false, area: 'swamp',
    description: 'Bouncing blob that splits when hit.',
  },
  swamp_boss_corrupted_guardian: {
    id: 'swamp_boss_corrupted_guardian', name: 'Corrupted Guardian', color: 0x007777,
    stats: { hp: 200, attack: 18, defense: 18, spellPower: 15, speed: 6 },
    xpReward: 450, goldReward: 200,
    drops: [{ itemId: 'guardian_shard', chance: 1.0 }, { itemId: 'trident', chance: 0.3 }],
    abilities: ['laser_beam', 'tidal_surge', 'spine_shield'], isBoss: true, area: 'swamp',
    description: 'Ancient guardian corrupted by dark magic.',
  },

  // Mountain/Cave enemies
  creeper: {
    id: 'creeper', name: 'Creeper', color: 0x00cc00,
    stats: { hp: 20, attack: 25, defense: 2, spellPower: 0, speed: 6 },
    xpReward: 22, goldReward: 12,
    drops: [{ itemId: 'gunpowder', chance: 0.6 }],
    abilities: ['explode'], isBoss: false, area: 'mountains',
    description: 'Ssssssss... BOOM!',
  },
  cave_spider: {
    id: 'cave_spider', name: 'Cave Spider', color: 0x0a4a0a,
    stats: { hp: 14, attack: 10, defense: 3, spellPower: 0, speed: 12 },
    xpReward: 16, goldReward: 6,
    drops: [{ itemId: 'spider_eye', chance: 0.4 }, { itemId: 'string', chance: 0.5 }],
    abilities: ['venomous_bite'], isBoss: false, area: 'mountains',
    description: 'Smaller but far more venomous.',
  },
  mountain_boss_ravager: {
    id: 'mountain_boss_ravager', name: 'Ravager Alpha', color: 0x555555,
    stats: { hp: 250, attack: 22, defense: 14, spellPower: 0, speed: 9 },
    xpReward: 500, goldReward: 250,
    drops: [{ itemId: 'ravager_horn', chance: 1.0 }, { itemId: 'iron_plate', chance: 0.5 }],
    abilities: ['charge', 'stomp', 'roar'], isBoss: true, area: 'mountains',
    description: 'The largest and most ferocious ravager.',
  },

  // Nether enemies
  blaze: {
    id: 'blaze', name: 'Blaze', color: 0xff8800,
    stats: { hp: 22, attack: 14, defense: 4, spellPower: 16, speed: 10 },
    xpReward: 35, goldReward: 20,
    drops: [{ itemId: 'blaze_rod', chance: 0.5 }],
    abilities: ['fireball', 'fire_shield'], isBoss: false, area: 'nether',
    description: 'Floating inferno.',
  },
  ghast: {
    id: 'ghast', name: 'Ghast', color: 0xeeeeee,
    stats: { hp: 18, attack: 18, defense: 2, spellPower: 12, speed: 7 },
    xpReward: 30, goldReward: 15,
    drops: [{ itemId: 'ghast_tear', chance: 0.4 }],
    abilities: ['fireball_barrage'], isBoss: false, area: 'nether',
    description: 'A weeping giant of the Nether.',
  },
  piglin_brute: {
    id: 'piglin_brute', name: 'Piglin Brute', color: 0xd4a574,
    stats: { hp: 35, attack: 18, defense: 10, spellPower: 0, speed: 9 },
    xpReward: 38, goldReward: 30,
    drops: [{ itemId: 'gold_ingot', chance: 0.6 }, { itemId: 'netherite_scrap', chance: 0.05 }],
    abilities: ['golden_axe_cleave', 'rally_piglins'], isBoss: false, area: 'nether',
    description: 'The fiercest warriors of piglin society.',
  },
  wither_skeleton: {
    id: 'wither_skeleton', name: 'Wither Skeleton', color: 0x333333,
    stats: { hp: 30, attack: 16, defense: 8, spellPower: 8, speed: 8 },
    xpReward: 40, goldReward: 25,
    drops: [{ itemId: 'wither_skull', chance: 0.08 }, { itemId: 'coal', chance: 0.5 }],
    abilities: ['wither_strike'], isBoss: false, area: 'nether',
    description: 'Dark skeleton that inflicts withering.',
  },
  nether_boss_wither: {
    id: 'nether_boss_wither', name: 'The Wither', color: 0x111111,
    stats: { hp: 350, attack: 24, defense: 12, spellPower: 20, speed: 11 },
    xpReward: 750, goldReward: 400,
    drops: [{ itemId: 'nether_star', chance: 1.0 }, { itemId: 'wither_armor', chance: 0.3 }],
    abilities: ['wither_skulls', 'charge_attack', 'wither_aura', 'phase_two'], isBoss: true, area: 'nether',
    description: 'The three-headed harbinger of destruction.',
  },

  // Final Fortress
  arch_illager: {
    id: 'arch_illager', name: 'The Arch-Illager', color: 0x6600cc,
    stats: { hp: 500, attack: 28, defense: 18, spellPower: 30, speed: 14 },
    xpReward: 2000, goldReward: 1000,
    drops: [{ itemId: 'orb_of_dominance', chance: 1.0 }],
    abilities: ['dark_beam', 'summon_army', 'teleport_strike', 'orb_of_dominance_blast', 'phase_two_heart'],
    isBoss: true, area: 'fortress',
    description: 'The Arch-Illager, empowered beyond his original form by the Orb of Dominance.',
  },
};

export function getEnemiesForArea(area: string): EnemyDef[] {
  return Object.values(ENEMIES).filter(e => e.area === area && !e.isBoss);
}

export function getBossForArea(area: string): EnemyDef | undefined {
  return Object.values(ENEMIES).find(e => e.area === area && e.isBoss);
}

export function getScaledEnemy(def: EnemyDef, playerLevel: number): EnemyDef {
  const scale = 1 + (playerLevel - 1) * 0.12;
  return {
    ...def,
    stats: {
      hp: Math.floor(def.stats.hp * scale),
      attack: Math.floor(def.stats.attack * scale),
      defense: Math.floor(def.stats.defense * scale),
      spellPower: Math.floor(def.stats.spellPower * scale),
      speed: Math.floor(def.stats.speed * scale),
    },
    xpReward: Math.floor(def.xpReward * scale),
    goldReward: Math.floor(def.goldReward * scale),
  };
}
