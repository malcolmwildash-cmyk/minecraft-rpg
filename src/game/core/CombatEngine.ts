import { Stats } from '../data/classes';
import { EnemyDef, getScaledEnemy } from '../data/enemies';
import { SpellDef } from '../data/spells';
import { ITEMS } from '../data/items';
import { GameState } from './GameState';

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  stats: Stats;
  currentHp: number;
  maxHp: number;
  currentSp: number;
  maxSp: number;
  speed: number;
  statusEffects: StatusEffect[];
  color: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  turnsRemaining: number;
  type: 'buff' | 'debuff';
  statMod?: Partial<Stats>;
  damagePerTurn?: number;
  healPerTurn?: number;
  dodge?: boolean;
  stunned?: boolean;
  thorns?: number;
  parry?: boolean;
  vulnerable?: number;
}

export interface CombatAction {
  type: 'fight' | 'spell' | 'item' | 'build' | 'run';
  targetIndex?: number;
  spellId?: string;
  itemId?: string;
  buildType?: 'wall' | 'trap' | 'cover';
}

export interface CombatResult {
  actorName: string;
  action: string;
  damage?: number;
  healing?: number;
  message: string;
  targetDied?: boolean;
  statusApplied?: string;
}

export interface CombatState {
  allies: Combatant[];
  enemies: Combatant[];
  turnOrder: Combatant[];
  currentTurnIndex: number;
  round: number;
  log: CombatResult[];
  isOver: boolean;
  playerWon: boolean;
  canRun: boolean;
  buildWallHp: number;
  trapDamage: number;
  coverReduction: number;
}

export class CombatEngine {
  state!: CombatState;

  initCombat(enemyDefs: EnemyDef[], isBossFight: boolean = false): CombatState {
    const gs = GameState.getInstance();
    const pStats = gs.getEffectiveStats();

    const playerCombatant: Combatant = {
      id: 'player',
      name: gs.player.name,
      isPlayer: true,
      stats: { ...pStats },
      currentHp: gs.player.currentHp,
      maxHp: pStats.hp,
      currentSp: gs.player.currentSp,
      maxSp: gs.player.maxSp,
      speed: pStats.speed,
      statusEffects: [],
      color: 0x55cdfc,
    };

    const enemies: Combatant[] = enemyDefs.map((def, i) => {
      const scaled = getScaledEnemy(def, gs.player.level);
      return {
        id: `enemy_${i}`,
        name: scaled.name,
        isPlayer: false,
        stats: { ...scaled.stats },
        currentHp: scaled.stats.hp,
        maxHp: scaled.stats.hp,
        currentSp: 50,
        maxSp: 50,
        speed: scaled.stats.speed,
        statusEffects: [],
        color: scaled.color,
      };
    });

    const allCombatants = [playerCombatant, ...enemies];
    const turnOrder = [...allCombatants].sort((a, b) => b.speed - a.speed);

    this.state = {
      allies: [playerCombatant],
      enemies,
      turnOrder,
      currentTurnIndex: 0,
      round: 1,
      log: [],
      isOver: false,
      playerWon: false,
      canRun: !isBossFight,
      buildWallHp: 0,
      trapDamage: 0,
      coverReduction: 0,
    };

    return this.state;
  }

  getCurrentCombatant(): Combatant {
    return this.state.turnOrder[this.state.currentTurnIndex];
  }

  isPlayerTurn(): boolean {
    return this.getCurrentCombatant().isPlayer;
  }

