// Procedural pixel art sprite generation using Phaser Graphics

export function generateAllSprites(scene: Phaser.Scene) {
  generateTileSprites(scene);
  generateCharacterSprites(scene);
  generateEnemySprites(scene);
  generateNPCSprites(scene);
  generateUISprites(scene);
}

function px(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number) {
  g.fillStyle(color);
  g.fillRect(x, y, w, h);
}

function generateTileSprites(scene: Phaser.Scene) {
  const tileW = 64, tileH = 32;
  const tiles: Record<string, { top: number; left: number; right: number }> = {
    grass: { top: 0x5b8c2a, left: 0x4a7a20, right: 0x3d6a18 },
    dirt: { top: 0x8b6914, left: 0x7a5a10, right: 0x6a4e0c },
    stone: { top: 0x888888, left: 0x707070, right: 0x585858 },
    sand: { top: 0xedc967, left: 0xd4b45c, right: 0xbca050 },
    water: { top: 0x3366cc, left: 0x2a55aa, right: 0x224488 },
    wood: { top: 0x2d5a1e, left: 0x6b4226, right: 0x5a3720 },
    cobble: { top: 0x777777, left: 0x666666, right: 0x555555 },
    lava: { top: 0xff4400, left: 0xcc3300, right: 0xaa2200 },
    netherrack: { top: 0x8b2020, left: 0x701818, right: 0x581212 },
    end_stone: { top: 0xddd8a0, left: 0xc8c090, right: 0xb0a878 },
    obsidian: { top: 0x1a0a2e, left: 0x120720, right: 0x0a0418 },
    path: { top: 0xc4a882, left: 0xb09870, right: 0x9c8860 },
    dark_stone: { top: 0x3a3a3a, left: 0x2a2a2a, right: 0x1a1a1a },
    soul_sand: { top: 0x6b4e37, left: 0x5a3f2e, right: 0x4a3224 },
    swamp_grass: { top: 0x4a6b2a, left: 0x3a5a20, right: 0x2e4a18 },
    snow: { top: 0xf0f0f0, left: 0xd8d8e0, right: 0xc0c0d0 },
  };

  for (const [name, colors] of Object.entries(tiles)) {
    const g = scene.add.graphics();
    // Draw isometric diamond
    // Top face
    g.fillStyle(colors.top);
    g.beginPath();
    g.moveTo(tileW / 2, 0);
    g.lineTo(tileW, tileH / 2);
    g.lineTo(tileW / 2, tileH);
    g.lineTo(0, tileH / 2);
    g.closePath();
    g.fill();

    // Left face
    g.fillStyle(colors.left);
    g.beginPath();
    g.moveTo(0, tileH / 2);
    g.lineTo(tileW / 2, tileH);
    g.lineTo(tileW / 2, tileH + 8);
    g.lineTo(0, tileH / 2 + 8);
    g.closePath();
    g.fill();

    // Right face
    g.fillStyle(colors.right);
    g.beginPath();
    g.moveTo(tileW, tileH / 2);
    g.lineTo(tileW / 2, tileH);
    g.lineTo(tileW / 2, tileH + 8);
    g.lineTo(tileW, tileH / 2 + 8);
    g.closePath();
    g.fill();

    // Outline
    g.lineStyle(1, 0x000000, 0.2);
    g.beginPath();
    g.moveTo(tileW / 2, 0);
    g.lineTo(tileW, tileH / 2);
    g.lineTo(tileW / 2, tileH);
    g.lineTo(0, tileH / 2);
    g.closePath();
    g.strokePath();

    // Add texture detail for some tiles
    if (name === 'water') {
      g.fillStyle(0x4488dd, 0.4);
      g.fillRect(20, 10, 8, 2);
      g.fillRect(30, 18, 10, 2);
    }
    if (name === 'lava') {
      g.fillStyle(0xffaa00, 0.5);
      g.fillRect(15, 12, 6, 3);
      g.fillRect(35, 8, 8, 3);
    }

    g.generateTexture(`tile_${name}`, tileW, tileH + 8);
    g.destroy();
  }
}

