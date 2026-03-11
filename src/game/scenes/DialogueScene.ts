import { GameState } from '../core/GameState';
import { NPCS, NPCDef, DialogueLine } from '../data/npcs';
import { ITEMS } from '../data/items';
import { FACTIONS } from '../data/factions';

export class DialogueScene extends Phaser.Scene {
  private gs!: GameState;
  private npcDef!: NPCDef;
  private returnScene = 'ExplorationScene';
  private currentLines: DialogueLine[] = [];
  private lineIndex = 0;
  private dialogueBox!: Phaser.GameObjects.Graphics;
  private speakerText!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private choicesContainer!: Phaser.GameObjects.Container;
  private continuePrompt!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'DialogueScene' });
  }

  init(data: { npcId: string; returnScene?: string; dialogueKey?: string }) {
    this.gs = GameState.getInstance();
    this.npcDef = NPCS[data.npcId];
    this.returnScene = data.returnScene || 'ExplorationScene';

    // Determine which dialogue to show
    const key = data.dialogueKey || this.getDialogueKey(data.npcId);
    this.currentLines = this.npcDef?.dialogues[key] || this.npcDef?.dialogues['default'] || [];
    this.lineIndex = 0;
  }

  create() {
    if (!this.npcDef || this.currentLines.length === 0) {
      this.closeDialogue();
      return;
    }

    const { width, height } = this.scale;

    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, width, height);

    // NPC portrait area
    const portraitSize = 80;
    this.add.graphics()
      .fillStyle(this.npcDef.color, 1)
      .fillCircle(width / 2, height * 0.3, portraitSize / 2)
      .lineStyle(3, 0xffffff, 0.3)
      .strokeCircle(width / 2, height * 0.3, portraitSize / 2);

    this.add.text(width / 2, height * 0.3, this.npcDef.name.charAt(0), {
      fontSize: '36px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5);

    // Dialogue box
    const boxW = Math.min(width - 40, 600);
    const boxH = 180;
    const boxX = width / 2 - boxW / 2;
    const boxY = height * 0.5;

    this.dialogueBox = this.add.graphics();
    this.dialogueBox.fillStyle(0x0f172a, 0.95);
    this.dialogueBox.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    this.dialogueBox.lineStyle(2, 0x334155, 1);
    this.dialogueBox.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);

    // Speaker name
    this.speakerText = this.add.text(boxX + 15, boxY + 10, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#fbbf24',
    });

    // Dialogue text
    this.dialogueText = this.add.text(boxX + 15, boxY + 35, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#e2e8f0',
      wordWrap: { width: boxW - 30 },
      lineSpacing: 4,
    });

    // Choices container
    this.choicesContainer = this.add.container(boxX + 15, boxY + 80);

    // Continue prompt
    this.continuePrompt = this.add.text(boxX + boxW - 15, boxY + boxH - 20, '[Click to continue]', {
      fontSize: '11px', fontFamily: 'monospace', color: '#64748b',
    }).setOrigin(1, 0.5);

    this.tweens.add({
      targets: this.continuePrompt,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Click to advance
    this.input.on('pointerdown', () => {
      if (this.choicesContainer.length > 0) return; // Don't advance if choices shown
      this.advanceDialogue();
    });

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ENTER', () => {
        if (this.choicesContainer.length > 0) return;
        this.advanceDialogue();
      });
      this.input.keyboard.on('keydown-SPACE', () => {
        if (this.choicesContainer.length > 0) return;
        this.advanceDialogue();
      });
      this.input.keyboard.on('keydown-ESC', () => this.closeDialogue());
    }

    this.showCurrentLine();
  }

  private getDialogueKey(npcId: string): string {
    // Context-aware dialogue selection
    switch (npcId) {
      case 'faction_guide':
        return this.gs.factionId ? 'already_joined' : 'default';
      case 'elder_villager': {
        const mainQuestDone = this.gs.completedQuests.includes('mq_01');
        if (mainQuestDone) return 'quest_complete';
        const accepted = this.gs.choices.find(c => c.key === 'hero_response');
        if (accepted) return 'accepted';
        return 'default';
      }
      case 'panicked_villager': {
        const defended = this.gs.choices.find(c => c.key === 'village_defense_1' && c.value === 'defend');
        if (defended) return 'defended';
        return 'default';
      }
      case 'captured_piglin': {
        const freed = this.gs.choices.find(c => c.key === 'nether_mercy' && c.value === 'freed');
        if (freed) return 'freed';
        const left = this.gs.choices.find(c => c.key === 'nether_mercy' && c.value === 'left');
        if (left) return 'left';
        return 'default';
      }
      default:
        return 'default';
    }
  }

  private showCurrentLine() {
    if (this.lineIndex >= this.currentLines.length) {
      this.closeDialogue();
      return;
    }

    const line = this.currentLines[this.lineIndex];
    this.speakerText.setText(line.speaker);
    this.dialogueText.setText(line.text);

    // Clear choices
    this.choicesContainer.removeAll(true);

    if (line.choices && line.choices.length > 0) {
      this.continuePrompt.setVisible(false);
      line.choices.forEach((choice, i) => {
        const txt = this.add.text(0, i * 28, `> ${choice.text}`, {
          fontSize: '13px', fontFamily: 'monospace', color: '#a78bfa',
        }).setInteractive();

        txt.on('pointerover', () => txt.setColor('#c4b5fd'));
        txt.on('pointerout', () => txt.setColor('#a78bfa'));
        txt.on('pointerdown', () => this.selectChoice(choice));

        this.choicesContainer.add(txt);
      });
    } else {
      this.continuePrompt.setVisible(true);
    }
  }

  private advanceDialogue() {
    this.lineIndex++;
    this.showCurrentLine();
  }

  private selectChoice(choice: { text: string; choiceKey?: string; choiceValue?: string; nextDialogue?: string; action?: string }) {
    // Record choice
    if (choice.choiceKey && choice.choiceValue) {
      this.gs.recordChoice(choice.choiceKey, choice.choiceValue);
    }

    // Handle actions
    if (choice.action) {
      this.handleAction(choice.action, choice.choiceValue);
    }

    // Navigate to next dialogue or close
    if (choice.nextDialogue) {
      const nextLines = this.npcDef.dialogues[choice.nextDialogue];
      if (nextLines) {
        this.currentLines = nextLines;
        this.lineIndex = 0;
        this.showCurrentLine();
        return;
      }
    }

    // Advance past current line
    this.advanceDialogue();
  }

  private handleAction(action: string, value?: string) {
    switch (action) {
      case 'open_shop':
        // Close dialogue and open shop
        this.time.delayedCall(200, () => {
          this.scene.stop();
          this.scene.launch('InventoryScene', {
            mode: 'shop',
            shopItems: this.npcDef.shopItems || [],
            returnScene: this.returnScene,
          });
        });
        break;

      case 'join_faction':
        if (value && FACTIONS[value]) {
          this.gs.factionId = value;
          this.gs.factionName = FACTIONS[value].name;
        }
        break;

      case 'open_enchant':
        // Simple enchant: spend lapis to boost weapon
        this.handleEnchant();
        break;

      case 'start_defense':
        // Could trigger a special combat or quest event
        this.gs.startQuest('sq_01');
        break;

      case 'free_piglin':
        // Choice already recorded above
        break;
    }
  }

  private handleEnchant() {
    const lapis = this.gs.inventory.find(i => i.id === 'lapis_lazuli');
    if (!lapis || lapis.quantity < 1) {
      this.dialogueText.setText('You need lapis lazuli for enchanting!');
      this.choicesContainer.removeAll(true);
      this.continuePrompt.setVisible(true);
      return;
    }

    // Simple enchant: +5 attack to equipped weapon
    if (this.gs.equipment.weapon) {
      lapis.quantity--;
      if (lapis.quantity <= 0) {
        this.gs.inventory = this.gs.inventory.filter(i => i.id !== 'lapis_lazuli');
      }
      // We'll just boost attack stat directly as a simplification
      this.gs.player.stats.attack += 3;
      this.dialogueText.setText('Your weapon glows with power! (+3 ATK)');
    } else {
      this.dialogueText.setText('You need a weapon equipped first!');
    }
    this.choicesContainer.removeAll(true);
    this.continuePrompt.setVisible(true);
  }

  private closeDialogue() {
    this.scene.stop();
    this.scene.resume(this.returnScene);
  }
}
