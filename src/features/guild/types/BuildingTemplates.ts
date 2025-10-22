import { BuildingTemplate } from './Guild';

export const BUILDING_TEMPLATES: BuildingTemplate[] = [
  {
    id: 'guild_hall',
    name: 'Guild Hall',
    description: 'The heart of your guild, providing adventurer capacity',
    icon: '🏰',
    maxLevel: 4,
    baseCost: 0, // Free starter building
    effects: [
      { type: 'adventurer_capacity', value: 5 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    description: 'Crafts weapons and armor, increasing gold from adventures',
    icon: '⚒️',
    maxLevel: 3,
    baseCost: 50,
    effects: [
      { type: 'gold_per_adventure', value: 2 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'sparring_ring',
    name: 'Sparring Ring',
    description: 'Training ground that grants XP to adventurers',
    icon: '⚔️',
    maxLevel: 3,
    baseCost: 75,
    effects: [
      { type: 'adventurer_xp_per_work', value: 5 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'library',
    name: 'Library',
    description: 'A place of study that grants mana during breaks',
    icon: '📚',
    maxLevel: 3,
    baseCost: 100,
    effects: [
      { type: 'mana_per_break', value: 3 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'tavern',
    name: 'Tavern',
    description: 'A gathering place that rewards gold for completed quests',
    icon: '🍺',
    maxLevel: 3,
    baseCost: 150,
    effects: [
      { type: 'gold_per_quest', value: 10 }
    ]
  },
  {
    id: 'training_grounds',
    name: 'Training Grounds',
    description: 'Advanced training that increases adventurer efficiency',
    icon: '🏟️',
    maxLevel: 2,
    baseCost: 200,
    effects: [
      { type: 'adventurer_efficiency', value: 0.1 }
    ]
  },
  {
    id: 'shrine',
    name: 'Shrine',
    description: 'A mystical place that grants mana from adventures',
    icon: '⛩️',
    maxLevel: 3,
    baseCost: 125,
    effects: [
      { type: 'mana_per_adventure', value: 1 }
    ]
  },
  {
    id: 'treasury',
    name: 'Treasury',
    description: 'Stores wealth and generates gold during breaks',
    icon: '💰',
    maxLevel: 3,
    baseCost: 175,
    effects: [
      { type: 'gold_per_break', value: 5 }
    ]
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Crafts items and grants renown for completed quests',
    icon: '🔨',
    maxLevel: 3,
    baseCost: 250,
    effects: [
      { type: 'renown_per_quest', value: 2 }
    ]
  }
];

export const getBuildingTemplate = (id: string): BuildingTemplate | undefined => {
  return BUILDING_TEMPLATES.find(template => template.id === id);
};

export const getUnlockedBuildings = (unlockedIds: string[]): BuildingTemplate[] => {
  return BUILDING_TEMPLATES.filter(template => 
    template.unlockedByDefault || unlockedIds.includes(template.id)
  );
};
