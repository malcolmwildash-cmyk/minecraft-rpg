export interface DialogueLine {
  text: string;
  speaker: string;
  choices?: { text: string; choiceKey?: string; choiceValue?: string; nextDialogue?: string; action?: string }[];
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  color: number;
  dialogues: Record<string, DialogueLine[]>;
  shopItems?: string[];
}

export const NPCS: Record<string, NPCDef> = {
  elder_villager: {
    id: 'elder_villager', name: 'Elder Villager', role: 'Quest Giver', color: 0x8b6914,
    dialogues: {
      default: [
        { text: 'Welcome, brave adventurer. Dark times have come to our lands.', speaker: 'Elder Villager' },
        { text: 'The Arch-Illager has returned, more powerful than ever. Villages burn across the realm.', speaker: 'Elder Villager' },
        { text: 'We need a hero. Will you answer the call?', speaker: 'Elder Villager',
          choices: [
            { text: 'I will fight!', choiceKey: 'hero_response', choiceValue: 'brave', nextDialogue: 'accepted' },
            { text: 'Tell me more first.', nextDialogue: 'more_info' },
          ]
        },
      ],
      accepted: [
        { text: 'Excellent! First, clear the forest of threats. Then we\'ll talk about allies.', speaker: 'Elder Villager' },
        { text: 'The forest path leads north from the village. Be careful.', speaker: 'Elder Villager' },
      ],
      more_info: [
        { text: 'The Arch-Illager was defeated once before, but the Orb of Dominance survived.', speaker: 'Elder Villager' },
        { text: 'He\'s rebuilt his army — pillagers, vindicators, evokers, and worse.', speaker: 'Elder Villager' },
        { text: 'We\'ve heard rumors of a Nether alliance. The situation is dire.', speaker: 'Elder Villager' },
      ],
      quest_complete: [
        { text: 'Well done! The forest routes are safer now. Here is your reward.', speaker: 'Elder Villager' },
        { text: 'You should speak with the Faction Guide. Having allies will be crucial.', speaker: 'Elder Villager' },
      ],
      general: [
        { text: 'Stay strong, adventurer. The path ahead is perilous but necessary.', speaker: 'Elder Villager' },
      ],
    },
  },
  merchant: {
    id: 'merchant', name: 'Merchant', role: 'Shop', color: 0xdaa520,
    shopItems: ['bread', 'steak', 'healing_potion', 'mana_potion', 'golden_apple', 'ender_pearl', 'splash_potion_damage', 'lapis_lazuli'],
    dialogues: {
      default: [
        { text: 'Welcome to my shop! I\'ve got supplies for every adventurer.', speaker: 'Merchant',
          choices: [
            { text: 'Show me your wares.', action: 'open_shop' },
            { text: 'Just browsing.', nextDialogue: 'bye' },
          ]
        },
      ],
      bye: [{ text: 'Come back anytime!', speaker: 'Merchant' }],
    },
  },
  armorer: {
    id: 'armorer', name: 'Armorer', role: 'Shop', color: 0x808080,
    shopItems: ['leather_armor', 'chainmail', 'iron_armor', 'diamond_armor', 'speed_boots', 'shield_totem', 'wooden_sword', 'stone_sword', 'iron_sword', 'diamond_sword', 'wooden_bow', 'enchanted_staff'],
    dialogues: {
      default: [
        { text: 'Looking for gear? I forge the finest arms and armor.', speaker: 'Armorer',
          choices: [
            { text: 'Show me your gear.', action: 'open_shop' },
            { text: 'Maybe later.', nextDialogue: 'bye' },
          ]
        },
      ],
      bye: [{ text: 'Stay safe out there!', speaker: 'Armorer' }],
    },
  },
  faction_guide: {
    id: 'faction_guide', name: 'Faction Guide', role: 'Faction Selection', color: 0x4169e1,
    dialogues: {
      default: [
        { text: 'Greetings, adventurer. I represent the four great factions.', speaker: 'Faction Guide' },
        { text: 'Each faction offers unique powers. Choose wisely — this shapes your destiny.', speaker: 'Faction Guide',
          choices: [
            { text: 'Villagers & Iron Golems', choiceKey: 'faction_choice', choiceValue: 'villagers', action: 'join_faction' },
            { text: 'Redstone Engineers', choiceKey: 'faction_choice', choiceValue: 'redstone', action: 'join_faction' },
            { text: 'Ender Watchers', choiceKey: 'faction_choice', choiceValue: 'ender_watchers', action: 'join_faction' },
            { text: 'Nether Legion', choiceKey: 'faction_choice', choiceValue: 'nether_legion', action: 'join_faction' },
          ]
        },
      ],
      already_joined: [
        { text: 'You\'ve already pledged your allegiance. Your faction grows stronger with you.', speaker: 'Faction Guide' },
      ],
    },
  },
  blacksmith: {
    id: 'blacksmith', name: 'Blacksmith', role: 'Enchanting', color: 0x696969,
    dialogues: {
      default: [
        { text: 'Need something enchanted? Bring me lapis lazuli and I\'ll work my magic.', speaker: 'Blacksmith',
          choices: [
            { text: 'Enchant my gear.', action: 'open_enchant' },
            { text: 'Not right now.', nextDialogue: 'bye' },
          ]
        },
      ],
      bye: [{ text: 'The forge never sleeps!', speaker: 'Blacksmith' }],
    },
  },
  panicked_villager: {
    id: 'panicked_villager', name: 'Panicked Villager', role: 'Quest', color: 0xc4a882,
    dialogues: {
      default: [
        { text: 'HELP! Our village to the east is under attack by pillagers!', speaker: 'Panicked Villager' },
        { text: 'Please, will you come save us?', speaker: 'Panicked Villager',
          choices: [
            { text: 'I\'ll help! Lead the way.', choiceKey: 'village_defense_1', choiceValue: 'defend', action: 'start_defense' },
            { text: 'I can\'t right now. I\'m sorry.', choiceKey: 'village_defense_1', choiceValue: 'ignore', nextDialogue: 'ignored' },
          ]
        },
      ],
      ignored: [
        { text: '...I understand. We\'ll try to hold on our own.', speaker: 'Panicked Villager' },
      ],
      defended: [
        { text: 'Thank you! You saved our village! We\'ll never forget this.', speaker: 'Panicked Villager' },
      ],
    },
  },
  treasure_hunter: {
    id: 'treasure_hunter', name: 'Wandering Trader', role: 'Quest/Shop', color: 0x1e90ff,
    shopItems: ['ender_pearl', 'golden_apple', 'lapis_lazuli'],
    dialogues: {
      default: [
        { text: 'Psst! Looking for rare goods? I trade in curiosities.', speaker: 'Wandering Trader',
          choices: [
            { text: 'What do you have?', action: 'open_shop' },
            { text: 'No thanks.', nextDialogue: 'bye' },
          ]
        },
      ],
      bye: [{ text: 'Your loss! Llama, let\'s go!', speaker: 'Wandering Trader' }],
    },
  },
  alchemist: {
    id: 'alchemist', name: 'Alchemist', role: 'Quest', color: 0x9932cc,
    dialogues: {
      default: [
        { text: 'These swamp witches have ingredients I need for my research.', speaker: 'Alchemist' },
        { text: 'Bring me 3 potion ingredients and I\'ll reward you handsomely.', speaker: 'Alchemist' },
      ],
    },
  },
  captured_piglin: {
    id: 'captured_piglin', name: 'Captured Piglin', role: 'Quest', color: 0xd4a574,
    dialogues: {
      default: [
        { text: '*grunts* You... not like others. I know secret path to fortress.', speaker: 'Captured Piglin' },
        { text: 'Free me, I tell you. Or leave me. Your choice.', speaker: 'Captured Piglin',
          choices: [
            { text: 'I\'ll free you.', choiceKey: 'nether_mercy', choiceValue: 'freed', action: 'free_piglin' },
            { text: 'I don\'t trust you.', choiceKey: 'nether_mercy', choiceValue: 'left', nextDialogue: 'left' },
          ]
        },
      ],
      left: [{ text: '*snarls* You will regret this, overworlder...', speaker: 'Captured Piglin' }],
      freed: [{ text: '*nods* The fortress... south wall has weakness. Go there. I remember kindness.', speaker: 'Captured Piglin' }],
    },
  },
  desert_explorer: {
    id: 'desert_explorer', name: 'Explorer', role: 'Quest', color: 0xdeb887,
    dialogues: {
      default: [
        { text: 'This temple is ancient. Be careful of the Redstone Monstrosity inside.', speaker: 'Explorer' },
        { text: 'I\'ve heard it guards something the Arch-Illager wants desperately.', speaker: 'Explorer' },
      ],
    },
  },
  mountain_hermit: {
    id: 'mountain_hermit', name: 'Mountain Hermit', role: 'Lore', color: 0xa0a0a0,
    dialogues: {
      default: [
        { text: 'These mountains hold secrets older than any village.', speaker: 'Mountain Hermit' },
        { text: 'The Arch-Illager seeks power from the Nether. He must not find it.', speaker: 'Mountain Hermit' },
      ],
    },
  },
};
