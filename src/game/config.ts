import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharCreateScene } from './scenes/CharCreateScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { CombatScene } from './scenes/CombatScene';
import { DialogueScene } from './scenes/DialogueScene';
import { InventoryScene } from './scenes/InventoryScene';
import { SaveLoadScene } from './scenes/SaveLoadScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 640,
    backgroundColor: '#0f172a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: {
        width: 320,
        height: 480,
      },
      max: {
        width: 1920,
        height: 1080,
      },
    },
    scene: [
      BootScene,
      MainMenuScene,
      CharCreateScene,
      ExplorationScene,
      CombatScene,
      DialogueScene,
      InventoryScene,
      SaveLoadScene,
    ],
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    audio: {
      disableWebAudio: false,
    },
    input: {
      activePointers: 2, // Support touch
    },
  };
}