function drawMinecraftCharacter(g: Phaser.GameObjects.Graphics, skinColor: number, shirtColor: number, pantsColor: number, hairColor: number, size: number = 1) {
  const s = size;
  const w = 16 * s, h = 32 * s;
  const offsetX = 0, offsetY = 0;

  // Hair/head
  px(g, offsetX + 4*s, offsetY, 8*s, 2*s, hairColor);
  px(g, offsetX + 3*s, offsetY + 2*s, 10*s, 2*s, hairColor);

  // Face
  px(g, offsetX + 4*s, offsetY + 4*s, 8*s, 6*s, skinColor);
  // Eyes
  px(g, offsetX + 5*s, offsetY + 5*s, 2*s, 2*s, 0xffffff);
  px(g, offsetX + 9*s, offsetY + 5*s, 2*s, 2*s, 0xffffff);
  px(g, offsetX + 6*s, offsetY + 6*s, 1*s, 1*s, 0x442211);
  px(g, offsetX + 10*s, offsetY + 6*s, 1*s, 1*s, 0x442211);
  // Mouth
  px(g, offsetX + 6*s, offsetY + 8*s, 4*s, 1*s, 0x884422);

  // Body/shirt
  px(g, offsetX + 3*s, offsetY + 10*s, 10*s, 10*s, shirtColor);

  // Arms
  px(g, offsetX, offsetY + 10*s, 3*s, 10*s, shirtColor);
  px(g, offsetX + 13*s, offsetY + 10*s, 3*s, 10*s, shirtColor);
  // Hands
  px(g, offsetX, offsetY + 20*s, 3*s, 2*s, skinColor);
  px(g, offsetX + 13*s, offsetY + 20*s, 3*s, 2*s, skinColor);

  // Pants
  px(g, offsetX + 3*s, offsetY + 20*s, 10*s, 8*s, pantsColor);
  // Leg gap
  px(g, offsetX + 7*s, offsetY + 24*s, 2*s, 4*s, 0x000000, );
  g.fillStyle(0x000000, 0.15);
  g.fillRect(offsetX + 7*s, offsetY + 24*s, 2*s, 4*s);

  // Shoes
  px(g, offsetX + 3*s, offsetY + 28*s, 4*s, 4*s, 0x444444);
  px(g, offsetX + 9*s, offsetY + 28*s, 4*s, 4*s, 0x444444);
}

function generateCharacterSprites(scene: Phaser.Scene) {
  // Steve
  const gs = scene.add.graphics();
  drawMinecraftCharacter(gs, 0xc8a07e, 0x00aaaa, 0x3333aa, 0x4a3728, 2);
  gs.generateTexture('char_steve', 32, 64);
  gs.destroy();

  // Alex
  const ga = scene.add.graphics();
  drawMinecraftCharacter(ga, 0xeabc9a, 0x4cb44c, 0x5a3e2b, 0xcc6600, 2);
  ga.generateTexture('char_alex', 32, 64);
  ga.destroy();
}

function drawSimpleMob(scene: Phaser.Scene, key: string, bodyColor: number, eyeColor: number, height: number = 24, width: number = 16) {
  const g = scene.add.graphics();
  const s = 2;
  // Body
  px(g, 2*s, (height > 20 ? 0 : 4)*s, (width-4)*s, (height-4)*s, bodyColor);
  // Eyes
  px(g, 4*s, 4*s, 2*s, 2*s, eyeColor);
  px(g, (width-6)*s, 4*s, 2*s, 2*s, eyeColor);
  // Darker bottom
  g.fillStyle(0x000000, 0.2);
  g.fillRect(2*s, (height-8)*s, (width-4)*s, 4*s);
  g.generateTexture(key, width*s, height*s);
  g.destroy();
}

function generateEnemySprites(scene: Phaser.Scene) {
  drawSimpleMob(scene, 'enemy_zombie', 0x567d46, 0x000000);
  drawSimpleMob(scene, 'enemy_skeleton', 0xddddcc, 0x222222);
  drawSimpleMob(scene, 'enemy_spider', 0x342d2d, 0xff0000, 12, 20);
  drawSimpleMob(scene, 'enemy_pillager', 0x6b6b6b, 0x333333);
  drawSimpleMob(scene, 'enemy_vindicator', 0x595959, 0x333333);
  drawSimpleMob(scene, 'enemy_husk', 0xc2b280, 0x000000);
  drawSimpleMob(scene, 'enemy_stray', 0xaabbcc, 0x333333);
  drawSimpleMob(scene, 'enemy_witch', 0x4a0e4e, 0x00ff00);
  drawSimpleMob(scene, 'enemy_slime', 0x77cc44, 0x226622, 16, 20);
  drawSimpleMob(scene, 'enemy_creeper', 0x00cc00, 0x000000);
  drawSimpleMob(scene, 'enemy_cave_spider', 0x0a4a0a, 0xff0000, 10, 16);
  drawSimpleMob(scene, 'enemy_blaze', 0xff8800, 0xffff00);
  drawSimpleMob(scene, 'enemy_ghast', 0xeeeeee, 0x880000, 20, 24);
  drawSimpleMob(scene, 'enemy_piglin_brute', 0xd4a574, 0x222222);
  drawSimpleMob(scene, 'enemy_wither_skeleton', 0x333333, 0x666666);
  // Bosses - larger
  drawSimpleMob(scene, 'enemy_boss', 0x6600cc, 0xff00ff, 32, 24);
}