  executePlayerAction(action: CombatAction): CombatResult[] {
    const results: CombatResult[] = [];
    const player = this.state.allies[0];

    switch (action.type) {
      case 'fight': {
        const target = this.state.enemies[action.targetIndex || 0];
        if (!target || target.currentHp <= 0) break;
        const dmg = this.calcDamage(player.stats.attack, target.stats.defense, target);
        target.currentHp -= dmg;
        results.push({
          actorName: player.name, action: 'Attack',
          damage: dmg, message: `${player.name} attacks ${target.name} for ${dmg} damage!`,
          targetDied: target.currentHp <= 0,
        });
        // Dark Pact passive (Wither Pact)
        const gs = GameState.getInstance();
        if (gs.player.classId === 'wither_pact') {
          const heal = Math.floor(dmg * 0.15);
          player.currentHp = Math.min(player.currentHp + heal, player.maxHp);
          results.push({ actorName: player.name, action: 'Dark Pact', healing: heal, message: `Dark Pact heals ${heal} HP!` });
        }
        break;
      }
      case 'spell': {
        if (action.spellId) {
          const spellResults = this.castSpell(player, action.spellId, action.targetIndex || 0);
          results.push(...spellResults);
        }
        break;
      }
      case 'item': {
        if (action.itemId) {
          const itemResults = this.useItem(player, action.itemId, action.targetIndex || 0);
          results.push(...itemResults);
        }
        break;
      }
      case 'build': {
        switch (action.buildType) {
          case 'wall':
            this.state.buildWallHp = 30 + player.stats.defense;
            results.push({ actorName: player.name, action: 'Build Wall', message: `${player.name} builds a cobblestone wall! (${this.state.buildWallHp} HP)` });
            break;
          case 'trap':
            this.state.trapDamage = 20 + Math.floor(player.stats.attack * 0.5);
            results.push({ actorName: player.name, action: 'Set Trap', message: `${player.name} sets a trap! (${this.state.trapDamage} damage)` });
            break;
          case 'cover':
            this.state.coverReduction = 0.3;
            results.push({ actorName: player.name, action: 'Create Cover', message: `${player.name} creates cover! Incoming damage reduced by 30%.` });
            break;
        }
        break;
      }
      case 'run': {
        if (this.state.canRun) {
          const runChance = 0.5 + (player.speed / 100);
          if (Math.random() < runChance) {
            this.state.isOver = true;
            this.state.playerWon = false;
            results.push({ actorName: player.name, action: 'Run', message: 'Got away safely!' });
          } else {
            results.push({ actorName: player.name, action: 'Run', message: 'Couldn\'t escape!' });
          }
        } else {
          results.push({ actorName: player.name, action: 'Run', message: 'Can\'t run from a boss fight!' });
        }
        break;
      }
    }

    this.state.log.push(...results);
    this.advanceTurn();
    return results;
  }

  executeEnemyTurn(): CombatResult[] {
    const results: CombatResult[] = [];
    const enemy = this.getCurrentCombatant();
    if (enemy.currentHp <= 0) {
      this.advanceTurn();
      return results;
    }

    // Check stun
    const stunEffect = enemy.statusEffects.find(e => e.stunned);
    if (stunEffect) {
      results.push({ actorName: enemy.name, action: 'Stunned', message: `${enemy.name} is stunned!` });
      this.state.log.push(...results);
      this.advanceTurn();
      return results;
    }

    // Check trap
    if (this.state.trapDamage > 0) {
      enemy.currentHp -= this.state.trapDamage;
      results.push({
        actorName: enemy.name, action: 'Trap', damage: this.state.trapDamage,
        message: `${enemy.name} triggers a trap for ${this.state.trapDamage} damage!`,
        targetDied: enemy.currentHp <= 0,
      });
      this.state.trapDamage = 0;
      if (enemy.currentHp <= 0) {
        this.state.log.push(...results);
        this.advanceTurn();
        return results;
      }
    }

    // Enemy AI: attack player
    const player = this.state.allies[0];

    // Check player dodge
    const dodgeEffect = player.statusEffects.find(e => e.dodge);
    if (dodgeEffect) {
      results.push({ actorName: enemy.name, action: 'Attack', message: `${enemy.name} attacks but ${player.name} dodges!` });
      this.state.log.push(...results);
      this.advanceTurn();
      return results;
    }

    // Check parry
    const parryEffect = player.statusEffects.find(e => e.parry);

    let rawDamage = this.calcDamage(enemy.stats.attack, player.stats.defense, player);

    // Wall absorbs damage
    if (this.state.buildWallHp > 0) {
      const wallAbsorb = Math.min(rawDamage, this.state.buildWallHp);
      this.state.buildWallHp -= wallAbsorb;
      rawDamage -= wallAbsorb;
      if (wallAbsorb > 0) {
        results.push({ actorName: 'Wall', action: 'Block', message: `The wall absorbs ${wallAbsorb} damage!${this.state.buildWallHp <= 0 ? ' The wall crumbles!' : ''}` });
      }
    }

    // Cover reduces damage
    if (this.state.coverReduction > 0) {
      rawDamage = Math.floor(rawDamage * (1 - this.state.coverReduction));
    }

    if (rawDamage > 0) {
      player.currentHp -= rawDamage;
      results.push({
        actorName: enemy.name, action: 'Attack',
        damage: rawDamage, message: `${enemy.name} attacks ${player.name} for ${rawDamage} damage!`,
        targetDied: player.currentHp <= 0,
      });
    }

    // Parry counter
    if (parryEffect && rawDamage > 0) {
      const counterDmg = Math.floor(rawDamage * 0.5);
      enemy.currentHp -= counterDmg;
      results.push({ actorName: player.name, action: 'Parry Counter', damage: counterDmg, message: `${player.name} parries and counters for ${counterDmg}!`, targetDied: enemy.currentHp <= 0 });
    }

    // Thorns
    const thornsEffect = player.statusEffects.find(e => e.thorns);
    if (thornsEffect && thornsEffect.thorns && rawDamage > 0) {
      const thornsDmg = Math.floor(enemy.stats.attack * thornsEffect.thorns);
      enemy.currentHp -= thornsDmg;
      results.push({ actorName: player.name, action: 'Thorns', damage: thornsDmg, message: `Thorns deal ${thornsDmg} back!`, targetDied: enemy.currentHp <= 0 });
    }

    this.state.log.push(...results);
    this.advanceTurn();
    return results;
  }

