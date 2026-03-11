export type TileType = 'grass' | 'dirt' | 'stone' | 'sand' | 'water' | 'wood' | 'cobble' | 'lava' | 'netherrack' | 'end_stone' | 'obsidian' | 'path' | 'dark_stone' | 'soul_sand' | 'swamp_grass' | 'snow';

export interface MapNPC {
  id: string;
  x: number;
  y: number;
  name: string;
  sprite: string;
}

export interface MapEnemy {
  enemyId: string;
  x: number;
  y: number;
  respawn: boolean;
  isBoss?: boolean;
}

export interface MapPortal {
  x: number;
  y: number;
  targetArea: string;
  targetX: number;
  targetY: number;
  label: string;
}

export interface AreaMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: TileType[][];
  npcs: MapNPC[];
  enemies: MapEnemy[];
  portals: MapPortal[];
  playerStart: { x: number; y: number };
  bgColor: number;
  musicKey?: string;
}

function fillGrid(w: number, h: number, tile: TileType): TileType[][] {
  return Array.from({ length: h }, () => Array(w).fill(tile));
}

function setRect(grid: TileType[][], x: number, y: number, w: number, h: number, tile: TileType) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      if (y + dy < grid.length && x + dx < grid[0].length)
        grid[y + dy][x + dx] = tile;
}

function setTile(grid: TileType[][], x: number, y: number, tile: TileType) {
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) grid[y][x] = tile;
}

function buildHubVillage(): AreaMap {
  const w = 16, h = 16;
  const tiles = fillGrid(w, h, 'grass');
  // Paths
  for (let i = 2; i < 14; i++) { setTile(tiles, 8, i, 'path'); setTile(tiles, i, 8, 'path'); }
  // Buildings (cobblestone)
  setRect(tiles, 2, 2, 3, 3, 'cobble');  // Shop
  setRect(tiles, 11, 2, 3, 3, 'cobble'); // Inn
  setRect(tiles, 2, 11, 3, 3, 'cobble'); // Faction Hall
  setRect(tiles, 11, 11, 3, 3, 'cobble');// Quest Board area
  // Central fountain
  setTile(tiles, 8, 8, 'water');
  setTile(tiles, 7, 8, 'stone'); setTile(tiles, 9, 8, 'stone');
  setTile(tiles, 8, 7, 'stone'); setTile(tiles, 8, 9, 'stone');

  return {
    id: 'hub', name: 'Haven Village', width: w, height: h, tiles,
    playerStart: { x: 8, y: 14 }, bgColor: 0x87ceeb,
    npcs: [
      { id: 'elder_villager', x: 8, y: 6, name: 'Elder Villager', sprite: 'npc_elder' },
      { id: 'merchant', x: 3, y: 1, name: 'Merchant', sprite: 'npc_merchant' },
      { id: 'armorer', x: 12, y: 1, name: 'Armorer', sprite: 'npc_armorer' },
      { id: 'faction_guide', x: 3, y: 10, name: 'Faction Guide', sprite: 'npc_faction' },
      { id: 'blacksmith', x: 12, y: 10, name: 'Blacksmith', sprite: 'npc_blacksmith' },
    ],
    enemies: [],
    portals: [
      { x: 8, y: 0, targetArea: 'forest', targetX: 10, targetY: 18, label: 'To Forest' },
    ],
  };
}

function buildForest(): AreaMap {
  const w = 20, h = 20;
  const tiles = fillGrid(w, h, 'grass');
  // Scatter trees (wood tiles)
  const treePositions = [
    [1,1],[3,0],[0,4],[5,3],[2,7],[7,1],[4,10],[1,13],[6,6],[9,4],
    [12,2],[15,1],[18,3],[14,7],[17,9],[11,12],[16,14],[19,6],[13,16],[3,17],
  ];
  treePositions.forEach(([x, y]) => setTile(tiles, x, y, 'wood'));
  // Dirt path
  for (let i = 0; i < 20; i++) setTile(tiles, 10, i, 'path');
  // Water stream
  for (let i = 5; i < 15; i++) setTile(tiles, i, 10, 'water');

  return {
    id: 'forest', name: 'Emerald Forest', width: w, height: h, tiles,
    playerStart: { x: 10, y: 18 }, bgColor: 0x228b22,
    npcs: [
      { id: 'panicked_villager', x: 5, y: 5, name: 'Panicked Villager', sprite: 'npc_villager' },
      { id: 'treasure_hunter', x: 15, y: 15, name: 'Wandering Trader', sprite: 'npc_trader' },
    ],
    enemies: [
      { enemyId: 'zombie', x: 3, y: 5, respawn: true },
      { enemyId: 'skeleton', x: 14, y: 3, respawn: true },
      { enemyId: 'spider', x: 7, y: 14, respawn: true },
      { enemyId: 'pillager', x: 16, y: 8, respawn: true },
      { enemyId: 'vindicator', x: 5, y: 16, respawn: true },
      { enemyId: 'forest_boss_evoker', x: 10, y: 1, respawn: false },
    ],
    portals: [
      { x: 10, y: 19, targetArea: 'hub', targetX: 8, targetY: 1, label: 'To Village' },
      { x: 0, y: 10, targetArea: 'desert', targetX: 18, targetY: 10, label: 'To Desert' },
    ],
  };
}