function generateNPCSprites(scene: Phaser.Scene) {
  const npcDefs: [string, number, number, number, number][] = [
    ['npc_elder', 0xc8a07e, 0x8b6914, 0x6b4e37, 0xcccccc],
    ['npc_merchant', 0xc8a07e, 0xdaa520, 0x5a3e2b, 0x4a3728],
    ['npc_armorer', 0xc8a07e, 0x808080, 0x555555, 0x4a3728],
    ['npc_faction', 0xc8a07e, 0x4169e1, 0x2a2a8b, 0x4a3728],
    ['npc_blacksmith', 0xc8a07e, 0x696969, 0x4a3728, 0x333333],
    ['npc_villager', 0xc8a07e, 0xc4a882, 0x5a3e2b, 0x4a3728],
    ['npc_trader', 0xc8a07e, 0x1e90ff, 0x5a3e2b, 0x4a3728],
    ['npc_alchemist', 0xc8a07e, 0x9932cc, 0x4a0e4e, 0x333333],
    ['npc_piglin', 0xd4a574, 0xdaa520, 0x8b6914, 0xd4a574],
    ['npc_explorer', 0xc8a07e, 0xdeb887, 0x8b6914, 0x4a3728],
    ['npc_hermit', 0xc8a07e, 0xa0a0a0, 0x808080, 0xcccccc],
  ];

  for (const [key, skin, shirt, pants, hair] of npcDefs) {
    const g = scene.add.graphics();
    drawMinecraftCharacter(g, skin, shirt, pants, hair, 2);
    g.generateTexture(key, 32, 64);
    g.destroy();
  }
}

function generateUISprites(scene: Phaser.Scene) {
  // Button background
  const gb = scene.add.graphics();
  gb.fillStyle(0x333333);
  gb.fillRoundedRect(0, 0, 120, 36, 4);
  gb.lineStyle(2, 0x666666);
  gb.strokeRoundedRect(0, 0, 120, 36, 4);
  gb.generateTexture('btn_bg', 120, 36);
  gb.destroy();

  // Panel background
  const gp = scene.add.graphics();
  gp.fillStyle(0x1a1a2e, 0.9);
  gp.fillRoundedRect(0, 0, 400, 200, 8);
  gp.lineStyle(2, 0x4a4a6e);
  gp.strokeRoundedRect(0, 0, 400, 200, 8);
  gp.generateTexture('panel_bg', 400, 200);
  gp.destroy();

  // HP bar segments
  for (const [key, color] of [['hp_bar', 0x22cc22], ['hp_bar_bg', 0x333333], ['sp_bar', 0x2266ff], ['xp_bar', 0xffcc00]] as const) {
    const g = scene.add.graphics();
    g.fillStyle(color);
    g.fillRect(0, 0, 4, 12);
    g.generateTexture(key, 4, 12);
    g.destroy();
  }

  // Exclamation mark for quests
  const ge = scene.add.graphics();
  ge.fillStyle(0xffff00);
  ge.fillRect(6, 0, 4, 10);
  ge.fillRect(6, 12, 4, 4);
  ge.generateTexture('quest_marker', 16, 16);
  ge.destroy();

  // Portal indicator
  const gpo = scene.add.graphics();
  gpo.fillStyle(0x9b30ff, 0.7);
  gpo.fillCircle(8, 8, 8);
  gpo.fillStyle(0xcc66ff, 0.5);
  gpo.fillCircle(8, 8, 4);
  gpo.generateTexture('portal_marker', 16, 16);
  gpo.destroy();

  // Enemy indicator (red dot)
  const ged = scene.add.graphics();
  ged.fillStyle(0xff3333);
  ged.fillCircle(6, 6, 6);
  ged.fillStyle(0xff6666);
  ged.fillCircle(5, 5, 3);
  ged.generateTexture('enemy_marker', 12, 12);
  ged.destroy();
}
