import { GameState } from '../core/GameState';
import { CombatEngine, CombatAction, Combatant, CombatResult } from '../core/CombatEngine';
import { EnemyDef } from '../data/enemies';
import { getSpellsForClass, getSpellsForFaction, SpellDef } from '../data/spells';
import { ITEMS, ItemDef } from '../data/items';

type MenuState = 'main' | 'spell' | 'item' | 'build' | 'target' | 'animating' | 'result';

export class CombatScene extends Phaser.Scene {
  private gs!: GameState;
  private engine!: CombatEngine;
  private enemies: EnemyDef[] = [];
  private areaKey = '';
  private returnScene = 'ExplorationScene';
  private isBoss = false;

  private menuState: MenuState = 'main';
  private pendingAction: Partial<CombatAction> = {};
  private combatLog: string[] = [];

  // UI elements
  private logText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private enemyContainer!: Phaser.GameObjects.Container;
  private playerStatusText!: Phaser.GameObjects.Text;
  private enemyStatusTexts: Phaser.GameObjects.Text[] = [];
  private turnOrderText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: { enemies: EnemyDef[]; areaKey: string; returnScene?: string; isBoss?: boolean }) {
    this.enemies = data.enemies || [];
    this.areaKey = data.areaKey || '';
    this.returnScene = data.returnScene || 'ExplorationScene';
    this.isBoss = data.isBoss || false;
  }

  create() {
    this.gs = GameState.getInstance();
    this.engine = new CombatEngine();
    this.engine.initCombat(this.enemies, this.isBoss);
    this.combatLog = [];

    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0a1e, 0x0f0a1e, 0x1a0e2e, 0x1a0e2e, 1);
    bg.fillRect(0, 0, width, height);

    // Battle arena area (top 60%)
    const arenaH = height * 0.55;

    // Enemy display
    this.enemyContainer = this.add.container(0, 0);
    this.renderEnemies(arenaH);

    // Player display
    const playerImg = this.add.image(width * 0.15, arenaH - 40, `char_${this.gs.avatar}`)
      .setScale(2.5).setDepth(100);

    // Turn order bar
    this.turnOrderText = this.add.text(width / 2, 15, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8',
    }).setOrigin(0.5);
    this.updateTurnOrder();

    // Bottom panel (FF-style)
    const panelY = arenaH;
    const panelH = height - arenaH;

    const panel = this.add.graphics();
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRect(0, panelY, width, panelH);
    panel.lineStyle(2, 0x334155, 1);
    panel.strokeRect(0, panelY, width, panelH);
    panel.lineStyle(1, 0x1e293b, 1);
    panel.strokeRect(0, panelY + 2, width, panelH - 4);

    // Player status (left side of panel)
    this.playerStatusText = this.add.text(15, panelY + 10, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#e2e8f0',
      lineSpacing: 4,
    });
    this.updatePlayerStatus();

    // Combat log (center)
    const logX = width * 0.35;
    this.logText = this.add.text(logX, panelY + 10, 'Battle Start!', {
      fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8',
      wordWrap: { width: width * 0.3 },
      lineSpacing: 2,
    });

    // Menu area (right side)
    this.menuContainer = this.add.container(width * 0.7, panelY + 10);

    this.showMainMenu();
    this.processNextTurn();
  }

  private renderEnemies(arenaH: number) {
    const { width } = this.scale;
    this.enemyStatusTexts = [];

    const combatants = this.engine.state.enemies;
    const spacing = Math.min(120, (width * 0.6) / Math.max(combatants.length, 1));

    combatants.forEach((enemy, i) => {
      const ex = width * 0.4 + i * spacing;
      const ey = arenaH * 0.4 + (i % 2) * 30;

      // Enemy sprite placeholder
      const circle = this.add.graphics();
      const color = this.isBoss && i === combatants.length - 1 ? 0xff4444 : 0xcc6666;
      circle.fillStyle(color, 1);
      circle.fillCircle(ex, ey, this.isBoss ? 24 : 16);
      circle.lineStyle(2, 0xffffff, 0.3);
      circle.strokeCircle(ex, ey, this.isBoss ? 24 : 16);
      this.enemyContainer.add(circle);

      // Enemy name + HP
      const statusText = this.add.text(ex, ey + 28, '', {
        fontSize: '10px', fontFamily: 'monospace', color: '#f87171',
        align: 'center',
      }).setOrigin(0.5);
      this.enemyStatusTexts.push(statusText);
      this.enemyContainer.add(statusText);
    });

    this.updateEnemyStatus();
  }

  private updateEnemyStatus() {
    const combatants = this.engine.state.enemies;
    combatants.forEach((e, i) => {
      if (this.enemyStatusTexts[i]) {
        const status = e.currentHp <= 0 ? 'DEAD' : `${e.currentHp}/${e.maxHp}`;
        this.enemyStatusTexts[i].setText(`${e.name}\nHP: ${status}`);
        if (e.currentHp <= 0) this.enemyStatusTexts[i].setColor('#555555');
      }
    });
  }

  private updatePlayerStatus() {
    const p = this.engine.state.allies[0];
    const statusEffects = p.statusEffects.map(s => s.name).join(', ') || 'None';
    this.playerStatusText.setText(
      `${this.gs.className} Lv${this.gs.level}\n` +
      `HP: ${p.currentHp}/${p.maxHp}\n` +
      `SP: ${p.currentSp}/${p.maxSp}\n` +
      `Status: ${statusEffects}`
    );
  }

  private updateTurnOrder() {
    const order = this.engine.state.turnOrder;
    const currentIdx = this.engine.state.currentTurnIndex;
    const names = order.map((c, i) => i === currentIdx ? `[${c.name}]` : c.name);
    this.turnOrderText.setText(`Turn: ${names.join(' > ')}`);
  }

  private processNextTurn() {
    if (this.engine.state.isOver) {
      this.showBattleEnd();
      return;
    }

    const current = this.engine.getCurrentCombatant();
    if (!current) return;

    this.updateTurnOrder();

    if (current.isPlayer) {
      this.menuState = 'main';
      this.showMainMenu();
    } else {
      // Enemy turn
      this.menuState = 'animating';
      this.clearMenu();

      this.time.delayedCall(400, () => {
        const results = this.engine.executeEnemyTurn();
        this.addCombatResults(results);
        this.updateEnemyStatus();
        this.updatePlayerStatus();

        this.time.delayedCall(600, () => {
          this.processNextTurn();
        });
      });
    }
  }

  private showMainMenu() {
    this.clearMenu();
    this.menuState = 'main';

    const options = [
      { text: 'Fight', action: () => this.selectFight() },
      { text: 'Spell', action: () => this.showSpellMenu() },
      { text: 'Item', action: () => this.showItemMenu() },
      { text: 'Build', action: () => this.showBuildMenu() },
      { text: 'Run', action: () => this.tryRun() },
    ];

    options.forEach((opt, i) => {
      const txt = this.add.text(0, i * 28, `> ${opt.text}`, {
        fontSize: '14px', fontFamily: 'monospace', color: '#e2e8f0',
      }).setInteractive();

      txt.on('pointerover', () => txt.setColor('#4ade80'));
      txt.on('pointerout', () => txt.setColor('#e2e8f0'));
      txt.on('pointerdown', opt.action);

      this.menuContainer.add(txt);
    });
  }

  private selectFight() {
    this.pendingAction = { type: 'fight' };
    this.showTargetMenu();
  }

  private showSpellMenu() {
    this.clearMenu();
    this.menuState = 'spell';

    const spells = [
      ...getSpellsForClass(this.gs.classId, this.gs.level),
      ...getSpellsForFaction(this.gs.factionId || '', this.gs.level),
    ];

    if (spells.length === 0) {
      this.addLog('No spells available!');
      this.showMainMenu();
      return;
    }

    const backBtn = this.add.text(0, 0, '< Back', {
      fontSize: '13px', fontFamily: 'monospace', color: '#94a3b8',
    }).setInteractive();
    backBtn.on('pointerdown', () => this.showMainMenu());
    this.menuContainer.add(backBtn);

    const player = this.engine.state.allies[0];

    spells.forEach((spell, i) => {
      const canCast = player.currentSp >= spell.spCost;
      const txt = this.add.text(0, 22 + i * 22, `${spell.name} (${spell.spCost}SP)`, {
        fontSize: '12px', fontFamily: 'monospace',
        color: canCast ? '#a78bfa' : '#555555',
      });

      if (canCast) {
        txt.setInteractive();
        txt.on('pointerover', () => txt.setColor('#c4b5fd'));
        txt.on('pointerout', () => txt.setColor('#a78bfa'));
        txt.on('pointerdown', () => {
          this.pendingAction = { type: 'spell', spellId: spell.id };
          if (spell.target === 'self' || spell.target === 'all_enemies' || spell.target === 'party') {
            this.executePlayerAction(0);
          } else {
            this.showTargetMenu();
          }
        });
      }

      this.menuContainer.add(txt);
    });
  }

  private showItemMenu() {
    this.clearMenu();
    this.menuState = 'item';

    const backBtn = this.add.text(0, 0, '< Back', {
      fontSize: '13px', fontFamily: 'monospace', color: '#94a3b8',
    }).setInteractive();
    backBtn.on('pointerdown', () => this.showMainMenu());
    this.menuContainer.add(backBtn);

    const consumables = this.gs.inventory
      .filter(inv => {
        const item = ITEMS[inv.id];
        return item && item.type === 'consumable' && inv.quantity > 0;
      });

    if (consumables.length === 0) {
      const noItems = this.add.text(0, 24, 'No items!', {
        fontSize: '12px', fontFamily: 'monospace', color: '#666',
      });
      this.menuContainer.add(noItems);
      return;
    }

    consumables.forEach((inv, i) => {
      const item = ITEMS[inv.id];
      const txt = this.add.text(0, 22 + i * 22, `${item.name} x${inv.quantity}`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#fbbf24',
      }).setInteractive();

      txt.on('pointerover', () => txt.setColor('#fde68a'));
      txt.on('pointerout', () => txt.setColor('#fbbf24'));
      txt.on('pointerdown', () => {
        this.pendingAction = { type: 'item', itemId: inv.id };
        this.executePlayerAction(0);
      });

      this.menuContainer.add(txt);
    });
  }

  private showBuildMenu() {
    this.clearMenu();
    this.menuState = 'build';

    const backBtn = this.add.text(0, 0, '< Back', {
      fontSize: '13px', fontFamily: 'monospace', color: '#94a3b8',
    }).setInteractive();
    backBtn.on('pointerdown', () => this.showMainMenu());
    this.menuContainer.add(backBtn);

    const builds = [
      { text: 'Wall (blocks dmg)', type: 'wall' },
      { text: 'Trap (dmg next turn)', type: 'trap' },
      { text: 'Cover (-30% dmg taken)', type: 'cover' },
    ];

    builds.forEach((b, i) => {
      const txt = this.add.text(0, 22 + i * 22, b.text, {
        fontSize: '12px', fontFamily: 'monospace', color: '#60a5fa',
      }).setInteractive();

      txt.on('pointerover', () => txt.setColor('#93c5fd'));
      txt.on('pointerout', () => txt.setColor('#60a5fa'));
      txt.on('pointerdown', () => {
        this.pendingAction = { type: 'build', buildType: b.type as 'wall' | 'trap' | 'cover' };
        this.executePlayerAction(0);
      });

      this.menuContainer.add(txt);
    });
  }

  private showTargetMenu() {
    this.clearMenu();
    this.menuState = 'target';

    const backBtn = this.add.text(0, 0, '< Back', {
      fontSize: '13px', fontFamily: 'monospace', color: '#94a3b8',
    }).setInteractive();
    backBtn.on('pointerdown', () => this.showMainMenu());
    this.menuContainer.add(backBtn);

    const enemies = this.engine.state.enemies;

    enemies.forEach((enemy, i) => {
      if (enemy.currentHp <= 0) return;

      const txt = this.add.text(0, 22 + i * 22, `${enemy.name} (${enemy.currentHp}HP)`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#f87171',
      }).setInteractive();

      txt.on('pointerover', () => txt.setColor('#fca5a5'));
      txt.on('pointerout', () => txt.setColor('#f87171'));
      txt.on('pointerdown', () => {
        this.executePlayerAction(i);
      });

      this.menuContainer.add(txt);
    });
  }

  private executePlayerAction(targetIndex: number) {
    this.menuState = 'animating';
    this.clearMenu();

    const action: CombatAction = {
      type: this.pendingAction.type as CombatAction['type'],
      targetIndex,
      spellId: this.pendingAction.spellId,
      itemId: this.pendingAction.itemId,
      buildType: this.pendingAction.buildType as 'wall' | 'trap' | 'cover' | undefined,
    };

    const results = this.engine.executePlayerAction(action);
    this.addCombatResults(results);

    // Flash effect
    this.cameras.main.flash(100, 255, 255, 255, false);

    this.updateEnemyStatus();
    this.updatePlayerStatus();

    this.time.delayedCall(500, () => {
      this.processNextTurn();
    });
  }

  private tryRun() {
    this.pendingAction = { type: 'run' };
    this.executePlayerAction(0);
  }

  private showBattleEnd() {
    this.menuState = 'result';
    this.clearMenu();

    this.engine.syncBackToGameState();

    if (this.engine.state.playerWon) {
      // Mark enemies as defeated
      if (this.areaKey) {
        this.gs.defeatedEnemies.add(this.areaKey);
      }

      // Get rewards from engine
      const rewards = this.engine.getRewards();

      // Grant rewards
      this.gs.gold += rewards.gold;
      const { leveledUp } = this.gs.addXp(rewards.xp);

      // Add dropped items
      rewards.drops.forEach(drop => {
        this.gs.addItem(drop.itemId);
      });

      // Update quest progress
      this.enemies.forEach(e => {
        this.gs.updateQuestProgress('kill', e.id, 1);
      });

      let resultText = `VICTORY!\n\nXP: +${rewards.xp}\nGold: +${rewards.gold}`;
      if (rewards.drops.length > 0) {
        const itemNames = rewards.drops.map(d => d.name);
        resultText += `\nItems: ${itemNames.join(', ')}`;
      }
      if (leveledUp) {
        resultText += `\n\nLEVEL UP! Now Lv${this.gs.level}!`;
      }

      const txt = this.add.text(0, 0, resultText, {
        fontSize: '14px', fontFamily: 'monospace', color: '#4ade80',
        lineSpacing: 4,
      });
      this.menuContainer.add(txt);

      const continueBtn = this.add.text(0, txt.height + 20, '[ Continue ]', {
        fontSize: '16px', fontFamily: 'monospace', color: '#fbbf24',
      }).setInteractive();
      continueBtn.on('pointerdown', () => this.exitCombat(true));
      this.menuContainer.add(continueBtn);
    } else {
      // Defeat or escaped
      const escaped = this.combatLog.some(l => l.includes('Got away') || l.includes('Ender Pearl'));
      if (escaped) {
        this.exitCombat(false);
        return;
      }

      const txt = this.add.text(0, 0, 'DEFEATED...\n\nYour adventure ends here.\nLoad a save to continue.', {
        fontSize: '14px', fontFamily: 'monospace', color: '#f87171',
        lineSpacing: 4,
      });
      this.menuContainer.add(txt);

      const loadBtn = this.add.text(0, 80, '[ Load Save ]', {
        fontSize: '16px', fontFamily: 'monospace', color: '#a78bfa',
      }).setInteractive();
      loadBtn.on('pointerdown', () => {
        this.scene.stop();
        this.scene.stop(this.returnScene);
        this.scene.start('SaveLoadScene', { mode: 'load' });
      });
      this.menuContainer.add(loadBtn);

      const menuBtn = this.add.text(0, 110, '[ Main Menu ]', {
        fontSize: '16px', fontFamily: 'monospace', color: '#94a3b8',
      }).setInteractive();
      menuBtn.on('pointerdown', () => {
        this.scene.stop();
        this.scene.stop(this.returnScene);
        this.scene.start('MainMenuScene');
      });
      this.menuContainer.add(menuBtn);
    }
  }

  private exitCombat(victory: boolean) {
    this.scene.stop();
    this.scene.resume(this.returnScene);
  }

  private addCombatResults(results: CombatResult[]) {
    for (const r of results) {
      this.addLog(r.message);
    }
  }

  private addLog(message: string) {
    this.combatLog.push(message);
    if (this.combatLog.length > 6) this.combatLog.shift();
    this.logText.setText(this.combatLog.join('\n'));
  }

  private clearMenu() {
    this.menuContainer.removeAll(true);
  }
}
