import { GameState } from '../core/GameState';
import { ITEMS, ItemDef } from '../data/items';
import { getSpellsForClass, getSpellsForFaction } from '../data/spells';

type Tab = 'equip' | 'items' | 'spells' | 'shop';

export class InventoryScene extends Phaser.Scene {
  private gs!: GameState;
  private currentTab: Tab = 'equip';
  private returnScene = 'ExplorationScene';
  private shopMode = false;
  private shopItems: string[] = [];
  private contentContainer!: Phaser.GameObjects.Container;
  private tabButtons: Phaser.GameObjects.Text[] = [];
  private detailText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'InventoryScene' });
  }

  init(data?: { mode?: string; shopItems?: string[]; returnScene?: string }) {
    this.shopMode = data?.mode === 'shop';
    this.shopItems = data?.shopItems || [];
    this.returnScene = data?.returnScene || 'ExplorationScene';
    this.currentTab = this.shopMode ? 'shop' : 'equip';
  }

  create() {
    this.gs = GameState.getInstance();
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 20, this.shopMode ? 'Shop' : 'Inventory', {
      fontSize: '24px', fontFamily: 'monospace', color: '#4ade80',
    }).setOrigin(0.5);

    // Gold display
    this.goldText = this.add.text(width - 15, 20, `Gold: ${this.gs.gold}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#fbbf24',
    }).setOrigin(1, 0);

    // Tabs
    const tabs: { label: string; key: Tab }[] = this.shopMode
      ? [{ label: 'Shop', key: 'shop' }, { label: 'Items', key: 'items' }, { label: 'Equip', key: 'equip' }]
      : [{ label: 'Equip', key: 'equip' }, { label: 'Items', key: 'items' }, { label: 'Spells', key: 'spells' }];

    const tabY = 55;
    const tabW = Math.min(100, width / tabs.length - 10);

    tabs.forEach((tab, i) => {
      const x = 20 + i * (tabW + 10) + tabW / 2;
      const txt = this.add.text(x, tabY, tab.label, {
        fontSize: '14px', fontFamily: 'monospace', color: '#94a3b8',
        backgroundColor: '#1e1b4b',
        padding: { x: 10, y: 6 },
      }).setOrigin(0.5).setInteractive();

      txt.on('pointerdown', () => {
        this.currentTab = tab.key;
        this.refreshContent();
        this.updateTabHighlight();
      });

      this.tabButtons.push(txt);
    });

    // Content area
    this.contentContainer = this.add.container(0, 0);

    // Detail panel
    this.detailText = this.add.text(15, height - 80, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8',
      wordWrap: { width: width - 30 },
    });

    // Close button
    const closeBtn = this.add.text(width / 2, height - 25, '[ Close ]', {
      fontSize: '16px', fontFamily: 'monospace', color: '#a78bfa',
    }).setOrigin(0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.closeInventory());

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.closeInventory());
      this.input.keyboard.on('keydown-I', () => this.closeInventory());
    }

    this.updateTabHighlight();
    this.refreshContent();
  }

  private updateTabHighlight() {
    this.tabButtons.forEach(btn => {
      const isActive = btn.text.toLowerCase() === this.currentTab ||
        (this.currentTab === 'shop' && btn.text === 'Shop') ||
        (this.currentTab === 'equip' && btn.text === 'Equip') ||
        (this.currentTab === 'items' && btn.text === 'Items') ||
        (this.currentTab === 'spells' && btn.text === 'Spells');
      btn.setColor(isActive ? '#4ade80' : '#94a3b8');
    });
  }

  private refreshContent() {
    this.contentContainer.removeAll(true);
    this.detailText.setText('');
    this.goldText.setText(`Gold: ${this.gs.gold}`);

    switch (this.currentTab) {
      case 'equip': this.showEquipment(); break;
      case 'items': this.showItems(); break;
      case 'spells': this.showSpells(); break;
      case 'shop': this.showShop(); break;
    }
  }

  private showEquipment() {
    const { width } = this.scale;
    const startY = 90;
    const slots = [
      { label: 'Weapon', slot: 'weapon' as const },
      { label: 'Armor', slot: 'armor' as const },
      { label: 'Accessory', slot: 'accessory' as const },
    ];

    // Current equipment
    slots.forEach((s, i) => {
      const y = startY + i * 50;
      const equipped = this.gs.equipment[s.slot];
      const item = equipped ? ITEMS[equipped] : null;

      this.contentContainer.add(
        this.add.text(20, y, s.label + ':', {
          fontSize: '13px', fontFamily: 'monospace', color: '#64748b',
        })
      );

      const itemName = item ? item.name : '(empty)';
      const itemText = this.add.text(120, y, itemName, {
        fontSize: '13px', fontFamily: 'monospace', color: item ? '#e2e8f0' : '#475569',
      }).setInteractive();

      itemText.on('pointerover', () => {
        if (item) this.detailText.setText(`${item.name}: ${item.description}\n${this.getStatString(item)}`);
      });

      this.contentContainer.add(itemText);
    });

    // Stats summary
    const stats = this.gs.getEffectiveStats();
    const statsY = startY + slots.length * 50 + 20;
    this.contentContainer.add(
      this.add.text(20, statsY, 'Stats (with equipment):', {
        fontSize: '13px', fontFamily: 'monospace', color: '#fbbf24',
      })
    );
    this.contentContainer.add(
      this.add.text(20, statsY + 20, [
        `HP: ${stats.hp}`,
        `ATK: ${stats.attack}  DEF: ${stats.defense}`,
        `MAG: ${stats.spellPower}  SPD: ${stats.speed}`,
      ].join('\n'), {
        fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8',
        lineSpacing: 3,
      })
    );

    // Equippable items from inventory
    const equipY = statsY + 80;
    this.contentContainer.add(
      this.add.text(20, equipY, 'Available to equip:', {
        fontSize: '13px', fontFamily: 'monospace', color: '#60a5fa',
      })
    );

    const equippable = this.gs.inventory.filter(inv => {
      const item = ITEMS[inv.id];
      return item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory');
    });

    equippable.forEach((inv, i) => {
      const item = ITEMS[inv.id];
      const txt = this.add.text(30, equipY + 22 + i * 22, `${item.name}`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1',
      }).setInteractive();

      txt.on('pointerover', () => {
        this.detailText.setText(`${item.name}: ${item.description}\n${this.getStatString(item)}`);
        txt.setColor('#ffffff');
      });
      txt.on('pointerout', () => txt.setColor('#cbd5e1'));
      txt.on('pointerdown', () => {
        this.gs.equip(inv.id);
        this.refreshContent();
      });

      this.contentContainer.add(txt);
    });
  }

  private showItems() {
    const startY = 90;
    const consumables = this.gs.inventory.filter(inv => {
      const item = ITEMS[inv.id];
      return item && (item.type === 'consumable' || item.type === 'material' || item.type === 'key');
    });

    if (consumables.length === 0) {
      this.contentContainer.add(
        this.add.text(20, startY, 'No items in inventory.', {
          fontSize: '13px', fontFamily: 'monospace', color: '#475569',
        })
      );
      return;
    }

    consumables.forEach((inv, i) => {
      const item = ITEMS[inv.id];
      const txt = this.add.text(20, startY + i * 24, `${item.name} x${inv.quantity}`, {
        fontSize: '13px', fontFamily: 'monospace',
        color: item.type === 'key' ? '#fbbf24' : '#e2e8f0',
      }).setInteractive();

      txt.on('pointerover', () => {
        this.detailText.setText(`${item.name}: ${item.description}`);
        txt.setColor('#ffffff');
      });
      txt.on('pointerout', () => txt.setColor(item.type === 'key' ? '#fbbf24' : '#e2e8f0'));

      // Use consumables outside combat
      if (item.type === 'consumable') {
        txt.on('pointerdown', () => {
          this.useItem(inv.id);
          this.refreshContent();
        });
      }

      this.contentContainer.add(txt);
    });
  }

  private showSpells() {
    const startY = 90;
    const classSpells = getSpellsForClass(this.gs.classId, this.gs.level);
    const factionSpells = getSpellsForFaction(this.gs.factionId || '', this.gs.level);
    const allSpells = [...classSpells, ...factionSpells];

    if (allSpells.length === 0) {
      this.contentContainer.add(
        this.add.text(20, startY, 'No spells learned yet.', {
          fontSize: '13px', fontFamily: 'monospace', color: '#475569',
        })
      );
      return;
    }

    allSpells.forEach((spell, i) => {
      const txt = this.add.text(20, startY + i * 24, `${spell.name} (${spell.spCost} SP)`, {
        fontSize: '13px', fontFamily: 'monospace', color: '#a78bfa',
      }).setInteractive();

      txt.on('pointerover', () => {
        this.detailText.setText(
          `${spell.name} - ${spell.description}\nSP Cost: ${spell.spCost} | Target: ${spell.target}`
        );
      });

      this.contentContainer.add(txt);
    });
  }

  private showShop() {
    const startY = 90;

    this.contentContainer.add(
      this.add.text(20, startY - 15, 'Buy:', { fontSize: '14px', fontFamily: 'monospace', color: '#fbbf24' })
    );

    this.shopItems.forEach((itemId, i) => {
      const item = ITEMS[itemId];
      if (!item) return;

      const canAfford = this.gs.gold >= item.buyPrice;
      const txt = this.add.text(20, startY + 8 + i * 24, `${item.name} - ${item.buyPrice}g`, {
        fontSize: '12px', fontFamily: 'monospace',
        color: canAfford ? '#e2e8f0' : '#555555',
      }).setInteractive();

      txt.on('pointerover', () => {
        this.detailText.setText(`${item.name}: ${item.description}\n${this.getStatString(item)}`);
        if (canAfford) txt.setColor('#4ade80');
      });
      txt.on('pointerout', () => txt.setColor(canAfford ? '#e2e8f0' : '#555555'));

      if (canAfford) {
        txt.on('pointerdown', () => {
          this.gs.gold -= item.buyPrice;
          const existing = this.gs.inventory.find(inv => inv.id === itemId);
          if (existing) existing.quantity++;
          else this.gs.inventory.push({ id: itemId, quantity: 1 });
          this.refreshContent();
        });
      }

      this.contentContainer.add(txt);
    });

    // Sell section
    const sellY = startY + 8 + this.shopItems.length * 24 + 25;
    this.contentContainer.add(
      this.add.text(20, sellY, 'Sell:', { fontSize: '14px', fontFamily: 'monospace', color: '#60a5fa' })
    );

    const sellable = this.gs.inventory.filter(inv => {
      const item = ITEMS[inv.id];
      return item && item.type !== 'key' && inv.quantity > 0;
    });

    sellable.forEach((inv, i) => {
      const item = ITEMS[inv.id];
      const sellPrice = Math.floor(item.buyPrice * 0.5);
      const txt = this.add.text(20, sellY + 22 + i * 24, `${item.name} x${inv.quantity} (+${sellPrice}g)`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8',
      }).setInteractive();

      txt.on('pointerover', () => txt.setColor('#fbbf24'));
      txt.on('pointerout', () => txt.setColor('#94a3b8'));
      txt.on('pointerdown', () => {
        this.gs.gold += sellPrice;
        inv.quantity--;
        if (inv.quantity <= 0) {
          this.gs.inventory = this.gs.inventory.filter(i => i.quantity > 0);
        }
        this.refreshContent();
      });

      this.contentContainer.add(txt);
    });
  }

  private useItem(itemId: string) {
    const item = ITEMS[itemId];
    if (!item || (!item.healAmount && !item.spellRestore)) return;

    const inv = this.gs.inventory.find(i => i.id === itemId);
    if (!inv || inv.quantity <= 0) return;

    // Apply effect
    if (item.healAmount) {
      this.gs.hp = Math.min(this.gs.maxHp, this.gs.hp + item.healAmount);
    }
    if (item.spellRestore) {
      this.gs.sp = Math.min(this.gs.maxSp, this.gs.sp + item.spellRestore);
    }

    inv.quantity--;
    if (inv.quantity <= 0) {
      this.gs.inventory = this.gs.inventory.filter(i => i.quantity > 0);
    }

    this.detailText.setText(`Used ${item.name}!`);
  }

  private getStatString(item: ItemDef): string {
    if (!item.stats) return '';
    const parts: string[] = [];
    if (item.stats.attack) parts.push(`ATK+${item.stats.attack}`);
    if (item.stats.defense) parts.push(`DEF+${item.stats.defense}`);
    if (item.stats.spellPower) parts.push(`MAG+${item.stats.spellPower}`);
    if (item.stats.speed) parts.push(`SPD+${item.stats.speed}`);
    if (item.stats.hp) parts.push(`HP+${item.stats.hp}`);
    return parts.join(' | ');
  }

  private closeInventory() {
    this.scene.stop();
    this.scene.resume(this.returnScene);
  }
}
