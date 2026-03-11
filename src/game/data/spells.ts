export interface SpellDef {
  id: string;
  name: string;
  description: string;
  spCost: number;
  damage?: number;
  healing?: number;
  effect?: string;
  target: 'enemy' | 'self' | 'all_enemies' | 'party';
  source: 'class' | 'faction';
  sourceId: string;
  levelReq: number;
}

export const SPELLS: Record<string, SpellDef> = {
  // Berserker
  iron_fist: { id: 'iron_fist', name: 'Iron Fist', description: 'A devastating punch dealing 1.5x attack.', spCost: 8, damage: 1.5, target: 'enemy', source: 'class', sourceId: 'berserker', levelReq: 1 },
  rage: { id: 'rage', name: 'Rage', description: 'Boost attack by 50% for 3 turns, reduce defense by 25%.', spCost: 12, effect: 'rage_3', target: 'self', source: 'class', sourceId: 'berserker', levelReq: 1 },
  ground_pound: { id: 'ground_pound', name: 'Ground Pound', description: 'AoE slam dealing 1x attack to all.', spCost: 18, damage: 1.0, target: 'all_enemies', source: 'class', sourceId: 'berserker', levelReq: 5 },
  iron_skin: { id: 'iron_skin', name: 'Iron Skin', description: 'Double defense for 2 turns.', spCost: 15, effect: 'defense_up_2', target: 'self', source: 'class', sourceId: 'berserker', levelReq: 8 },

  // Noteblock Minstrel
  inspire: { id: 'inspire', name: 'Inspire', description: 'Boost own attack by 30% for 3 turns.', spCost: 10, effect: 'attack_up_3', target: 'self', source: 'class', sourceId: 'minstrel', levelReq: 1 },
  discord: { id: 'discord', name: 'Discord', description: 'Reduce enemy attack by 30% for 2 turns.', spCost: 12, effect: 'attack_down_2', target: 'enemy', source: 'class', sourceId: 'minstrel', levelReq: 1 },
  healing_melody: { id: 'healing_melody', name: 'Healing Melody', description: 'Restore 40% max HP.', spCost: 15, healing: 0.4, target: 'self', source: 'class', sourceId: 'minstrel', levelReq: 4 },
  lullaby: { id: 'lullaby', name: 'Lullaby', description: 'Stun enemy for 1 turn.', spCost: 20, effect: 'stun_1', target: 'enemy', source: 'class', sourceId: 'minstrel', levelReq: 7 },

  // Biome Shaper
  wolf_summon: { id: 'wolf_summon', name: 'Summon Wolf', description: 'Summon a wolf that attacks for 12 damage per turn.', spCost: 14, effect: 'summon_wolf', target: 'self', source: 'class', sourceId: 'biome_shaper', levelReq: 1 },
  entangle: { id: 'entangle', name: 'Entangle', description: 'Root enemy, reducing speed to 0 for 2 turns.', spCost: 10, effect: 'root_2', target: 'enemy', source: 'class', sourceId: 'biome_shaper', levelReq: 1 },
  thorns: { id: 'thorns', name: 'Thorns', description: 'Enemy takes 30% of their attack damage back.', spCost: 12, effect: 'thorns_3', target: 'self', source: 'class', sourceId: 'biome_shaper', levelReq: 4 },
  bee_swarm: { id: 'bee_swarm', name: 'Bee Swarm', description: 'Poison all enemies for 8 damage per turn, 3 turns.', spCost: 18, effect: 'poison_all_3', target: 'all_enemies', source: 'class', sourceId: 'biome_shaper', levelReq: 7 },

  // Swordsman
  power_strike: { id: 'power_strike', name: 'Power Strike', description: 'Deal 1.8x attack damage.', spCost: 10, damage: 1.8, target: 'enemy', source: 'class', sourceId: 'swordsman', levelReq: 1 },
  parry: { id: 'parry', name: 'Parry', description: 'Block the next attack and counter for 50% damage.', spCost: 8, effect: 'parry_1', target: 'self', source: 'class', sourceId: 'swordsman', levelReq: 1 },
  whirlwind: { id: 'whirlwind', name: 'Whirlwind', description: 'Hit all enemies for 1.2x attack.', spCost: 16, damage: 1.2, target: 'all_enemies', source: 'class', sourceId: 'swordsman', levelReq: 5 },
  diamond_resolve: { id: 'diamond_resolve', name: 'Diamond Resolve', description: 'Restore 25% HP and boost defense 30% for 3 turns.', spCost: 18, healing: 0.25, effect: 'defense_up_3', target: 'self', source: 'class', sourceId: 'swordsman', levelReq: 8 },

  // Skeleton Hunter
  aimed_shot: { id: 'aimed_shot', name: 'Aimed Shot', description: 'Deal 2x attack with guaranteed hit.', spCost: 10, damage: 2.0, target: 'enemy', source: 'class', sourceId: 'skeleton_hunter', levelReq: 1 },
  set_trap: { id: 'set_trap', name: 'Set Trap', description: 'Place a trap dealing 25 damage to the next attacker.', spCost: 8, effect: 'trap_25', target: 'self', source: 'class', sourceId: 'skeleton_hunter', levelReq: 1 },
  multi_shot: { id: 'multi_shot', name: 'Multi-Shot', description: 'Hit all enemies for 0.8x attack.', spCost: 14, damage: 0.8, target: 'all_enemies', source: 'class', sourceId: 'skeleton_hunter', levelReq: 5 },
  mark_prey: { id: 'mark_prey', name: 'Mark Prey', description: 'Enemy takes 50% more damage for 3 turns.', spCost: 12, effect: 'vulnerable_3', target: 'enemy', source: 'class', sourceId: 'skeleton_hunter', levelReq: 7 },

  // Cave Stalker
  backstab: { id: 'backstab', name: 'Backstab', description: 'Deal 2.5x attack if you act first this turn.', spCost: 12, damage: 2.5, effect: 'requires_first', target: 'enemy', source: 'class', sourceId: 'cave_stalker', levelReq: 1 },
  smoke_bomb: { id: 'smoke_bomb', name: 'Smoke Bomb', description: 'Dodge all attacks next turn.', spCost: 10, effect: 'dodge_1', target: 'self', source: 'class', sourceId: 'cave_stalker', levelReq: 1 },
  poison_blade: { id: 'poison_blade', name: 'Poison Blade', description: 'Attack + poison for 10 damage/turn, 3 turns.', spCost: 14, damage: 1.0, effect: 'poison_3', target: 'enemy', source: 'class', sourceId: 'cave_stalker', levelReq: 4 },
  shadow_step: { id: 'shadow_step', name: 'Shadow Step', description: 'Teleport behind and strike for 2x, ignore defense.', spCost: 18, damage: 2.0, effect: 'ignore_defense', target: 'enemy', source: 'class', sourceId: 'cave_stalker', levelReq: 8 },

  // Ender Mage
  ender_bolt: { id: 'ender_bolt', name: 'Ender Bolt', description: 'Deal 1.5x spell power damage.', spCost: 8, damage: 1.5, target: 'enemy', source: 'class', sourceId: 'ender_mage', levelReq: 1 },
  phase_shift: { id: 'phase_shift', name: 'Phase Shift', description: 'Become ethereal, dodging next attack.', spCost: 10, effect: 'dodge_1', target: 'self', source: 'class', sourceId: 'ender_mage', levelReq: 1 },
  void_rupture: { id: 'void_rupture', name: 'Void Rupture', description: 'AoE dealing 1.3x spell power to all.', spCost: 20, damage: 1.3, target: 'all_enemies', source: 'class', sourceId: 'ender_mage', levelReq: 5 },
  teleport_strike: { id: 'teleport_strike', name: 'Teleport Strike', description: 'Warp to enemy and deal 2x spell power, ignore defense.', spCost: 22, damage: 2.0, effect: 'ignore_defense', target: 'enemy', source: 'class', sourceId: 'ender_mage', levelReq: 8 },

  // Wither Pact
  soul_drain: { id: 'soul_drain', name: 'Soul Drain', description: 'Deal 1.2x spell power and heal for 50% of damage.', spCost: 10, damage: 1.2, effect: 'lifesteal_50', target: 'enemy', source: 'class', sourceId: 'wither_pact', levelReq: 1 },
  wither_curse: { id: 'wither_curse', name: 'Wither Curse', description: 'Enemy loses 8% max HP per turn for 3 turns.', spCost: 12, effect: 'wither_3', target: 'enemy', source: 'class', sourceId: 'wither_pact', levelReq: 1 },
  dark_sacrifice: { id: 'dark_sacrifice', name: 'Dark Sacrifice', description: 'Spend 20% HP to deal 3x spell power.', spCost: 5, damage: 3.0, effect: 'self_damage_20pct', target: 'enemy', source: 'class', sourceId: 'wither_pact', levelReq: 5 },
  nether_gate: { id: 'nether_gate', name: 'Nether Gate', description: 'Summon nether fire dealing 2x spell power to all.', spCost: 25, damage: 2.0, target: 'all_enemies', source: 'class', sourceId: 'wither_pact', levelReq: 8 },

  // Enchanter
  arcane_missile: { id: 'arcane_missile', name: 'Arcane Missile', description: 'Deal 1.4x spell power, always hits.', spCost: 8, damage: 1.4, target: 'enemy', source: 'class', sourceId: 'enchanter', levelReq: 1 },
  shield_enchant: { id: 'shield_enchant', name: 'Shield Enchant', description: 'Boost defense by 50% for 3 turns.', spCost: 10, effect: 'defense_up_3', target: 'self', source: 'class', sourceId: 'enchanter', levelReq: 1 },
  chain_lightning: { id: 'chain_lightning', name: 'Chain Lightning', description: 'Deal 1.0x spell power to all enemies, +0.3x per enemy.', spCost: 18, damage: 1.0, effect: 'chain', target: 'all_enemies', source: 'class', sourceId: 'enchanter', levelReq: 5 },
  enchant_weapon: { id: 'enchant_weapon', name: 'Enchant Weapon', description: 'Add spell power to attack stat for 4 turns.', spCost: 15, effect: 'enchant_weapon_4', target: 'self', source: 'class', sourceId: 'enchanter', levelReq: 7 },

  // Faction: Villagers
  iron_wall: { id: 'iron_wall', name: 'Iron Wall', description: 'Reduce all damage by 60% for 2 turns.', spCost: 15, effect: 'damage_reduction_60_2', target: 'self', source: 'faction', sourceId: 'villagers', levelReq: 3 },
  guardian_spirit: { id: 'guardian_spirit', name: 'Guardian Spirit', description: 'Summon an iron golem that absorbs 1 hit.', spCost: 20, effect: 'summon_golem', target: 'self', source: 'faction', sourceId: 'villagers', levelReq: 6 },
  village_blessing: { id: 'village_blessing', name: 'Village Blessing', description: 'Restore 60% HP and cure status effects.', spCost: 25, healing: 0.6, effect: 'cure_all', target: 'self', source: 'faction', sourceId: 'villagers', levelReq: 9 },

  // Faction: Redstone
  tnt_charge: { id: 'tnt_charge', name: 'TNT Charge', description: 'Place TNT that detonates next turn for 2x spell power.', spCost: 14, effect: 'delayed_2x', target: 'enemy', source: 'faction', sourceId: 'redstone', levelReq: 3 },
  redstone_golem: { id: 'redstone_golem', name: 'Redstone Golem', description: 'Build a golem that attacks for 15 damage/turn.', spCost: 22, effect: 'summon_redstone_golem', target: 'self', source: 'faction', sourceId: 'redstone', levelReq: 6 },
  piston_push: { id: 'piston_push', name: 'Piston Push', description: 'Knock enemy back, stunning for 1 turn and dealing 1x attack.', spCost: 12, damage: 1.0, effect: 'stun_1', target: 'enemy', source: 'faction', sourceId: 'redstone', levelReq: 9 },

  // Faction: Ender Watchers
  ender_pearl_barrage: { id: 'ender_pearl_barrage', name: 'Ender Pearl Barrage', description: 'Throw 3 ender pearls for 0.8x spell power each.', spCost: 16, damage: 2.4, target: 'enemy', source: 'faction', sourceId: 'ender_watchers', levelReq: 3 },
  void_walk: { id: 'void_walk', name: 'Void Walk', description: 'Phase out of reality, immune for 1 turn and boost speed.', spCost: 18, effect: 'immune_1_speed_up', target: 'self', source: 'faction', sourceId: 'ender_watchers', levelReq: 6 },
  chorus_bloom: { id: 'chorus_bloom', name: 'Chorus Bloom', description: 'Chaotic teleport strike on all enemies for 1.5x spell power.', spCost: 24, damage: 1.5, target: 'all_enemies', source: 'faction', sourceId: 'ender_watchers', levelReq: 9 },

  // Faction: Nether Legion
  blaze_storm: { id: 'blaze_storm', name: 'Blaze Storm', description: 'Rain fire on all enemies for 1.3x spell power + burn.', spCost: 16, damage: 1.3, effect: 'burn_3', target: 'all_enemies', source: 'faction', sourceId: 'nether_legion', levelReq: 3 },
  soul_fire: { id: 'soul_fire', name: 'Soul Fire', description: 'Blue flame dealing 2x spell power, ignores 50% defense.', spCost: 20, damage: 2.0, effect: 'ignore_half_defense', target: 'enemy', source: 'faction', sourceId: 'nether_legion', levelReq: 6 },
  wither_rain: { id: 'wither_rain', name: 'Wither Rain', description: 'Wither skulls rain on all for 1.8x spell power.', spCost: 28, damage: 1.8, target: 'all_enemies', source: 'faction', sourceId: 'nether_legion', levelReq: 9 },
};

export function getSpellsForClass(classId: string, level: number): SpellDef[] {
  return Object.values(SPELLS).filter(s => s.source === 'class' && s.sourceId === classId && s.levelReq <= level);
}

export function getSpellsForFaction(factionId: string, level: number): SpellDef[] {
  return Object.values(SPELLS).filter(s => s.source === 'faction' && s.sourceId === factionId && s.levelReq <= level);
}
