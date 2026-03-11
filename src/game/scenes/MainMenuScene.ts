import { SaveManager } from '../core/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  private particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    // Floating particles
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.3 - 0.1,
        alpha: Math.random() * 0.5 + 0.2,
        size: Math.random() * 3 + 1,
      });
    }

    // Title
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: Math.min(width * 0.06, 48) + 'px',
      fontFamily: 'monospace',
      color: '#4ade80',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center',
    };

    const title = this.add.text(width / 2, height * 0.15, 'MINECRAFT\nDUNGEONS RPG', titleStyle).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, title.y + title.height / 2 + 20, 'The Arch-Illager Returns', {
      fontSize: Math.min(width * 0.025, 18) + 'px',
      fontFamily: 'monospace',
      color: '#a78bfa',
    }).setOrigin(0.5);

    // Menu buttons
    const buttonY = height * 0.45;
    const buttonSpacing = 60;
    const buttonWidth = Math.min(width * 0.5, 280);
    const buttonHeight = 44;

    const buttons = [
      { text: 'New Game', callback: () => this.scene.start('CharCreateScene') },
      { text: 'Load Game', callback: () => this.scene.start('SaveLoadScene', { mode: 'load' }) },
      { text: 'Controls', callback: () => this.showControls() },
    ];

    // Check if saves exist for Load button
    const saves = SaveManager.getAllSaveInfo();
    const hasSaves = saves.some(s => s !== null);

    buttons.forEach((btn, i) => {
      const y = buttonY + i * buttonSpacing;
      const isDisabled = btn.text === 'Load Game' && !hasSaves;

      const container = this.add.container(width / 2, y);

      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(isDisabled ? 0x333333 : 0x2d1b69, 1);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, isDisabled ? 0x555555 : 0x7c3aed, 1);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      container.add(bg);

      const label = this.add.text(0, 0, btn.text, {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: isDisabled ? '#666666' : '#e2e8f0',
      }).setOrigin(0.5);
      container.add(label);

      if (!isDisabled) {
        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        container.on('pointerover', () => {
          bg.clear();
          bg.fillStyle(0x4c1d95, 1);
          bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
          bg.lineStyle(2, 0xa78bfa, 1);
          bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
          label.setColor('#ffffff');
        });

        container.on('pointerout', () => {
          bg.clear();
          bg.fillStyle(0x2d1b69, 1);
          bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
          bg.lineStyle(2, 0x7c3aed, 1);
          bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
          label.setColor('#e2e8f0');
        });

        container.on('pointerdown', () => {
          this.playClick();
          btn.callback();
        });
      }
    });

    // Version
    this.add.text(width / 2, height - 30, 'v1.0 — Built with Phaser 3 & Next.js', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#64748b',
    }).setOrigin(0.5);

    // Blinking "Press to start" for mobile
    const pressText = this.add.text(width / 2, height * 0.85, 'Tap or click to begin', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#94a3b8',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pressText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }

  update() {
    // Animate particles (simple background effect)
    // We'll skip rendering them as graphics each frame for performance
    // In a real scenario we'd use a particle emitter
  }

  private showControls() {
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const panelW = Math.min(width * 0.8, 400);
    const panelH = 320;
    const px = width / 2 - panelW / 2;
    const py = height / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1e1b4b, 1);
    panel.fillRoundedRect(px, py, panelW, panelH, 12);
    panel.lineStyle(2, 0x7c3aed, 1);
    panel.strokeRoundedRect(px, py, panelW, panelH, 12);

    this.add.text(width / 2, py + 30, 'Controls', {
      fontSize: '24px', fontFamily: 'monospace', color: '#4ade80',
    }).setOrigin(0.5);

    const controls = [
      'Arrow Keys / WASD — Move',
      'Enter / Space — Interact',
      'I — Inventory',
      'M — Map',
      'Esc — Menu / Back',
      'Click / Tap — Select',
      '',
      'Mobile: Tap to move & interact',
    ];

    controls.forEach((line, i) => {
      this.add.text(width / 2, py + 70 + i * 26, line, {
        fontSize: '14px', fontFamily: 'monospace', color: '#cbd5e1',
      }).setOrigin(0.5);
    });

    // Close button
    const closeBtn = this.add.text(width / 2, py + panelH - 30, '[ Close ]', {
      fontSize: '16px', fontFamily: 'monospace', color: '#a78bfa',
    }).setOrigin(0.5).setInteractive();

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
      closeBtn.destroy();
      // Destroy control texts (they auto-clean on scene restart but this is immediate)
    });

    overlay.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
      closeBtn.destroy();
    });
  }

  private playClick() {
    try {
      if (this.cache.audio.exists('sfx_click')) {
        const snd = this.sound as any;
        if (snd.context) {
          const ctx = snd.context as AudioContext;
          const buf = this.cache.audio.get('sfx_click').data;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start();
        }
      }
    } catch { /* audio optional */ }
  }
}