  private castSpell(caster: Combatant, spellId: string, targetIdx: number): CombatResult[] {
    const results: CombatResult[] = [];
    const { SPELLS } = require('../data/spells');
    const spell: SpellDef | undefined = SPELLS[spellId];
    if (!spell) return [{ actorName: caster.name, action: 'Spell', message: 'Spell fizzles!' }];

    if (caster.currentSp < spell.spCost) {
      return [{ actorName: caster.name, action: spell.name, message: 'Not enough spell power!' }];
    }

    // Apply Ender Mage discount
    let cost = spell.spCost;
    const gs = GameState.getInstance();
    if (gs.player.classId === 'ender_mage') cost = Math.floor(cost * 0.8);
    caster.currentSp -= cost;

    if (spell.damage) {
      const isPhysical = ['iron_fist', 'power_strike', 'backstab', 'aimed_shot', 'whirlwind', 'multi_shot', 'poison_blade', 'shadow_step'].includes(spellId);
      const baseStat = isPhysical ? caster.stats.attack : caster.stats.spellPower;

      if (spell.target === 'all_enemies') {
        for (const enemy of this.state.enemies) {
          if (enemy.currentHp <= 0) continue;
          let dmg = Math.floor(baseStat * spell.damage);
          const vuln = enemy.statusEffects.find(e => e.vulnerable);
          if (vuln) dmg = Math.floor(dmg * (1 + (vuln.vulnerable || 0)));
          if (spell.effect?.includes('ignore_defense')) { /* no defense */ }
          else if (spell.effect?.includes('ignore_half_defense')) { dmg = Math.max(1, dmg - Math.floor(enemy.stats.defense * 0.5)); }
          else { dmg = Math.max(1, dmg - enemy.stats.defense); }
          enemy.currentHp -= dmg;
          results.push({ actorName: caster.name, action: spell.name, damage: dmg, message: `${spell.name} hits ${enemy.name} for ${dmg}!`, targetDied: enemy.currentHp <= 0 });
        }
      } else {
        const target = this.state.enemies[targetIdx];
        if (target && target.currentHp > 0) {
          let dmg = Math.floor(baseStat * spell.damage);
          const vuln = target.statusEffects.find(e => e.vulnerable);
          if (vuln) dmg = Math.floor(dmg * (1 + (vuln.vulnerable || 0)));
          if (spell.effect?.includes('ignore_defense')) { /* no defense */ }
          else if (spell.effect?.includes('ignore_half_defense')) { dmg = Math.max(1, dmg - Math.floor(target.stats.defense * 0.5)); }
          else { dmg = Math.max(1, dmg - target.stats.defense); }
          target.currentHp -= dmg;
          results.push({ actorName: caster.name, action: spell.name, damage: dmg, message: `${spell.name} hits ${target.name} for ${dmg}!`, targetDied: target.currentHp <= 0 });

          if (spell.effect?.includes('lifesteal')) {
            const healAmt = Math.floor(dmg * 0.5);
            caster.currentHp = Math.min(caster.currentHp + healAmt, caster.maxHp);
            results.push({ actorName: caster.name, action: 'Life Steal', healing: healAmt, message: `Drained ${healAmt} HP!` });
          }
        }
      }
    }

    if (spell.healing) {
      const healAmt = Math.floor(caster.maxHp * spell.healing);
      caster.currentHp = Math.min(caster.currentHp + healAmt, caster.maxHp);
      results.push({ actorName: caster.name, action: spell.name, healing: healAmt, message: `${spell.name} heals for ${healAmt}!` });
    }

    // Status effects
    if (spell.effect) {
      if (spell.effect.includes('attack_up')) {
        const turns = parseInt(spell.effect.split('_').pop() || '3');
        caster.statusEffects.push({ id: 'attack_up', name: 'Attack Up', turnsRemaining: turns, type: 'buff', statMod: { attack: Math.floor(caster.stats.attack * 0.3) } });
        results.push({ actorName: caster.name, action: spell.name, message: 'Attack boosted!', statusApplied: 'Attack Up' });
      }
      if (spell.effect.includes('defense_up')) {
        const turns = parseInt(spell.effect.split('_').pop() || '3');
        caster.statusEffects.push({ id: 'defense_up', name: 'Defense Up', turnsRemaining: turns, type: 'buff', statMod: { defense: Math.floor(caster.stats.defense * 0.5) } });
        results.push({ actorName: caster.name, action: spell.name, message: 'Defense boosted!', statusApplied: 'Defense Up' });
      }
      if (spell.effect.includes('attack_down') && spell.target === 'enemy') {
        const target = this.state.enemies[targetIdx];
        if (target) {
          const turns = parseInt(spell.effect.split('_').pop() || '2');
          target.statusEffects.push({ id: 'attack_down', name: 'Attack Down', turnsRemaining: turns, type: 'debuff', statMod: { attack: -Math.floor(target.stats.attack * 0.3) } });
          results.push({ actorName: caster.name, action: spell.name, message: `${target.name}'s attack reduced!`, statusApplied: 'Attack Down' });
        }
      }
      if (spell.effect.includes('stun')) {
        const target = this.state.enemies[targetIdx];
        if (target) {
          target.statusEffects.push({ id: 'stun', name: 'Stunned', turnsRemaining: 1, type: 'debuff', stunned: true });
          results.push({ actorName: caster.name, action: spell.name, message: `${target.name} is stunned!`, statusApplied: 'Stunned' });
        }
      }
      if (spell.effect.includes('dodge')) {
        caster.statusEffects.push({ id: 'dodge', name: 'Dodge', turnsRemaining: 1, type: 'buff', dodge: true });
        results.push({ actorName: caster.name, action: spell.name, message: 'Ready to dodge!', statusApplied: 'Dodge' });
      }
      if (spell.effect.includes('parry')) {
        caster.statusEffects.push({ id: 'parry', name: 'Parry', turnsRemaining: 1, type: 'buff', parry: true });
        results.push({ actorName: caster.name, action: spell.name, message: 'Ready to parry!', statusApplied: 'Parry' });
      }
      if (spell.effect.includes('poison') && spell.target !== 'self') {
        const poisonDmg = 10;
        const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '3');
        if (spell.target === 'all_enemies') {
          this.state.enemies.forEach(e => { if (e.currentHp > 0) e.statusEffects.push({ id: 'poison', name: 'Poison', turnsRemaining: turns, type: 'debuff', damagePerTurn: poisonDmg }); });
        } else {
          const target = this.state.enemies[targetIdx];
          if (target) target.statusEffects.push({ id: 'poison', name: 'Poison', turnsRemaining: turns, type: 'debuff', damagePerTurn: poisonDmg });
        }
      }
      if (spell.effect.includes('thorns')) {
        const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '3');
        caster.statusEffects.push({ id: 'thorns', name: 'Thorns', turnsRemaining: turns, type: 'buff', thorns: 0.3 });
      }
      if (spell.effect.includes('root')) {
        const target = this.state.enemies[targetIdx];
        if (target) {
          const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '2');
          target.statusEffects.push({ id: 'root', name: 'Rooted', turnsRemaining: turns, type: 'debuff', statMod: { speed: -100 } });
        }
      }
      if (spell.effect.includes('wither')) {
        const target = this.state.enemies[targetIdx];
        if (target) {
          const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '3');
          target.statusEffects.push({ id: 'wither', name: 'Withering', turnsRemaining: turns, type: 'debuff', damagePerTurn: Math.floor(target.maxHp * 0.08) });
        }
      }
      if (spell.effect.includes('vulnerable')) {
        const target = this.state.enemies[targetIdx];
        if (target) {
          const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '3');
          target.statusEffects.push({ id: 'vulnerable', name: 'Vulnerable', turnsRemaining: turns, type: 'debuff', vulnerable: 0.5 });
        }
      }
      if (spell.effect.includes('burn')) {
        const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '3');
        const targets = spell.target === 'all_enemies' ? this.state.enemies.filter(e => e.currentHp > 0) : [this.state.enemies[targetIdx]].filter(Boolean);
        targets.forEach(t => t.statusEffects.push({ id: 'burn', name: 'Burning', turnsRemaining: turns, type: 'debuff', damagePerTurn: Math.floor(caster.stats.spellPower * 0.3) }));
      }
      if (spell.effect.includes('self_damage')) {
        const selfDmg = Math.floor(caster.maxHp * 0.2);
        caster.currentHp -= selfDmg;
        results.push({ actorName: caster.name, action: 'Dark Sacrifice', damage: selfDmg, message: `Sacrificed ${selfDmg} HP for power!` });
      }
      if (spell.effect.includes('rage')) {
        const turns = parseInt(spell.effect.match(/\d+$/)?.[0] || '3');
        caster.statusEffects.push({ id: 'rage_atk', name: 'Rage (ATK)', turnsRemaining: turns, type: 'buff', statMod: { attack: Math.floor(caster.stats.attack * 0.5) } });
        caster.statusEffects.push({ id: 'rage_def', name: 'Rage (DEF)', turnsRemaining: turns, type: 'debuff', statMod: { defense: -Math.floor(caster.stats.defense * 0.25) } });
      }
    }

    if (results.length === 0) {
      results.push({ actorName: caster.name, action: spell.name, message: `${caster.name} casts ${spell.name}!` });
    }

    return results;
  }

  private useItem(caster: Combatant, itemId: string, targetIdx: number): CombatResult[] {
    const item = ITEMS[itemId];
    if (!item) return [{ actorName: caster.name, action: 'Item', message: 'Item not found!' }];

    const gs = GameState.getInstance();
    if (!gs.removeItem(itemId)) return [{ actorName: caster.name, action: 'Item', message: 'No items left!' }];

    const results: CombatResult[] = [];

    if (item.healAmount) {
      caster.currentHp = Math.min(caster.currentHp + item.healAmount, caster.maxHp);
      results.push({ actorName: caster.name, action: item.name, healing: item.healAmount, message: `Used ${item.name}! Restored ${item.healAmount} HP.` });
    }
    if (item.spellRestore) {
      caster.currentSp = Math.min(caster.currentSp + item.spellRestore, caster.maxSp);
      results.push({ actorName: caster.name, action: item.name, message: `Used ${item.name}! Restored ${item.spellRestore} SP.` });
    }
    if (item.effect === 'escape') {
      this.state.isOver = true;
      results.push({ actorName: caster.name, action: item.name, message: 'Used Ender Pearl to escape!' });
    }
    if (item.effect === 'damage_30') {
      const target = this.state.enemies[targetIdx];
      if (target && target.currentHp > 0) {
        target.currentHp -= 30;
        results.push({ actorName: caster.name, action: item.name, damage: 30, message: `Splash Potion hits ${target.name} for 30!`, targetDied: target.currentHp <= 0 });
      }
    }
    if (item.effect === 'wall') {
      this.state.buildWallHp += 30;
      results.push({ actorName: caster.name, action: item.name, message: `Placed wall! (${this.state.buildWallHp} HP)` });
    }
    if (item.effect?.includes('defense_up')) {
      caster.statusEffects.push({ id: 'item_def', name: 'Defense Boost', turnsRemaining: 3, type: 'buff', statMod: { defense: 5 } });
      results.push({ actorName: caster.name, action: item.name, message: 'Defense boosted!' });
    }

    return results;
  }

  private calcDamage(attack: number, defense: number, target: Combatant): number {
    // Apply stat mods from status effects
    let effectiveAtk = attack;
    let effectiveDef = defense;
    target.statusEffects.forEach(e => {
      if (e.statMod?.defense) effectiveDef += e.statMod.defense;
    });
    // Random variance 0.85 - 1.15
    const variance = 0.85 + Math.random() * 0.3;
    const dmg = Math.max(1, Math.floor((effectiveAtk * variance) - effectiveDef * 0.5));

    // Shadow Strike check
    const gs = GameState.getInstance();
    if (!target.isPlayer && gs.player.classId === 'cave_stalker' && Math.random() < 0.25) {
      return dmg * 2;
    }

    return dmg;
  }

  processStatusEffects(combatant: Combatant): CombatResult[] {
    const results: CombatResult[] = [];
    combatant.statusEffects = combatant.statusEffects.filter(effect => {
      if (effect.damagePerTurn) {
        combatant.currentHp -= effect.damagePerTurn;
        results.push({
          actorName: combatant.name, action: effect.name,
          damage: effect.damagePerTurn,
          message: `${combatant.name} takes ${effect.damagePerTurn} ${effect.name} damage!`,
          targetDied: combatant.currentHp <= 0,
        });
      }
      if (effect.healPerTurn) {
        combatant.currentHp = Math.min(combatant.currentHp + effect.healPerTurn, combatant.maxHp);
        results.push({ actorName: combatant.name, action: effect.name, healing: effect.healPerTurn, message: `${combatant.name} regenerates ${effect.healPerTurn} HP!` });
      }
      effect.turnsRemaining--;
      return effect.turnsRemaining > 0;
    });
    return results;
  }

  private advanceTurn() {
    this.checkCombatEnd();
    if (this.state.isOver) return;

    // Process status effects for current combatant before moving on
    const current = this.getCurrentCombatant();
    const statusResults = this.processStatusEffects(current);
    this.state.log.push(...statusResults);
    this.checkCombatEnd();
    if (this.state.isOver) return;

    // Skip dead combatants
    let attempts = 0;
    do {
      this.state.currentTurnIndex = (this.state.currentTurnIndex + 1) % this.state.turnOrder.length;
      if (this.state.currentTurnIndex === 0) this.state.round++;
      attempts++;
    } while (this.getCurrentCombatant().currentHp <= 0 && attempts < 20);
  }

  private checkCombatEnd() {
    const player = this.state.allies[0];
    if (player.currentHp <= 0) {
      // Check Totem of Undying
      const gs = GameState.getInstance();
      if (gs.player.equipment.accessory === 'totem_of_undying') {
        player.currentHp = Math.floor(player.maxHp * 0.25);
        gs.player.equipment.accessory = null;
        this.state.log.push({ actorName: player.name, action: 'Totem of Undying', healing: player.currentHp, message: 'Totem of Undying activates! Revived with 25% HP!' });
        return;
      }
      this.state.isOver = true;
      this.state.playerWon = false;
      return;
    }
    if (this.state.enemies.every(e => e.currentHp <= 0)) {
      this.state.isOver = true;
      this.state.playerWon = true;
    }
  }

  getRewards(): { xp: number; gold: number; drops: { itemId: string; name: string }[] } {
    let xp = 0, gold = 0;
    const drops: { itemId: string; name: string }[] = [];
    const { ENEMIES } = require('../data/enemies');
    for (const enemy of this.state.enemies) {
      const enemyId = enemy.id.replace(/^enemy_\d+_?/, '');
      // Find matching enemy def
      for (const def of Object.values(ENEMIES) as EnemyDef[]) {
        if (def.name === enemy.name) {
          xp += def.xpReward;
          gold += def.goldReward;
          for (const drop of def.drops) {
            if (Math.random() < drop.chance) {
              const item = ITEMS[drop.itemId];
              if (item) drops.push({ itemId: drop.itemId, name: item.name });
            }
          }
          break;
        }
      }
    }
    return { xp, gold, drops };
  }

  syncBackToGameState() {
    const gs = GameState.getInstance();
    const player = this.state.allies[0];
    gs.player.currentHp = Math.max(0, player.currentHp);
    gs.player.currentSp = Math.max(0, player.currentSp);
  }
}
