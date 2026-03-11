export interface FactionDef {
  id: string;
  name: string;
  description: string;
  color: number;
  playstyle: string;
  uniqueSpells: string[];
  uniqueWeapon: string;
  storyInfluence: string;
  availableEndings: string[];
}

export const FACTIONS: Record<string, FactionDef> = {
  villagers: {
    id: 'villagers',
    name: 'Villagers & Iron Golems',
    description: 'Defenders of the innocent. Protection magic and heavy weapons.',
    color: 0xc4a882,
    playstyle: 'Defensive — shield allies, absorb damage, fortify positions',
    uniqueSpells: ['iron_wall', 'guardian_spirit', 'village_blessing'],
    uniqueWeapon: 'Golem Hammer',
    storyInfluence: 'The protector path. Save every village, sacrifice for others.',
    availableEndings: ['hero', 'sacrifice', 'peace'],
  },
  redstone: {
    id: 'redstone',
    name: 'Redstone Engineers',
    description: 'Tech-based abilities, traps, and explosive gadgets.',
    color: 0xff0000,
    playstyle: 'Control — traps, gadgets, area denial, mechanical advantage',
    uniqueSpells: ['tnt_charge', 'redstone_golem', 'piston_push'],
    uniqueWeapon: 'Repeater Crossbow',
    storyInfluence: 'The pragmatist path. Build solutions, outsmart enemies.',
    availableEndings: ['hero', 'engineer', 'peace'],
  },
  ender_watchers: {
    id: 'ender_watchers',
    name: 'Ender Watchers',
    description: 'End-dimension magic. Teleportation and mysterious powers.',
    color: 0x9b30ff,
    playstyle: 'Mobility — teleport, phase through attacks, spatial manipulation',
    uniqueSpells: ['ender_pearl_barrage', 'void_walk', 'chorus_bloom'],
    uniqueWeapon: 'End Rod Staff',
    storyInfluence: 'The seeker path. Uncover ancient truths about the Arch-Illager.',
    availableEndings: ['hero', 'transcendence', 'dark_truth'],
  },
  nether_legion: {
    id: 'nether_legion',
    name: 'Nether Legion',
    description: 'Fire magic and chaos. Morally gray but powerful.',
    color: 0xff4400,
    playstyle: 'Aggression — fire damage, chaos effects, overwhelming force',
    uniqueSpells: ['blaze_storm', 'soul_fire', 'wither_rain'],
    uniqueWeapon: 'Netherite Scythe',
    storyInfluence: 'The power path. Fight fire with fire, risk becoming what you oppose.',
    availableEndings: ['hero', 'dark_ruler', 'dark_truth'],
  },
};

export const FACTION_LIST = Object.values(FACTIONS);
