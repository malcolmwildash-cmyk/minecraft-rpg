import { CLASS_LIST, ClassDef } from '../data/classes';
import { GameState } from '../core/GameState';

export class CharCreateScene extends Phaser.Scene {
  private selectedAvatar: 'steve' | 'alex' = 'steve';
  private selectedClassIndex = 0;
  private classInfoText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private abilitiesText!: Phaser.GameObjects.Text;
  private avatarPreview!: Phaser.GameObjects.Image;
  private classNameText!: Phaser.GameObjects.Text;
  private avatarLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CharCreateScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x1e1b4b, 0x1e1b4b, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 30, 'Create Your Hero', {
      fontSize: '28px', fontFamily: 'monospace', color: '#4ade80',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Avatar selection area
    const avatarY = 90;
    this.add.text(width / 2, avatarY, 'Choose Avatar', {
      fontSize: '16px', fontFamily: 'monospace', color: '#94a3b8',
    }).setOrigin(0.5);

    // Avatar buttons
    const steveBtn = this.createButton(width / 2 - 80, avatarY + 40, 120, 36, 'Steve', () => {
      this.selectedAvatar = 'steve';
      this.updatePreview();
    });
    const alexBtn = this.createButton(width / 2 + 80, avatarY + 40, 120, 36, 'Alex', () => {
      this.selectedAvatar = 'alex';
      this.updatePreview();
    });

    this.avatarLabel = this.add.text(width / 2, avatarY + 80, 'Selected: Steve', {
      fontSize: '14px', fontFamily: 'monospace', color: '#a78bfa',
    }).setOrigin(0.5);

    // Avatar preview
    this.avatarPreview = this.add.image(width / 2, avatarY + 130, 'char_steve').setScale(3);

    // Class selection
    const classY = avatarY + 180;
    this.add.text(width / 2, classY, 'Choose Class', {
      fontSize: '16px', fontFamily: 'monospace', color: '#94a3b8',
    }).setOrigin(0.5);

    // Left/Right arrows for class
    this.createButton(width / 2 - 140, classY + 40, 40, 36, '<', () => {
      this.selectedClassIndex = (this.selectedClassIndex - 1 + CLASS_LIST.length) % CLASS_LIST.length;
      this.updatePreview();
    });
    this.createButton(width / 2 + 140, classY + 40, 40, 36, '>', () => {
      this.selectedClassIndex = (this.selectedClassIndex + 1) % CLASS_LIST.length;
      this.updatePreview();
    });

    this.classNameText = this.add.text(width / 2, classY + 40, '', {
      fontSize: '20px', fontFamily: 'monospace', color: '#fbbf24',
    }).setOrigin(0.5);

    // Class info panel
    const panelY = classY + 70;
    const panelW = Math.min(width - 40, 500);
    const panelX = width / 2 - panelW / 2;

    const infoBg = this.add.graphics();
    infoBg.fillStyle(0x1e1b4b, 0.8);
    infoBg.fillRoundedRect(panelX, panelY, panelW, 200, 8);
    infoBg.lineStyle(1, 0x4c1d95, 1);
    infoBg.strokeRoundedRect(panelX, panelY, panelW, 200, 8);

    this.classInfoText = this.add.text(panelX + 15, panelY + 10, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#e2e8f0',
      wordWrap: { width: panelW - 30 },
    });

    this.statsText = this.add.text(panelX + 15, panelY + 60, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8',
      wordWrap: { width: panelW / 2 - 20 },
    });

    this.abilitiesText = this.add.text(panelX + panelW / 2, panelY + 60, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#a78bfa',
      wordWrap: { width: panelW / 2 - 20 },
    });

    // Class grid for quick selection
    const gridY = panelY + 215;
    const gridCols = Math.min(5, Math.floor((panelW) / 100));
    CLASS_LIST.forEach((cls, i) => {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const bx = panelX + col * (panelW / gridCols) + (panelW / gridCols) / 2;
      const by = gridY + row * 32;

      const txt = this.add.text(bx, by, cls.name, {
        fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8',
      }).setOrigin(0.5).setInteractive();

      txt.on('pointerdown', () => {
        this.selectedClassIndex = i;
        this.updatePreview();
      });
      txt.on('pointerover', () => txt.setColor('#ffffff'));
      txt.on('pointerout', () => txt.setColor('#94a3b8'));
    });

    // Start button
    const startY = Math.min(gridY + Math.ceil(CLASS_LIST.length / gridCols) * 32 + 20, height - 60);
    this.createButton(width / 2, startY, 200, 44, 'Begin Adventure', () => this.startGame(), true);

    // Back button
    this.createButton(60, height - 30, 100, 30, 'Back', () => this.scene.start('MainMenuScene'));

    this.updatePreview();
  }

  private updatePreview() {
    const cls = CLASS_LIST[this.selectedClassIndex];
    const s = cls.baseStats;

    this.avatarLabel.setText(`Selected: ${this.selectedAvatar === 'steve' ? 'Steve' : 'Alex'}`);
    this.avatarPreview.setTexture(`char_${this.selectedAvatar}`);
    this.classNameText.setText(`${cls.name}`);

    this.classInfoText.setText(
      `${cls.archetype}\n${cls.description}`
    );

    this.statsText.setText(
      `HP: ${s.hp}\n` +
      `ATK: ${s.attack}  DEF: ${s.defense}\n` +
      `MAG: ${s.spellPower}  SPD: ${s.speed}`
    );

    this.abilitiesText.setText(
      `Starting Abilities:\n` +
      cls.startingAbilities.map(a => `  ${a}`).join('\n') +
      `\n\nPassive: ${cls.passiveDesc}`
    );
  }

  private startGame() {
    const cls = CLASS_LIST[this.selectedClassIndex];
    const gs = GameState.getInstance();
    gs.initNewGame(this.selectedAvatar, cls.id);
    this.scene.start('ExplorationScene', { area: 'hub' });
  }

  private createButton(x: number, y: number, w: number, h: number, label: string, callback: () => void, primary = false) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const baseColor = primary ? 0x16a34a : 0x2d1b69;
    const hoverColor = primary ? 0x22c55e : 0x4c1d95;
    const borderColor = primary ? 0x4ade80 : 0x7c3aed;

    bg.fillStyle(baseColor, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    container.add(bg);

    const txt = this.add.text(0, 0, label, {
      fontSize: primary ? '18px' : '14px',
      fontFamily: 'monospace',
      color: '#e2e8f0',
    }).setOrigin(0.5);
    container.add(txt);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(hoverColor, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, borderColor, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(baseColor, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, borderColor, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });

    container.on('pointerdown', callback);
    return container;
  }
}
