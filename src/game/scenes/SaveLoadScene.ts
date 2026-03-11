import { SaveManager, SaveInfo } from '../core/SaveManager';
import { GameState } from '../core/GameState';

export class SaveLoadScene extends Phaser.Scene {
  private mode: 'save' | 'load' = 'load';
  private returnScene = 'MainMenuScene';

  constructor() {
    super({ key: 'SaveLoadScene' });
  }

  init(data?: { mode?: 'save' | 'load'; returnScene?: string }) {
    this.mode = data?.mode || 'load';
    this.returnScene = data?.returnScene || 'MainMenuScene';
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 30, this.mode === 'save' ? 'Save Game' : 'Load Game', {
      fontSize: '24px', fontFamily: 'monospace', color: '#4ade80',
    }).setOrigin(0.5);

    // Save slots
    const saves = SaveManager.getAllSaveInfo();
    const slotWidth = Math.min(width - 60, 400);
    const slotHeight = 80;

    for (let i = 0; i < 3; i++) {
      const y = 80 + i * (slotHeight + 15);
      const x = width / 2 - slotWidth / 2;
      const info = saves[i];

      this.renderSlot(x, y, slotWidth, slotHeight, i, info.exists ? info : null);
    }

    // Autosave slot (load only)
    if (this.mode === 'load') {
      const autoInfo = SaveManager.getAutoSaveInfo();
      if (autoInfo) {
        const y = 80 + 3 * (slotHeight + 15);
        const x = width / 2 - slotWidth / 2;
        this.renderAutoSlot(x, y, slotWidth, slotHeight, autoInfo);
      }
    }

    // Back button
    const backBtn = this.add.text(width / 2, height - 40, '[ Back ]', {
      fontSize: '18px', fontFamily: 'monospace', color: '#a78bfa',
    }).setOrigin(0.5).setInteractive();

    backBtn.on('pointerdown', () => this.goBack());

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.goBack());
    }
  }

  private renderSlot(x: number, y: number, w: number, h: number, slot: number, info: SaveInfo | null) {
    const slotBg = this.add.graphics();
    slotBg.fillStyle(info ? 0x1e1b4b : 0x111827, 1);
    slotBg.fillRoundedRect(x, y, w, h, 8);
    slotBg.lineStyle(2, info ? 0x4c1d95 : 0x1f2937, 1);
    slotBg.strokeRoundedRect(x, y, w, h, 8);

    this.add.text(x + 15, y + 10, `Slot ${slot + 1}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#fbbf24',
    });

    if (info) {
      this.add.text(x + 15, y + 30, `Lv${info.level} ${info.className} — ${info.area}`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#e2e8f0',
      });

      const date = new Date(info.timestamp || 0);
      this.add.text(x + 15, y + 50, `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#64748b',
      });

      // Play time or gold
      this.add.text(x + w - 15, y + 30, `Gold: ${info.gold || 0}`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#fbbf24',
      }).setOrigin(1, 0);

      if (this.mode === 'load') {
        const loadBtn = this.add.text(x + w - 15, y + 55, '[Load]', {
          fontSize: '13px', fontFamily: 'monospace', color: '#4ade80',
        }).setOrigin(1, 0).setInteractive();

        loadBtn.on('pointerdown', () => this.loadSlot(slot));
      }

      if (this.mode === 'save') {
        const saveBtn = this.add.text(x + w - 15, y + 55, '[Overwrite]', {
          fontSize: '13px', fontFamily: 'monospace', color: '#f87171',
        }).setOrigin(1, 0).setInteractive();

        saveBtn.on('pointerdown', () => this.saveSlot(slot));
      }
    } else {
      this.add.text(x + 15, y + 35, 'Empty', {
        fontSize: '13px', fontFamily: 'monospace', color: '#475569',
      });

      if (this.mode === 'save') {
        const saveBtn = this.add.text(x + w - 15, y + 35, '[Save Here]', {
          fontSize: '13px', fontFamily: 'monospace', color: '#4ade80',
        }).setOrigin(1, 0).setInteractive();

        saveBtn.on('pointerdown', () => this.saveSlot(slot));
      }
    }

    // Make whole slot clickable
    const hitArea = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive();
    hitArea.on('pointerdown', () => {
      if (this.mode === 'load' && info) this.loadSlot(slot);
      else if (this.mode === 'save') this.saveSlot(slot);
    });
  }

  private renderAutoSlot(x: number, y: number, w: number, h: number, info: SaveInfo) {
    const slotBg = this.add.graphics();
    slotBg.fillStyle(0x1a1a2e, 1);
    slotBg.fillRoundedRect(x, y, w, h, 8);
    slotBg.lineStyle(2, 0x334155, 1);
    slotBg.strokeRoundedRect(x, y, w, h, 8);

    this.add.text(x + 15, y + 10, 'Autosave', {
      fontSize: '14px', fontFamily: 'monospace', color: '#60a5fa',
    });

    this.add.text(x + 15, y + 30, `Lv${info.level} ${info.className} — ${info.area}`, {
      fontSize: '12px', fontFamily: 'monospace', color: '#e2e8f0',
    });

    const date = new Date(info.timestamp || 0);
    this.add.text(x + 15, y + 50, `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#64748b',
    });

    const loadBtn = this.add.text(x + w - 15, y + 55, '[Load]', {
      fontSize: '13px', fontFamily: 'monospace', color: '#4ade80',
    }).setOrigin(1, 0).setInteractive();

    loadBtn.on('pointerdown', () => this.loadAutoSave());
  }

  private saveSlot(slot: number) {
    SaveManager.save(slot);
    // Refresh the scene to show updated slot
    this.scene.restart({ mode: this.mode, returnScene: this.returnScene });
  }

  private loadSlot(slot: number) {
    const success = SaveManager.load(slot);
    if (success) {
      const gs = GameState.getInstance();
      this.scene.stop();
      // Stop all other scenes and restart exploration
      this.scene.stop('ExplorationScene');
      this.scene.stop('CombatScene');
      this.scene.stop('DialogueScene');
      this.scene.stop('InventoryScene');
      this.scene.start('ExplorationScene', { area: gs.currentArea });
    }
  }

  private loadAutoSave() {
    const success = SaveManager.loadAutoSave();
    if (success) {
      const gs = GameState.getInstance();
      this.scene.stop();
      this.scene.stop('ExplorationScene');
      this.scene.stop('CombatScene');
      this.scene.stop('DialogueScene');
      this.scene.stop('InventoryScene');
      this.scene.start('ExplorationScene', { area: gs.currentArea });
    }
  }

  private goBack() {
    if (this.mode === 'save') {
      this.scene.stop();
      this.scene.resume(this.returnScene);
    } else {
      this.scene.start('MainMenuScene');
    }
  }
}