function buildDesert(): AreaMap {
  const w = 20, h = 20;
  const tiles = fillGrid(w, h, 'sand');
  // Temple structure
  setRect(tiles, 6, 2, 8, 6, 'cobble');
  setRect(tiles, 8, 3, 4, 4, 'stone');
  // Path to temple
  for (let i = 8; i < 20; i++) setTile(tiles, 10, i, 'path');

  return {
    id: 'desert', name: 'Sandstone Desert', width: w, height: h, tiles,
    playerStart: { x: 10, y: 18 }, bgColor: 0xedc967,
    npcs: [
      { id: 'desert_explorer', x: 12, y: 15, name: 'Explorer', sprite: 'npc_explorer' },
    ],
    enemies: [
      { enemyId: 'husk', x: 5, y: 8, respawn: true },
      { enemyId: 'husk', x: 15, y: 12, respawn: true },
      { enemyId: 'stray', x: 3, y: 14, respawn: true },
      { enemyId: 'stray', x: 17, y: 6, respawn: true },
      { enemyId: 'desert_boss_redstone_golem', x: 10, y: 4, respawn: false },
    ],
    portals: [
      { x: 19, y: 10, targetArea: 'forest', targetX: 1, targetY: 10, label: 'To Forest' },
      { x: 0, y: 10, targetArea: 'swamp', targetX: 18, targetY: 10, label: 'To Swamp' },
    ],
  };
}

function buildSwamp(): AreaMap {
  const w = 20, h = 20;
  const tiles = fillGrid(w, h, 'swamp_grass');
  // Water pools
  setRect(tiles, 3, 3, 4, 3, 'water');
  setRect(tiles, 12, 8, 3, 4, 'water');
  setRect(tiles, 5, 14, 5, 3, 'water');
  // Wood (mangroves)
  [[1,1],[6,0],[0,8],[8,6],[15,2],[18,12],[2,18],[14,17]].forEach(([x,y]) => setTile(tiles, x, y, 'wood'));
  for (let i = 0; i < 20; i++) setTile(tiles, 10, i, 'path');

  return {
    id: 'swamp', name: 'Murky Swamp', width: w, height: h, tiles,
    playerStart: { x: 10, y: 18 }, bgColor: 0x3b5323,
    npcs: [
      { id: 'alchemist', x: 8, y: 12, name: 'Alchemist', sprite: 'npc_alchemist' },
    ],
    enemies: [
      { enemyId: 'witch', x: 4, y: 7, respawn: true },
      { enemyId: 'witch', x: 16, y: 14, respawn: true },
      { enemyId: 'slime', x: 8, y: 4, respawn: true },
      { enemyId: 'slime', x: 14, y: 16, respawn: true },
      { enemyId: 'swamp_boss_corrupted_guardian', x: 10, y: 2, respawn: false },
    ],
    portals: [
      { x: 19, y: 10, targetArea: 'desert', targetX: 1, targetY: 10, label: 'To Desert' },
      { x: 0, y: 10, targetArea: 'mountains', targetX: 18, targetY: 10, label: 'To Mountains' },
    ],
  };
}

