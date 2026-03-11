import { GameSaveData, GameState } from './GameState';
import { CLASSES } from '../data/classes';

const SAVE_KEY_PREFIX = 'minecraft_rpg_save_';
const MAX_SLOTS = 3;

export interface SaveInfo {
  exists: boolean;
  playerName?: string;
  className?: string;
  level?: number;
  area?: string;
  gold?: number;
  playTime?: number;
  timestamp?: number;
}

export class SaveManager {
  static save(slot: number): boolean {
    if (slot < 0 || slot >= MAX_SLOTS) return false;
    try {
      const state = GameState.getInstance();
      const data = state.toSaveData(slot);
      localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  static load(slot: number): boolean {
    if (slot < 0 || slot >= MAX_SLOTS) return false;
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
      if (!raw) return false;
      const data: GameSaveData = JSON.parse(raw);
      GameState.getInstance().loadSaveData(data);
      return true;
    } catch {
      return false;
    }
  }

  static getSaveInfo(slot: number): SaveInfo {
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
      if (!raw) return { exists: false };
      const data: GameSaveData = JSON.parse(raw);
      return {
        exists: true,
        playerName: data.player.name,
        className: CLASSES[data.player.classId]?.name || data.player.classId,
        level: data.player.level,
        area: data.currentArea,
        gold: data.player.gold,
        playTime: data.playTime,
        timestamp: data.timestamp,
      };
    } catch {
      return { exists: false };
    }
  }

  static getAllSaveInfo(): SaveInfo[] {
    return Array.from({ length: MAX_SLOTS }, (_, i) => SaveManager.getSaveInfo(i));
  }

  static deleteSave(slot: number): boolean {
    try {
      localStorage.removeItem(SAVE_KEY_PREFIX + slot);
      return true;
    } catch {
      return false;
    }
  }

  static autoSave(): boolean {
    const state = GameState.getInstance();
    try {
      const data = state.toSaveData(state.saveSlot);
      localStorage.setItem('minecraft_rpg_autosave', JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  static loadAutoSave(): boolean {
    try {
      const raw = localStorage.getItem('minecraft_rpg_autosave');
      if (!raw) return false;
      const data: GameSaveData = JSON.parse(raw);
      GameState.getInstance().loadSaveData(data);
      return true;
    } catch {
      return false;
    }
  }

  static getAutoSaveInfo(): SaveInfo | null {
    try {
      const raw = localStorage.getItem('minecraft_rpg_autosave');
      if (!raw) return null;
      const data: GameSaveData = JSON.parse(raw);
      return {
        exists: true,
        playerName: data.player.name,
        className: CLASSES[data.player.classId]?.name || data.player.classId,
        level: data.player.level,
        area: data.currentArea,
        gold: data.player.gold,
        playTime: data.playTime,
        timestamp: data.timestamp,
      };
    } catch {
      return null;
    }
  }

  static getMaxSlots(): number {
    return MAX_SLOTS;
  }
}
