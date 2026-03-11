import { Stats, CLASSES, getXpForLevel, applyGrowth } from '../data/classes';
import { FACTIONS } from '../data/factions';
import { ItemDef, ITEMS } from '../data/items';
import { getSpellsForClass, getSpellsForFaction, SpellDef } from '../data/spells';
import { QuestDef, QUESTS } from '../data/quests';

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface Equipment {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

export interface ActiveQuest {
  questId: string;
  objectives: Record<string, number>;
}

export interface Choice {
  key: string;
  value: string;
  timestamp: number;
}

export interface PlayerState {
  name: string;
  avatar: 'steve' | 'alex';
  classId: string;
  factionId: string | null;
  level: number;
  xp: number;
  currentHp: number;
  currentSp: number;
  maxSp: number;
  stats: Stats;
  inventory: InventoryItem[];
  equipment: Equipment;
  gold: number;
}

export interface GameSaveData {
  player: PlayerState;
  activeQuests: ActiveQuest[];
  completedQuests: string[];
  choices: Choice[];
  currentArea: string;
  areasUnlocked: string[];
  defeatedBosses: string[];
  defeatedEnemyPositions: string[];
  playTime: number;
  saveSlot: number;
  timestamp: number;
  version: number;
}

const SAVE_VERSION = 1;

export class GameState {
  player!: PlayerState;
  activeQuests: ActiveQuest[] = [];
  completedQuests: string[] = [];
  choices: Choice[] = [];
  currentArea: string = 'hub';
  areasUnlocked: string[] = ['hub', 'forest'];
  defeatedBosses: string[] = [];
  defeatedEnemyPositions: string[] = [];
  playTime: number = 0;
  saveSlot: number = 0;
  playerX: number = 0;
  playerY: number = 0;

  private static instance: GameState;

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  // Convenience accessors used by scenes
  get avatar() { return this.player?.avatar || 'steve'; }
  get classId() { return this.player?.classId || ''; }
  get className() { return CLASSES[this.classId]?.name || ''; }
  get factionId() { return this.player?.factionId || null; }
  set factionId(v: string | null) { if (this.player) this.player.factionId = v; }
  get factionName() { return this.factionId ? FACTIONS[this.factionId]?.name || '' : ''; }
  set factionName(_v: string) { /* stored via factionId */ }
  get level() { return this.player?.level || 1; }
  get hp() { return this.player?.currentHp || 0; }
  set hp(v: number) { if (this.player) this.player.currentHp = v; }
  get maxHp() { return this.player?.stats.hp || 1; }
  get sp() { return this.player?.currentSp || 0; }
  set sp(v: number) { if (this.player) this.player.currentSp = v; }
  get maxSp() { return this.player?.maxSp || 0; }
  get gold() { return this.player?.gold || 0; }
  set gold(v: number) { if (this.player) this.player.gold = v; }
  get baseStats() { return this.player?.stats || { hp: 1, attack: 1, defense: 1, spellPower: 1, speed: 1 }; }
  get equipment() { return this.player?.equipment || { weapon: null, armor: null, accessory: null }; }

  // Inventory adapters — scenes use {id, quantity} but internal uses {itemId, quantity}
  get inventory(): { id: string; quantity: number }[] {
    return (this.player?.inventory || []).map(i => ({ id: i.itemId, quantity: i.quantity }));
  }
  set inventory(items: { id: string; quantity: number }[]) {
    if (this.player) {
      this.player.inventory = items.map(i => ({ itemId: i.id, quantity: i.quantity }));
    }
  }

  // Defeated enemies as a Set-like interface
  get defeatedEnemies(): Set<string> {
    const set = new Set(this.defeatedEnemyPositions);
    const self = this;
    return {
      has: (k: string) => set.has(k),
      add: (k: string) => { if (!self.defeatedEnemyPositions.includes(k)) self.defeatedEnemyPositions.push(k); return set.add(k); },
      delete: (k: string) => { self.defeatedEnemyPositions = self.defeatedEnemyPositions.filter(v => v !== k); return set.delete(k); },
      get size() { return set.size; },
      forEach: set.forEach.bind(set),
      [Symbol.iterator]: set[Symbol.iterator].bind(set),
    } as Set<string>;
  }

  equip(itemId: string) { return this.equipItem(itemId); }

  recordChoice(key: string, value: string) { this.addChoice(key, value); }

  initNewGame(avatar: 'steve' | 'alex', classId: string) {
    const classDef = CLASSES[classId];
    if (!classDef) throw new Error(`Unknown class: ${classId}`);

    this.player = {
      name: avatar === 'steve' ? 'Steve' : 'Alex',
      avatar,
      classId,
      factionId: null,
      level: 1,
      xp: 0,
      currentHp: classDef.baseStats.hp,
      currentSp: 20 + classDef.baseStats.spellPower,
      maxSp: 20 + classDef.baseStats.spellPower,
      stats: { ...classDef.baseStats },
      inventory: [
        { itemId: 'wooden_sword', quantity: 1 },
        { itemId: 'leather_armor', quantity: 1 },
        { itemId: 'bread', quantity: 5 },
        { itemId: 'healing_potion', quantity: 2 },
      ],
      equipment: { weapon: 'wooden_sword', armor: 'leather_armor', accessory: null },
      gold: 50,
    };

    if (classDef.id === 'berserker') {
      this.player.stats.hp = Math.floor(this.player.stats.hp * 1.2);
      this.player.currentHp = this.player.stats.hp;
    }

    this.activeQuests = [];
    this.completedQuests = [];
    this.choices = [];
    this.currentArea = 'hub';
    this.areasUnlocked = ['hub', 'forest'];
    this.defeatedBosses = [];
    this.defeatedEnemyPositions = [];
    this.playTime = 0;
  }

  getEffectiveStats(): Stats {
    const base = { ...this.player.stats };
    const eq = this.player.equipment;
    for (const slot of ['weapon', 'armor', 'accessory'] as const) {
      const itemId = eq[slot];
      if (itemId) {
        const item = ITEMS[itemId];
        if (item?.stats) {
          if (item.stats.attack) base.attack += item.stats.attack;
          if (item.stats.defense) base.defense += item.stats.defense;
          if (item.stats.spellPower) base.spellPower += item.stats.spellPower;
          if (item.stats.speed) base.speed += item.stats.speed;
          if (item.stats.hp) base.hp += item.stats.hp;
        }
      }
    }
    return base;
  }

  getAvailableSpells(): SpellDef[] {
    const classSpells = getSpellsForClass(this.player.classId, this.player.level);
    const factionSpells = this.player.factionId
      ? getSpellsForFaction(this.player.factionId, this.player.level) : [];
    return [...classSpells, ...factionSpells];
  }

  addXp(amount: number): { leveledUp: boolean; newLevel: number } {
    this.player.xp += amount;
    const xpNeeded = getXpForLevel(this.player.level + 1);
    if (this.player.xp >= xpNeeded) {
      this.player.xp -= xpNeeded;
      this.player.level++;
      const classDef = CLASSES[this.player.classId];
      this.player.stats = applyGrowth(classDef.baseStats, classDef.growthRates, this.player.level - 1);
      if (classDef.id === 'berserker') {
        this.player.stats.hp = Math.floor(this.player.stats.hp * 1.2);
      }
      this.player.currentHp = this.player.stats.hp;
      this.player.maxSp = 20 + this.player.stats.spellPower;
      this.player.currentSp = this.player.maxSp;
      return { leveledUp: true, newLevel: this.player.level };
    }
    return { leveledUp: false, newLevel: this.player.level };
  }

  addItem(itemId: string, quantity: number = 1) {
    const existing = this.player.inventory.find(i => i.itemId === itemId);
    if (existing) { existing.quantity += quantity; }
    else { this.player.inventory.push({ itemId, quantity }); }
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.player.inventory.find(i => i.itemId === itemId);
    if (!existing || existing.quantity < quantity) return false;
    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this.player.inventory = this.player.inventory.filter(i => i.itemId !== itemId);
    }
    return true;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.player.inventory.find(i => i.itemId === itemId);
    return !!existing && existing.quantity >= quantity;
  }

  equipItem(itemId: string): boolean {
    const item = ITEMS[itemId];
    if (!item?.equipSlot) return false;
    if (!this.hasItem(itemId)) return false;
    if (item.levelReq && this.player.level < item.levelReq) return false;

    const currentEquipped = this.player.equipment[item.equipSlot];
    if (currentEquipped) {
      this.addItem(currentEquipped);
    }
    this.removeItem(itemId);
    this.player.equipment[item.equipSlot] = itemId;
    return true;
  }

  joinFaction(factionId: string) {
    if (!FACTIONS[factionId]) return;
    this.player.factionId = factionId;
    this.addChoice('faction_choice', factionId);
  }

  addChoice(key: string, value: string) {
    this.choices.push({ key, value, timestamp: Date.now() });
  }

  getChoice(key: string): string | undefined {
    const found = this.choices.filter(c => c.key === key);
    return found.length > 0 ? found[found.length - 1].value : undefined;
  }

  startQuest(questId: string) {
    const quest = QUESTS[questId];
    if (!quest) return;
    if (this.activeQuests.find(q => q.questId === questId)) return;
    if (this.completedQuests.includes(questId)) return;
    const objectives: Record<string, number> = {};
    quest.objectives.forEach(o => { objectives[o.id] = 0; });
    this.activeQuests.push({ questId, objectives });
  }

  updateQuestProgress(objectiveType: string, target: string, amount: number = 1) {
    for (const aq of this.activeQuests) {
      const quest = QUESTS[aq.questId];
      if (!quest) continue;
      for (const obj of quest.objectives) {
        if (obj.type === objectiveType && (obj.target === target || obj.target === `any_${this.currentArea}`)) {
          aq.objectives[obj.id] = Math.min((aq.objectives[obj.id] || 0) + amount, obj.required);
        }
      }
    }
  }

  checkQuestCompletion(): QuestDef[] {
    const completed: QuestDef[] = [];
    this.activeQuests = this.activeQuests.filter(aq => {
      const quest = QUESTS[aq.questId];
      if (!quest) return false;
      const allDone = quest.objectives.every(obj => (aq.objectives[obj.id] || 0) >= obj.required);
      if (allDone) {
        this.completedQuests.push(aq.questId);
        if (quest.reward.xp) this.addXp(quest.reward.xp);
        if (quest.reward.gold) this.player.gold += quest.reward.gold;
        if (quest.reward.items) {
          quest.reward.items.forEach(ri => this.addItem(ri.itemId, ri.quantity));
        }
        completed.push(quest);
        return false;
      }
      return true;
    });
    return completed;
  }

  unlockArea(areaId: string) {
    if (!this.areasUnlocked.includes(areaId)) {
      this.areasUnlocked.push(areaId);
    }
  }

  defeatBoss(bossId: string) {
    if (!this.defeatedBosses.includes(bossId)) {
      this.defeatedBosses.push(bossId);
    }
  }

  markEnemyDefeated(areaId: string, x: number, y: number) {
    const key = `${areaId}_${x}_${y}`;
    if (!this.defeatedEnemyPositions.includes(key)) {
      this.defeatedEnemyPositions.push(key);
    }
  }

  isEnemyDefeated(areaId: string, x: number, y: number): boolean {
    return this.defeatedEnemyPositions.includes(`${areaId}_${x}_${y}`);
  }

  healPlayer(amount: number) {
    this.player.currentHp = Math.min(this.player.currentHp + amount, this.player.stats.hp);
  }

  restoreSp(amount: number) {
    this.player.currentSp = Math.min(this.player.currentSp + amount, this.player.maxSp);
  }

  fullHeal() {
    this.player.currentHp = this.player.stats.hp;
    this.player.currentSp = this.player.maxSp;
  }

  getEnding(): string {
    const faction = this.player.factionId || 'villagers';
    const heroicChoices = this.choices.filter(c =>
      (c.key === 'village_defense_1' && c.value === 'defend') ||
      (c.key === 'nether_mercy' && c.value === 'freed') ||
      (c.key === 'hero_response' && c.value === 'brave')
    ).length;
    const darkChoices = this.choices.filter(c =>
      (c.key === 'village_defense_1' && c.value === 'ignore') ||
      (c.key === 'nether_mercy' && c.value === 'left')
    ).length;

    if (faction === 'nether_legion' && darkChoices >= 2) return 'dark_ruler';
    if (faction === 'ender_watchers' && darkChoices >= 1) return 'dark_truth';
    if (faction === 'villagers' && heroicChoices >= 2) return 'sacrifice';
    if (faction === 'ender_watchers' && heroicChoices >= 2) return 'transcendence';
    if (faction === 'redstone' && heroicChoices >= 1) return 'engineer';
    if (heroicChoices > darkChoices) return 'hero';
    return 'peace';
  }

  toSaveData(slot: number): GameSaveData {
    return {
      player: { ...this.player, inventory: [...this.player.inventory], equipment: { ...this.player.equipment } },
      activeQuests: this.activeQuests.map(q => ({ ...q, objectives: { ...q.objectives } })),
      completedQuests: [...this.completedQuests],
      choices: [...this.choices],
      currentArea: this.currentArea,
      areasUnlocked: [...this.areasUnlocked],
      defeatedBosses: [...this.defeatedBosses],
      defeatedEnemyPositions: [...this.defeatedEnemyPositions],
      playTime: this.playTime,
      saveSlot: slot,
      timestamp: Date.now(),
      version: SAVE_VERSION,
    };
  }

  loadSaveData(data: GameSaveData) {
    this.player = { ...data.player, inventory: [...data.player.inventory], equipment: { ...data.player.equipment } };
    this.activeQuests = data.activeQuests;
    this.completedQuests = data.completedQuests;
    this.choices = data.choices;
    this.currentArea = data.currentArea;
    this.areasUnlocked = data.areasUnlocked;
    this.defeatedBosses = data.defeatedBosses;
    this.defeatedEnemyPositions = data.defeatedEnemyPositions || [];
    this.playTime = data.playTime;
    this.saveSlot = data.saveSlot;
  }
}
