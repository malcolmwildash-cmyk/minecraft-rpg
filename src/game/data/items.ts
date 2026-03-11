export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'spell_component' | 'key';
export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export interface ItemDef {
  id: string;
  name: string;
  type: ItemType;
  equipSlot?: EquipSlot;
  description: string;
  stats?: Partial<{ attack: number; defense: number; spellPower: number; speed: number; hp: number }>;
  healAmount?: number;
  spellRestore?: number;
  effect?: string;
  buyPrice: number;
  sellPrice: number;
  classReq?: string;
  levelReq?: number;
}

export const ITEMS: Record<string, ItemDef> = {
  // Starting Weapons
  wooden_sword: {
    id: 'wooden_sword', name: 'Wooden Sword', type: 'weapon', equipSlot: 'weapon',
    description: 'A simple wooden blade.', stats: { attack: 3 },
    buyPrice: 10, sellPrice: 5,
  },
  stone_sword: {
    id: 'stone_sword', name: 'Stone Sword', type: 'weapon', equipSlot: 'weapon',
    description: 'Sturdy cobblestone blade.', stats: { attack: 6 },
    buyPrice: 30, sellPrice: 15,
  },
  iron_sword: {
    id: 'iron_sword', name: 'Iron Sword', type: 'weapon', equipSlot: 'weapon',
    description: 'Reliable iron blade.', stats: { attack: 10 },
    buyPrice: 80, sellPrice: 40,
  },
  diamond_sword: {
    id: 'diamond_sword', name: 'Diamond Sword', type: 'weapon', equipSlot: 'weapon',
    description: 'Gleaming diamond-edged blade.', stats: { attack: 16 },
    buyPrice: 250, sellPrice: 125, levelReq: 5,
  },
  netherite_sword: {
    id: 'netherite_sword', name: 'Netherite Sword', type: 'weapon', equipSlot: 'weapon',
    description: 'Forged from ancient debris.', stats: { attack: 22 },
    buyPrice: 600, sellPrice: 300, levelReq: 10,
  },
  wooden_bow: {
    id: 'wooden_bow', name: 'Wooden Bow', type: 'weapon', equipSlot: 'weapon',
    description: 'A basic bow.', stats: { attack: 4 },
    buyPrice: 15, sellPrice: 7,
  },
  crossbow: {
    id: 'crossbow', name: 'Crossbow', type: 'weapon', equipSlot: 'weapon',
    description: 'Powerful ranged weapon.', stats: { attack: 12 },
    buyPrice: 100, sellPrice: 50, levelReq: 3,
  },
  iron_axe: {
    id: 'iron_axe', name: 'Iron Axe', type: 'weapon', equipSlot: 'weapon',
    description: 'Heavy iron axe.', stats: { attack: 12, speed: -2 },
    buyPrice: 90, sellPrice: 45,
  },
  enchanted_staff: {
    id: 'enchanted_staff', name: 'Enchanted Staff', type: 'weapon', equipSlot: 'weapon',
    description: 'Channels magical energy.', stats: { attack: 4, spellPower: 10 },
    buyPrice: 120, sellPrice: 60, levelReq: 3,
  },
  end_rod_staff: {
    id: 'end_rod_staff', name: 'End Rod Staff', type: 'weapon', equipSlot: 'weapon',
    description: 'Hums with End energy.', stats: { attack: 6, spellPower: 18 },
    buyPrice: 400, sellPrice: 200, levelReq: 8,
  },

  // Armor
  leather_armor: {
    id: 'leather_armor', name: 'Leather Armor', type: 'armor', equipSlot: 'armor',
    description: 'Basic leather protection.', stats: { defense: 3 },
    buyPrice: 20, sellPrice: 10,
  },
  chainmail: {
    id: 'chainmail', name: 'Chainmail', type: 'armor', equipSlot: 'armor',
    description: 'Interlocking metal rings.', stats: { defense: 6 },
    buyPrice: 60, sellPrice: 30,
  },
  iron_armor: {
    id: 'iron_armor', name: 'Iron Armor', type: 'armor', equipSlot: 'armor',
    description: 'Solid iron plates.', stats: { defense: 10 },
    buyPrice: 120, sellPrice: 60,
  },
  diamond_armor: {
    id: 'diamond_armor', name: 'Diamond Armor', type: 'armor', equipSlot: 'armor',
    description: 'Brilliant diamond plating.', stats: { defense: 16 },
    buyPrice: 350, sellPrice: 175, levelReq: 5,
  },
  heavy_plate: {
    id: 'heavy_plate', name: 'Heavy Plate Armor', type: 'armor', equipSlot: 'armor',
    description: 'Extremely heavy but protective.', stats: { defense: 20, speed: -3 },
    buyPrice: 500, sellPrice: 250, levelReq: 8,
  },
  evoker_robe: {
    id: 'evoker_robe', name: 'Evoker Robe', type: 'armor', equipSlot: 'armor',
    description: 'Dark magical robes.', stats: { defense: 5, spellPower: 8 },
    buyPrice: 200, sellPrice: 100, levelReq: 4,
  },
  wither_armor: {
    id: 'wither_armor', name: 'Wither Armor', type: 'armor', equipSlot: 'armor',
    description: 'Forged from wither bones.', stats: { defense: 18, spellPower: 5 },
    buyPrice: 700, sellPrice: 350, levelReq: 12,
  },

  // Accessories
  speed_boots: {
    id: 'speed_boots', name: 'Swift Boots', type: 'accessory', equipSlot: 'accessory',
    description: 'Enchanted for speed.', stats: { speed: 5 },
    buyPrice: 80, sellPrice: 40,
  },
  shield_totem: {
    id: 'shield_totem', name: 'Shield Totem', type: 'accessory', equipSlot: 'accessory',
    description: 'Passive damage reduction.', stats: { defense: 5 },
    buyPrice: 100, sellPrice: 50,
  },
  totem_of_undying: {
    id: 'totem_of_undying', name: 'Totem of Undying', type: 'accessory', equipSlot: 'accessory',
    description: 'Revive once per battle with 25% HP.', stats: { hp: 10 },
    buyPrice: 500, sellPrice: 250,
  },

  // Consumables
  bread: {
    id: 'bread', name: 'Bread', type: 'consumable',
    description: 'Restores 20 HP.', healAmount: 20,
    buyPrice: 10, sellPrice: 5,
  },
  steak: {
    id: 'steak', name: 'Steak', type: 'consumable',
    description: 'Restores 50 HP.', healAmount: 50,
    buyPrice: 30, sellPrice: 15,
  },
  golden_apple: {
    id: 'golden_apple', name: 'Golden Apple', type: 'consumable',
    description: 'Restores 100 HP and boosts defense for 3 turns.', healAmount: 100, effect: 'defense_up_3',
    buyPrice: 100, sellPrice: 50,
  },
  healing_potion: {
    id: 'healing_potion', name: 'Healing Potion', type: 'consumable',
    description: 'Restores 80 HP instantly.', healAmount: 80,
    buyPrice: 40, sellPrice: 20,
  },
  mana_potion: {
    id: 'mana_potion', name: 'Mana Potion', type: 'consumable',
    description: 'Restores 30 Spell Power.', spellRestore: 30,
    buyPrice: 50, sellPrice: 25,
  },
  ender_pearl: {
    id: 'ender_pearl', name: 'Ender Pearl', type: 'consumable',
    description: 'Escape combat instantly.', effect: 'escape',
    buyPrice: 60, sellPrice: 30,
  },
  splash_potion_damage: {
    id: 'splash_potion_damage', name: 'Splash Potion of Harming', type: 'consumable',
    description: 'Deals 30 damage to an enemy.', effect: 'damage_30',
    buyPrice: 45, sellPrice: 22,
  },

  // Materials
  rotten_flesh: { id: 'rotten_flesh', name: 'Rotten Flesh', type: 'material', description: 'Zombie remains.', buyPrice: 2, sellPrice: 1 },
  bone: { id: 'bone', name: 'Bone', type: 'material', description: 'Skeleton bone.', buyPrice: 3, sellPrice: 1 },
  string: { id: 'string', name: 'String', type: 'material', description: 'Spider silk.', buyPrice: 3, sellPrice: 1 },
  spider_eye: { id: 'spider_eye', name: 'Spider Eye', type: 'material', description: 'Venomous ingredient.', buyPrice: 5, sellPrice: 2 },
  gunpowder: { id: 'gunpowder', name: 'Gunpowder', type: 'material', description: 'Explosive powder.', buyPrice: 8, sellPrice: 4 },
  emerald: { id: 'emerald', name: 'Emerald', type: 'material', description: 'Villager currency.', buyPrice: 20, sellPrice: 10 },
  lapis_lazuli: { id: 'lapis_lazuli', name: 'Lapis Lazuli', type: 'material', description: 'Required for enchanting.', buyPrice: 15, sellPrice: 7 },
  iron_ingot: { id: 'iron_ingot', name: 'Iron Ingot', type: 'material', description: 'Refined iron.', buyPrice: 12, sellPrice: 6 },
  gold_ingot: { id: 'gold_ingot', name: 'Gold Ingot', type: 'material', description: 'Refined gold.', buyPrice: 18, sellPrice: 9 },
  diamond: { id: 'diamond', name: 'Diamond', type: 'material', description: 'Precious gem.', buyPrice: 50, sellPrice: 25 },
  blaze_rod: { id: 'blaze_rod', name: 'Blaze Rod', type: 'material', description: 'Nether fuel.', buyPrice: 20, sellPrice: 10 },
  ghast_tear: { id: 'ghast_tear', name: 'Ghast Tear', type: 'material', description: 'Alchemical ingredient.', buyPrice: 30, sellPrice: 15 },
  netherite_scrap: { id: 'netherite_scrap', name: 'Netherite Scrap', type: 'material', description: 'Ancient debris fragment.', buyPrice: 80, sellPrice: 40 },
  nether_star: { id: 'nether_star', name: 'Nether Star', type: 'material', description: 'The essence of a Wither.', buyPrice: 500, sellPrice: 250 },
  redstone_core: { id: 'redstone_core', name: 'Redstone Core', type: 'material', description: 'Heart of a redstone golem.', buyPrice: 100, sellPrice: 50 },
  guardian_shard: { id: 'guardian_shard', name: 'Guardian Shard', type: 'material', description: 'Prismarine fragment.', buyPrice: 80, sellPrice: 40 },
  ravager_horn: { id: 'ravager_horn', name: 'Ravager Horn', type: 'material', description: 'Trophy from a ravager.', buyPrice: 120, sellPrice: 60 },
  wither_skull: { id: 'wither_skull', name: 'Wither Skull', type: 'material', description: 'Dark trophy.', buyPrice: 200, sellPrice: 100 },
  coal: { id: 'coal', name: 'Coal', type: 'material', description: 'Fuel and smelting.', buyPrice: 3, sellPrice: 1 },
  slimeball: { id: 'slimeball', name: 'Slimeball', type: 'material', description: 'Sticky substance.', buyPrice: 5, sellPrice: 2 },
  sand_block: { id: 'sand_block', name: 'Sand Block', type: 'material', description: 'Desert sand.', buyPrice: 2, sellPrice: 1 },
  arrow_bundle: { id: 'arrow_bundle', name: 'Arrow Bundle', type: 'material', description: 'Pack of arrows.', buyPrice: 8, sellPrice: 4 },
  tipped_arrow: { id: 'tipped_arrow', name: 'Tipped Arrow', type: 'material', description: 'Potion-tipped arrow.', buyPrice: 15, sellPrice: 7 },
  potion_ingredients: { id: 'potion_ingredients', name: 'Potion Ingredients', type: 'material', description: 'Brewing materials.', buyPrice: 10, sellPrice: 5 },
  glowstone: { id: 'glowstone', name: 'Glowstone Dust', type: 'material', description: 'Luminous powder.', buyPrice: 12, sellPrice: 6 },
  trident: { id: 'trident', name: 'Trident', type: 'weapon', equipSlot: 'weapon', description: 'An ocean weapon of legend.', stats: { attack: 14, speed: 2 }, buyPrice: 300, sellPrice: 150, levelReq: 6 },
  iron_plate: { id: 'iron_plate', name: 'Iron Plate', type: 'material', description: 'Thick iron sheet.', buyPrice: 20, sellPrice: 10 },
  orb_of_dominance: { id: 'orb_of_dominance', name: 'Orb of Dominance', type: 'key', description: 'The source of the Arch-Illager\'s power.', buyPrice: 0, sellPrice: 0 },

  // Crafting results
  cobblestone_wall: { id: 'cobblestone_wall', name: 'Cobblestone Wall', type: 'consumable', description: 'Place in combat to block damage.', effect: 'wall', buyPrice: 15, sellPrice: 7 },
  stone_trap: { id: 'stone_trap', name: 'Stone Pressure Plate Trap', type: 'consumable', description: 'Damages the next enemy who acts.', effect: 'trap_20', buyPrice: 20, sellPrice: 10 },
};

export function getShopItems(area: string): ItemDef[] {
  const tiers: Record<string, number> = { hub: 1, forest: 2, desert: 4, swamp: 6, mountains: 8, nether: 10, fortress: 12 };
  const maxLevel = tiers[area] || 1;
  return Object.values(ITEMS).filter(i =>
    (i.type === 'consumable' || i.type === 'weapon' || i.type === 'armor' || i.type === 'accessory') &&
    (i.levelReq || 0) <= maxLevel &&
    i.buyPrice > 0
  );
}
