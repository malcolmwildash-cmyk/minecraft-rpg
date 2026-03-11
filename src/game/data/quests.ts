export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type QuestType = 'main' | 'side';

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'talk' | 'explore' | 'choice';
  target: string;
  required: number;
  current?: number;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items?: { itemId: string; quantity: number }[];
}

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  area: string;
  giver: string;
  objectives: QuestObjective[];
  reward: QuestReward;
  prerequisite?: string;
  choiceKey?: string;
  nextQuest?: string;
}

export const QUESTS: Record<string, QuestDef> = {
  // Main Story Quests
  mq_01_awakening: {
    id: 'mq_01_awakening', title: 'The Awakening', type: 'main', area: 'hub',
    description: 'The village elder has urgent news. The Arch-Illager has returned with an army larger than ever before. Speak with Elder Villager to learn more.',
    giver: 'elder_villager',
    objectives: [{ id: 'talk_elder', description: 'Speak with Elder Villager', type: 'talk', target: 'elder_villager', required: 1 }],
    reward: { xp: 50, gold: 20 },
    nextQuest: 'mq_02_first_patrol',
  },
  mq_02_first_patrol: {
    id: 'mq_02_first_patrol', title: 'First Patrol', type: 'main', area: 'forest',
    description: 'Clear the forest of hostile mobs threatening the village supply routes.',
    giver: 'elder_villager',
    objectives: [
      { id: 'kill_forest_mobs', description: 'Defeat forest enemies', type: 'kill', target: 'any_forest', required: 5 },
      { id: 'report_back', description: 'Report to Elder Villager', type: 'talk', target: 'elder_villager', required: 1 },
    ],
    reward: { xp: 100, gold: 40, items: [{ itemId: 'healing_potion', quantity: 3 }] },
    prerequisite: 'mq_01_awakening',
    nextQuest: 'mq_03_choose_faction',
  },
  mq_03_choose_faction: {
    id: 'mq_03_choose_faction', title: 'Choose Your Allegiance', type: 'main', area: 'hub',
    description: 'The Faction Guide can help you find allies for the fight ahead. Choose a faction to gain unique powers.',
    giver: 'elder_villager',
    objectives: [{ id: 'talk_faction', description: 'Speak with the Faction Guide', type: 'talk', target: 'faction_guide', required: 1 }],
    reward: { xp: 75, gold: 0 },
    prerequisite: 'mq_02_first_patrol',
    choiceKey: 'faction_choice',
    nextQuest: 'mq_04_desert_expedition',
  },
  mq_04_desert_expedition: {
    id: 'mq_04_desert_expedition', title: 'Desert Expedition', type: 'main', area: 'desert',
    description: 'A desert temple holds clues about the Arch-Illager\'s new power source. Explore the temple and defeat its guardian.',
    giver: 'elder_villager',
    objectives: [
      { id: 'defeat_boss', description: 'Defeat the Redstone Monstrosity', type: 'kill', target: 'desert_boss_redstone_golem', required: 1 },
    ],
    reward: { xp: 350, gold: 150, items: [{ itemId: 'diamond', quantity: 2 }] },
    prerequisite: 'mq_03_choose_faction',
    nextQuest: 'mq_05_swamp_darkness',
  },
  mq_05_swamp_darkness: {
    id: 'mq_05_swamp_darkness', title: 'Swamp Darkness', type: 'main', area: 'swamp',
    description: 'Dark energy pulses from the swamp. A corrupted guardian must be stopped before it spreads further.',
    giver: 'elder_villager',
    objectives: [
      { id: 'defeat_swamp_boss', description: 'Defeat the Corrupted Guardian', type: 'kill', target: 'swamp_boss_corrupted_guardian', required: 1 },
    ],
    reward: { xp: 450, gold: 200, items: [{ itemId: 'golden_apple', quantity: 2 }] },
    prerequisite: 'mq_04_desert_expedition',
    nextQuest: 'mq_06_mountain_passage',
  },
  mq_06_mountain_passage: {
    id: 'mq_06_mountain_passage', title: 'Mountain Passage', type: 'main', area: 'mountains',
    description: 'The mountain pass is blocked by the Ravager Alpha. Defeat it to open the path to the Nether portal.',
    giver: 'elder_villager',
    objectives: [
      { id: 'defeat_ravager', description: 'Defeat the Ravager Alpha', type: 'kill', target: 'mountain_boss_ravager', required: 1 },
    ],
    reward: { xp: 500, gold: 250, items: [{ itemId: 'diamond_armor', quantity: 1 }] },
    prerequisite: 'mq_05_swamp_darkness',
    nextQuest: 'mq_07_nether_crossing',
  },
  mq_07_nether_crossing: {
    id: 'mq_07_nether_crossing', title: 'Nether Crossing', type: 'main', area: 'nether',
    description: 'Cross the Nether and defeat The Wither to reach the Arch-Illager\'s fortress.',
    giver: 'elder_villager',
    objectives: [
      { id: 'defeat_wither', description: 'Defeat The Wither', type: 'kill', target: 'nether_boss_wither', required: 1 },
    ],
    reward: { xp: 750, gold: 400, items: [{ itemId: 'netherite_sword', quantity: 1 }] },
    prerequisite: 'mq_06_mountain_passage',
    nextQuest: 'mq_08_final_stand',
  },
  mq_08_final_stand: {
    id: 'mq_08_final_stand', title: 'The Final Stand', type: 'main', area: 'fortress',
    description: 'Confront the Arch-Illager in his fortress and end his reign of terror. Your choices will determine the outcome.',
    giver: 'elder_villager',
    objectives: [
      { id: 'defeat_arch_illager', description: 'Defeat The Arch-Illager', type: 'kill', target: 'arch_illager', required: 1 },
    ],
    reward: { xp: 2000, gold: 1000 },
    prerequisite: 'mq_07_nether_crossing',
  },

  // Side Quests
  sq_01_lost_supplies: {
    id: 'sq_01_lost_supplies', title: 'Lost Supplies', type: 'side', area: 'forest',
    description: 'A merchant lost supplies to pillagers. Recover them.',
    giver: 'merchant',
    objectives: [{ id: 'kill_pillagers', description: 'Defeat pillagers', type: 'kill', target: 'pillager', required: 3 }],
    reward: { xp: 60, gold: 30, items: [{ itemId: 'bread', quantity: 5 }] },
  },
  sq_02_spider_silk: {
    id: 'sq_02_spider_silk', title: 'Spider Silk Collection', type: 'side', area: 'forest',
    description: 'The armorer needs spider string for bowstrings.',
    giver: 'armorer',
    objectives: [{ id: 'collect_string', description: 'Collect String', type: 'collect', target: 'string', required: 5 }],
    reward: { xp: 40, gold: 25, items: [{ itemId: 'wooden_bow', quantity: 1 }] },
  },
  sq_03_village_defense: {
    id: 'sq_03_village_defense', title: 'Village Under Attack', type: 'side', area: 'forest',
    description: 'A nearby village is under attack! Rush to their defense... or continue your mission.',
    giver: 'panicked_villager',
    objectives: [{ id: 'defend_choice', description: 'Choose: Defend or Ignore', type: 'choice', target: 'defend_village', required: 1 }],
    reward: { xp: 80, gold: 50 },
    choiceKey: 'village_defense_1',
  },
  sq_04_desert_treasure: {
    id: 'sq_04_desert_treasure', title: 'Desert Treasure', type: 'side', area: 'desert',
    description: 'Rumors of treasure hidden in the desert temple. Defeat the husks guarding it.',
    giver: 'treasure_hunter',
    objectives: [{ id: 'kill_husks', description: 'Defeat husks', type: 'kill', target: 'husk', required: 4 }],
    reward: { xp: 80, gold: 60, items: [{ itemId: 'emerald', quantity: 3 }] },
  },
  sq_05_witch_brew: {
    id: 'sq_05_witch_brew', title: 'Witch\'s Brew', type: 'side', area: 'swamp',
    description: 'An alchemist needs ingredients from slain witches.',
    giver: 'alchemist',
    objectives: [{ id: 'collect_ingredients', description: 'Collect potion ingredients', type: 'collect', target: 'potion_ingredients', required: 3 }],
    reward: { xp: 100, gold: 40, items: [{ itemId: 'mana_potion', quantity: 3 }] },
  },
  sq_06_mining_expedition: {
    id: 'sq_06_mining_expedition', title: 'Deep Mining', type: 'side', area: 'mountains',
    description: 'The blacksmith needs diamonds from the deep caves.',
    giver: 'blacksmith',
    objectives: [{ id: 'find_diamonds', description: 'Find diamonds', type: 'collect', target: 'diamond', required: 3 }],
    reward: { xp: 120, gold: 80, items: [{ itemId: 'diamond_sword', quantity: 1 }] },
  },
  sq_07_nether_mercy: {
    id: 'sq_07_nether_mercy', title: 'Mercy in the Nether', type: 'side', area: 'nether',
    description: 'A captured piglin offers information in exchange for its freedom. Trust it or not?',
    giver: 'captured_piglin',
    objectives: [{ id: 'mercy_choice', description: 'Choose: Free or Leave', type: 'choice', target: 'piglin_mercy', required: 1 }],
    reward: { xp: 150, gold: 0 },
    choiceKey: 'nether_mercy',
  },
};

export const QUEST_LIST = Object.values(QUESTS);
export const MAIN_QUESTS = QUEST_LIST.filter(q => q.type === 'main');
export const SIDE_QUESTS = QUEST_LIST.filter(q => q.type === 'side');

export function getAvailableQuests(area: string, completedQuests: string[]): QuestDef[] {
  return QUEST_LIST.filter(q => {
    if (completedQuests.includes(q.id)) return false;
    if (q.prerequisite && !completedQuests.includes(q.prerequisite)) return false;
    return q.area === area || q.area === 'hub';
  });
}
