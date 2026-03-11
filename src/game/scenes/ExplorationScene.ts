import { GameState } from '../core/GameState';
import { SaveManager } from '../core/SaveManager';
import { AREA_MAPS, AreaMap, MapEnemy } from '../data/maps';
import { NPCS } from '../data/npcs';
import { getEnemiesForArea, getBossForArea, getScaledEnemy } from '../data/enemies';
import { cartToIso, TILE_W, TILE_H, TILE_DEPTH, getMapCenter, isInBounds, manhattanDistance } from '../utils/iso';

export class ExplorationScene extends Phaser.Scene {
  private gs!: GameState;
  private currentArea!: string;
  private mapDef!: AreaMap;
  private offsetX = 0;
  private offsetY = 0;
  private playerSprite!: Phaser.GameObjects.Image;
  private tileSprites: Phaser.GameObjects.Image[] = [];
  private entitySprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;
  private moveQueue: { x: number; y: number }[] = [];
  private hudText!: Phaser.GameObjects.Text;
  private areaLabel!: Phaser.GameObjects.Text;
  private interactPrompt!: Phaser.GameObjects.Text;
  private minimapGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'ExplorationScene' });
  }

  init(data: { area?: string }) {
    this.currentArea = data.area || 'hub';
  }

  create() {
    this.gs = GameState.getInstance();
    this.mapDef = AREA_MAPS[this.currentArea];
    this.gs.currentArea = this.currentArea;

    if (!this.mapDef) {
      console.error('No map for area:', this.currentArea);
      this.scene.start('MainMenuScene');
      return;
    }

    const { width, height } = this.scale;
    const center = getMapCenter(this.mapDef.width, this.mapDef.height, width, height);
    this.offsetX = center.offsetX;
    this.offsetY = center.offsetY;

    // Render map tiles
    this.renderMap();

    // Place NPCs
    this.placeNPCs();

    // Place enemies
    this.placeEnemies();

    // Place portals
    this.placePortals();

    // Place player
    const px = this.gs.playerX ?? this.mapDef.playerStart.x;
    const py = this.gs.playerY ?? this.mapDef.playerStart.y;
    this.gs.playerX = px;
    this.gs.playerY = py;

    const pIso = cartToIso(px, py);
    this.playerSprite = this.add.image(
      pIso.sx + this.offsetX,
      pIso.sy + this.offsetY - TILE_DEPTH,
      `char_${this.gs.avatar}`
    ).setScale(1.5).setDepth(10000 + px + py);

    // Camera follows player
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey('W'),
        A: this.input.keyboard.addKey('A'),
        S: this.input.keyboard.addKey('S'),
        D: this.input.keyboard.addKey('D'),
        I: this.input.keyboard.addKey('I'),
        M: this.input.keyboard.addKey('M'),
        ENTER: this.input.keyboard.addKey('ENTER'),
        SPACE: this.input.keyboard.addKey('SPACE'),
        ESC: this.input.keyboard.addKey('ESC'),
      };
    }

    // Tap/click to move
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleTapMove(pointer);
    });

    // HUD
    this.createHUD();

    // Area label
    const areaNames: Record<string, string> = {
      hub: 'Hub Village', forest: 'Creeper Forest', desert: 'Desert Temple',
      swamp: 'Soggy Swamp', mountains: 'Highblock Mountains',
      nether: 'Nether Wastes', fortress: 'Obsidian Fortress',
    };
    this.areaLabel = this.add.text(width / 2, 60, areaNames[this.currentArea] || this.currentArea, {
      fontSize: '20px', fontFamily: 'monospace', color: '#4ade80',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20000);

    this.tweens.add({
      targets: this.areaLabel,
      alpha: 0,
      delay: 2000,
      duration: 1000,
    });

    // Interact prompt
    this.interactPrompt = this.add.text(width / 2, height - 80, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#fbbf24',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20000);

    // Autosave on area enter
    SaveManager.autoSave();
  }

  update() {
    if (this.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W)) dy = -1;
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.S)) dy = 1;
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A)) dx = -1;
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D)) dx = 1;

      if (Phaser.Input.Keyboard.JustDown(this.wasd.I)) {
        this.scene.launch('InventoryScene');
        this.scene.pause();
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.wasd.ENTER) || Phaser.Input.Keyboard.JustDown(this.wasd.SPACE)) {
        this.tryInteract();
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.wasd.ESC)) {
        this.scene.launch('SaveLoadScene', { mode: 'save', returnScene: 'ExplorationScene' });
        this.scene.pause();
        return;
      }
    }

    // Process tap move queue
    if (dx === 0 && dy === 0 && this.moveQueue.length > 0) {
      const next = this.moveQueue.shift()!;
      dx = Math.sign(next.x - this.gs.playerX);
      dy = Math.sign(next.y - this.gs.playerY);
    }

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    }

    this.updateInteractPrompt();
    this.updateHUD();
  }

  private renderMap() {
    // Clear old tiles
    this.tileSprites.forEach(s => s.destroy());
    this.tileSprites = [];

    for (let y = 0; y < this.mapDef.height; y++) {
      for (let x = 0; x < this.mapDef.width; x++) {
        const tile = this.mapDef.tiles[y][x];
        const iso = cartToIso(x, y);
        const sx = iso.sx + this.offsetX;
        const sy = iso.sy + this.offsetY;

        const sprite = this.add.image(sx, sy, `tile_${tile}`)
          .setDepth(x + y);
        this.tileSprites.push(sprite);
      }
    }
  }

  private placeNPCs() {
    if (!this.mapDef.npcs) return;
    for (const npcPlacement of this.mapDef.npcs) {
      const npcDef = NPCS[npcPlacement.id];
      if (!npcDef) continue;

      const iso = cartToIso(npcPlacement.x, npcPlacement.y);
      const sx = iso.sx + this.offsetX;
      const sy = iso.sy + this.offsetY - TILE_DEPTH;

      const container = this.add.container(sx, sy);
      container.setDepth(5000 + npcPlacement.x + npcPlacement.y);

      const sprite = this.add.image(0, 0, `npc_${npcPlacement.id}`).setScale(1.3);
      container.add(sprite);

      // Name tag
      const nameTag = this.add.text(0, -20, npcDef.name, {
        fontSize: '10px', fontFamily: 'monospace', color: '#fbbf24',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
      container.add(nameTag);

      // Quest marker if applicable
      if (npcDef.role === 'Quest Giver' || npcDef.role === 'Quest') {
        const marker = this.add.image(0, -32, 'quest_marker').setScale(0.8);
        container.add(marker);
        this.tweens.add({ targets: marker, y: -38, duration: 600, yoyo: true, repeat: -1 });
      }

      this.entitySprites.set(`npc_${npcPlacement.id}_${npcPlacement.x}_${npcPlacement.y}`, container);

      // Click NPC to interact
      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        if (manhattanDistance(this.gs.playerX, this.gs.playerY, npcPlacement.x, npcPlacement.y) <= 2) {
          this.startDialogue(npcPlacement.id);
        }
      });
    }
  }

  private placeEnemies() {
    if (!this.mapDef.enemies) return;
    for (const enemyPlacement of this.mapDef.enemies) {
      const key = `${this.currentArea}_${enemyPlacement.x}_${enemyPlacement.y}`;
      if (this.gs.defeatedEnemies.has(key)) continue;

      const iso = cartToIso(enemyPlacement.x, enemyPlacement.y);
      const sx = iso.sx + this.offsetX;
      const sy = iso.sy + this.offsetY - TILE_DEPTH;

      const container = this.add.container(sx, sy);
      container.setDepth(5000 + enemyPlacement.x + enemyPlacement.y);

      const sprite = this.add.image(0, 0, 'enemy_marker').setScale(1.2);
      container.add(sprite);

      // Pulsing effect
      this.tweens.add({ targets: sprite, scaleX: 1.4, scaleY: 1.4, duration: 800, yoyo: true, repeat: -1 });

      this.entitySprites.set(key, container);

      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        if (manhattanDistance(this.gs.playerX, this.gs.playerY, enemyPlacement.x, enemyPlacement.y) <= 2) {
          this.startCombat(enemyPlacement);
        }
      });
    }
  }

  private placePortals() {
    if (!this.mapDef.portals) return;
    for (const portal of this.mapDef.portals) {
      const iso = cartToIso(portal.x, portal.y);
      const sx = iso.sx + this.offsetX;
      const sy = iso.sy + this.offsetY - TILE_DEPTH;

      const container = this.add.container(sx, sy);
      container.setDepth(5000 + portal.x + portal.y);

      const sprite = this.add.image(0, 0, 'portal_marker').setScale(1.5);
      container.add(sprite);

      const label = this.add.text(0, -22, portal.targetArea, {
        fontSize: '10px', fontFamily: 'monospace', color: '#60a5fa',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
      container.add(label);

      this.tweens.add({ targets: sprite, angle: 360, duration: 3000, repeat: -1 });

      this.entitySprites.set(`portal_${portal.x}_${portal.y}`, container);
    }
  }

  private tryMove(dx: number, dy: number) {
    const nx = this.gs.playerX + dx;
    const ny = this.gs.playerY + dy;

    if (!isInBounds(nx, ny, this.mapDef.width, this.mapDef.height)) return;

    const tile = this.mapDef.tiles[ny][nx];
    const blocked = ['water', 'lava', 'wall', 'obsidian', 'void'];
    if (blocked.includes(tile)) return;

    this.isMoving = true;
    this.gs.playerX = nx;
    this.gs.playerY = ny;

    const iso = cartToIso(nx, ny);
    const targetX = iso.sx + this.offsetX;
    const targetY = iso.sy + this.offsetY - TILE_DEPTH;

    this.playerSprite.setDepth(10000 + nx + ny);

    this.tweens.add({
      targets: this.playerSprite,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.checkTileEvents();
      },
    });
  }

  private handleTapMove(pointer: Phaser.Input.Pointer) {
    // Convert screen coords to world coords
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    // Convert to tile coords
    const relX = worldX - this.offsetX;
    const relY = worldY - this.offsetY;
    const tileX = Math.floor((relX / (TILE_W / 2) + relY / (TILE_H / 2)) / 2);
    const tileY = Math.floor((relY / (TILE_H / 2) - relX / (TILE_W / 2)) / 2);

    if (!isInBounds(tileX, tileY, this.mapDef.width, this.mapDef.height)) return;

    // Simple pathfinding: queue moves toward target
    this.moveQueue = [];
    const dx = tileX - this.gs.playerX;
    const dy = tileY - this.gs.playerY;
    const steps = Math.abs(dx) + Math.abs(dy);

    if (steps > 20) return; // Don't queue too many moves

    let cx = this.gs.playerX;
    let cy = this.gs.playerY;

    for (let i = 0; i < steps; i++) {
      if (cx !== tileX && (cy === tileY || i % 2 === 0)) {
        cx += Math.sign(tileX - cx);
      } else if (cy !== tileY) {
        cy += Math.sign(tileY - cy);
      }
      this.moveQueue.push({ x: cx, y: cy });
    }
  }

  private checkTileEvents() {
    const px = this.gs.playerX;
    const py = this.gs.playerY;

    // Check portal
    if (this.mapDef.portals) {
      for (const portal of this.mapDef.portals) {
        if (portal.x === px && portal.y === py) {
          this.moveQueue = [];
          this.scene.restart({ area: portal.targetArea });
          return;
        }
      }
    }

    // Check enemy encounter
    if (this.mapDef.enemies) {
      for (const enemy of this.mapDef.enemies) {
        if (enemy.x === px && enemy.y === py) {
          const key = `${this.currentArea}_${enemy.x}_${enemy.y}`;
          if (!this.gs.defeatedEnemies.has(key)) {
            this.moveQueue = [];
            this.startCombat(enemy);
            return;
          }
        }
      }
    }

    // Auto-interact with adjacent NPCs
    if (this.mapDef.npcs) {
      for (const npc of this.mapDef.npcs) {
        if (npc.x === px && npc.y === py) {
          this.moveQueue = [];
          this.startDialogue(npc.id);
          return;
        }
      }
    }
  }

  private tryInteract() {
    const px = this.gs.playerX;
    const py = this.gs.playerY;

    // Check adjacent NPCs
    if (this.mapDef.npcs) {
      for (const npc of this.mapDef.npcs) {
        if (manhattanDistance(px, py, npc.x, npc.y) <= 1) {
          this.startDialogue(npc.id);
          return;
        }
      }
    }

    // Check adjacent enemies
    if (this.mapDef.enemies) {
      for (const enemy of this.mapDef.enemies) {
        const key = `${this.currentArea}_${enemy.x}_${enemy.y}`;
        if (!this.gs.defeatedEnemies.has(key) && manhattanDistance(px, py, enemy.x, enemy.y) <= 1) {
          this.startCombat(enemy);
          return;
        }
      }
    }
  }

  private startDialogue(npcId: string) {
    this.scene.launch('DialogueScene', { npcId, returnScene: 'ExplorationScene' });
    this.scene.pause();
  }

  private startCombat(enemyPlacement: MapEnemy) {
    const enemies = [];
    if (enemyPlacement.isBoss) {
      const boss = getBossForArea(this.currentArea);
      if (boss) enemies.push(getScaledEnemy(boss, this.gs.level));
    } else {
      const areaEnemies = getEnemiesForArea(this.currentArea);
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const e = areaEnemies[Math.floor(Math.random() * areaEnemies.length)];
        if (e) enemies.push(getScaledEnemy(e, this.gs.level));
      }
    }

    this.scene.launch('CombatScene', {
      enemies,
      areaKey: `${this.currentArea}_${enemyPlacement.x}_${enemyPlacement.y}`,
      returnScene: 'ExplorationScene',
      isBoss: enemyPlacement.isBoss,
    });
    this.scene.pause();
  }

  private updateInteractPrompt() {
    const px = this.gs.playerX;
    const py = this.gs.playerY;
    let prompt = '';

    if (this.mapDef.npcs) {
      for (const npc of this.mapDef.npcs) {
        if (manhattanDistance(px, py, npc.x, npc.y) <= 1) {
          const def = NPCS[npc.id];
          prompt = `[Enter] Talk to ${def?.name || npc.id}`;
          break;
        }
      }
    }

    if (!prompt && this.mapDef.enemies) {
      for (const enemy of this.mapDef.enemies) {
        const key = `${this.currentArea}_${enemy.x}_${enemy.y}`;
        if (!this.gs.defeatedEnemies.has(key) && manhattanDistance(px, py, enemy.x, enemy.y) <= 1) {
          prompt = '[Enter] Engage enemy!';
          break;
        }
      }
    }

    this.interactPrompt.setText(prompt);
  }

  private createHUD() {
    const { width } = this.scale;
    // HUD background
    const hudBg = this.add.graphics().setScrollFactor(0).setDepth(19999);
    hudBg.fillStyle(0x0f172a, 0.85);
    hudBg.fillRect(0, 0, width, 50);

    this.hudText = this.add.text(10, 8, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#e2e8f0',
    }).setScrollFactor(0).setDepth(20000);

    // Menu buttons (mobile-friendly)
    const btnSize = 36;
    const btns = [
      { label: 'INV', x: width - 50, cb: () => { this.scene.launch('InventoryScene'); this.scene.pause(); } },
      { label: 'SAVE', x: width - 100, cb: () => { this.scene.launch('SaveLoadScene', { mode: 'save', returnScene: 'ExplorationScene' }); this.scene.pause(); } },
    ];

    btns.forEach(b => {
      const btn = this.add.text(b.x, 8, b.label, {
        fontSize: '12px', fontFamily: 'monospace', color: '#a78bfa',
        backgroundColor: '#1e1b4b',
        padding: { x: 6, y: 4 },
      }).setScrollFactor(0).setDepth(20000).setInteractive();
      btn.on('pointerdown', b.cb);
    });
  }

  private updateHUD() {
    const g = this.gs;
    this.hudText.setText(
      `Lv${g.level} ${g.className}  HP:${g.hp}/${g.maxHp}  SP:${g.sp}/${g.maxSp}  Gold:${g.gold}`
    );
  }
}