function buildMountains(): AreaMap {
  const w = 20, h = 20;
  const tiles = fillGrid(w, h, 'stone');
  // Snow peaks
  setRect(tiles, 0, 0, 20, 4, 'snow');
  // Cave entrances (dark stone)
  setRect(tiles, 3, 8, 4, 3, 'dark_stone');
  setRect(tiles, 13, 12, 4, 3, 'dark_stone');
  // Path
  for (let i = 0; i < 20; i++) setTile(tiles, 10, i, 'path');
  // Dirt patches
  setRect(tiles, 6, 15, 3, 3, 'dirt');

  return {
    id: 'mountains', name: 'Iron Mountains', width: w, height: h, tiles,
    playerStart: { x: 10, y: 18 }, bgColor: 0x708090,
    npcs: [
      { id: 'mountain_hermit', x: 5, y: 6, name: 'Mountain Hermit', sprite: 'npc_hermit' },
    ],
    enemies: [
      { enemyId: 'creeper', x: 4, y: 9, respawn: true },
      { enemyId: 'creeper', x: 14, y: 13, respawn: true },
      { enemyId: 'cave_spider', x: 5, y: 10, respawn: true },
      { enemyId: 'cave_spider', x: 15, y: 14, respawn: true },
      { enemyId: 'mountain_boss_ravager', x: 10, y: 2, respawn: false },
    ],
    portals: [
      { x: 19, y: 10, targetArea: 'swamp', targetX: 1, targetY: 10, label: 'To Swamp' },
      { x: 0, y: 10, targetArea: 'nether', targetX: 18, targetY: 10, label: 'To Nether' },
    ],
  };
}

function buildNether(): AreaMap {
  const w = 20, h = 20;
  const tiles = fillGrid(w, h, 'netherrack');
  // Lava pools
  setRect(tiles, 2, 4, 4, 3, 'lava');
  setRect(tiles, 14, 10, 3, 4, 'lava');
  // Soul sand patches
  setRect(tiles, 7, 7, 5, 4, 'soul_sand');
  // Path
  for (let i = 0; i < 20; i++) setTile(tiles, 10, i, 'path');
  // Fortress bridge (obsidian)
  setRect(tiles, 8, 0, 4, 3, 'obsidian');

  return {
    id: 'nether', name: 'The Nether', width: w, height: h, tiles,
    playerStart: { x: 10, y: 18 }, bgColor: 0x330000,
    npcs: [
      { id: 'captured_piglin', x: 12, y: 8, name: 'Captured Piglin', sprite: 'npc_piglin' },
    ],
    enemies: [
      { enemyId: 'blaze', x: 5, y: 8, respawn: true },
      { enemyId: 'ghast', x: 15, y: 5, respawn: true },
      { enemyId: 'piglin_brute', x: 8, y: 14, respawn: true },
      { enemyId: 'wither_skeleton', x: 14, y: 16, respawn: true },
      { enemyId: 'nether_boss_wither', x: 10, y: 1, respawn: false },
    ],
    portals: [
      { x: 19, y: 10, targetArea: 'mountains', targetX: 1, targetY: 10, label: 'To Mountains' },
      { x: 10, y: 0, targetArea: 'fortress', targetX: 10, targetY: 14, label: 'To Fortress' },
    ],
  };
}

function buildFortress(): AreaMap {
  const w = 16, h = 16;
  const tiles = fillGrid(w, h, 'dark_stone');
  // Throne room
  setRect(tiles, 4, 1, 8, 4, 'obsidian');
  // Pillars
  [[3,3],[12,3],[3,8],[12,8],[3,13],[12,13]].forEach(([x,y]) => setTile(tiles, x, y, 'cobble'));
  // Path to throne
  for (let i = 5; i < 15; i++) setTile(tiles, 8, i, 'path');

  return {
    id: 'fortress', name: "Arch-Illager's Fortress", width: w, height: h, tiles,
    playerStart: { x: 8, y: 14 }, bgColor: 0x1a0a2e,
    npcs: [],
    enemies: [
      { enemyId: 'vindicator', x: 4, y: 10, respawn: false },
      { enemyId: 'vindicator', x: 12, y: 10, respawn: false },
      { enemyId: 'arch_illager', x: 8, y: 2, respawn: false },
    ],
    portals: [
      { x: 8, y: 15, targetArea: 'nether', targetX: 10, targetY: 1, label: 'To Nether' },
    ],
  };
}

export const AREA_MAPS: Record<string, AreaMap> = {
  hub: buildHubVillage(),
  forest: buildForest(),
  desert: buildDesert(),
  swamp: buildSwamp(),
  mountains: buildMountains(),
  nether: buildNether(),
  fortress: buildFortress(),
};

export const AREA_ORDER = ['hub', 'forest', 'desert', 'swamp', 'mountains', 'nether', 'fortress'];
