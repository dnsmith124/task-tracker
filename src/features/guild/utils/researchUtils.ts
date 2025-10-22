import { ResearchNode, GuildState } from '../types/Guild';
import { Character } from '@/features/character/types/Character';

export const canPurchaseResearch = (node: ResearchNode, character: Character, guildState: GuildState): boolean => {
  // Check if already purchased
  if (node.purchased) return false;
  
  // Check mana requirement
  if (character.mana < node.manaCost) return false;
  
  // Check stat requirement
  if (character.attributes[node.requiredStat] < node.statMinimum) return false;
  
  // Check prerequisites
  if (node.prerequisites) {
    const purchasedNodes = guildState.research.filter(n => n.purchased);
    const hasAllPrerequisites = node.prerequisites.every(prereqId => 
      purchasedNodes.some(n => n.id === prereqId)
    );
    if (!hasAllPrerequisites) return false;
  }
  
  return true;
};

export const getResearchTreeLayout = (): ResearchNode[] => {
  const nodes: ResearchNode[] = [
    // Central hub
    {
      id: 'hub',
      name: 'Guild Mastery',
      description: 'The foundation of all guild knowledge',
      requiredStat: 'STR',
      statMinimum: 0,
      manaCost: 0,
      unlocks: ['guild_hall'],
      purchased: true,
      position: { x: 0, y: 0 }
    },
    
    // STR branch (red theme)
    {
      id: 'strength_training',
      name: 'Strength Training',
      description: 'Unlocks advanced combat buildings',
      requiredStat: 'STR',
      statMinimum: 3,
      manaCost: 50,
      unlocks: ['training_grounds'],
      purchased: false,
      position: { x: -1, y: 0 },
      prerequisites: ['hub']
    },
    {
      id: 'weapon_mastery',
      name: 'Weapon Mastery',
      description: 'Unlocks enhanced blacksmith upgrades',
      requiredStat: 'STR',
      statMinimum: 5,
      manaCost: 100,
      unlocks: [],
      purchased: false,
      position: { x: -2, y: 0 },
      prerequisites: ['strength_training']
    },
    {
      id: 'battle_tactics',
      name: 'Battle Tactics',
      description: 'Unlocks advanced sparring ring techniques',
      requiredStat: 'STR',
      statMinimum: 7,
      manaCost: 150,
      unlocks: [],
      purchased: false,
      position: { x: -3, y: 0 },
      prerequisites: ['weapon_mastery']
    },
    
    // AGL branch (green theme)
    {
      id: 'agility_training',
      name: 'Agility Training',
      description: 'Unlocks swift movement buildings',
      requiredStat: 'AGL',
      statMinimum: 3,
      manaCost: 50,
      unlocks: ['shrine'],
      purchased: false,
      position: { x: 0, y: -1 },
      prerequisites: ['hub']
    },
    {
      id: 'stealth_mastery',
      name: 'Stealth Mastery',
      description: 'Unlocks hidden treasury techniques',
      requiredStat: 'AGL',
      statMinimum: 5,
      manaCost: 100,
      unlocks: [],
      purchased: false,
      position: { x: 0, y: -2 },
      prerequisites: ['agility_training']
    },
    {
      id: 'wind_techniques',
      name: 'Wind Techniques',
      description: 'Unlocks advanced shrine powers',
      requiredStat: 'AGL',
      statMinimum: 7,
      manaCost: 150,
      unlocks: [],
      purchased: false,
      position: { x: 0, y: -3 },
      prerequisites: ['stealth_mastery']
    },
    
    // MND branch (blue theme)
    {
      id: 'mind_training',
      name: 'Mind Training',
      description: 'Unlocks knowledge-based buildings',
      requiredStat: 'MND',
      statMinimum: 3,
      manaCost: 50,
      unlocks: ['workshop'],
      purchased: false,
      position: { x: 1, y: 0 },
      prerequisites: ['hub']
    },
    {
      id: 'arcane_knowledge',
      name: 'Arcane Knowledge',
      description: 'Unlocks enhanced library techniques',
      requiredStat: 'MND',
      statMinimum: 5,
      manaCost: 100,
      unlocks: [],
      purchased: false,
      position: { x: 2, y: 0 },
      prerequisites: ['mind_training']
    },
    {
      id: 'mystical_arts',
      name: 'Mystical Arts',
      description: 'Unlocks advanced workshop crafting',
      requiredStat: 'MND',
      statMinimum: 7,
      manaCost: 150,
      unlocks: [],
      purchased: false,
      position: { x: 3, y: 0 },
      prerequisites: ['arcane_knowledge']
    },
    
    // VIG branch (yellow theme)
    {
      id: 'vitality_training',
      name: 'Vitality Training',
      description: 'Unlocks health and sustenance buildings',
      requiredStat: 'VIG',
      statMinimum: 3,
      manaCost: 50,
      unlocks: ['tavern'],
      purchased: false,
      position: { x: 0, y: 1 },
      prerequisites: ['hub']
    },
    {
      id: 'endurance_mastery',
      name: 'Endurance Mastery',
      description: 'Unlocks enhanced tavern services',
      requiredStat: 'VIG',
      statMinimum: 5,
      manaCost: 100,
      unlocks: [],
      purchased: false,
      position: { x: 0, y: 2 },
      prerequisites: ['vitality_training']
    },
    {
      id: 'life_force',
      name: 'Life Force',
      description: 'Unlocks advanced tavern healing',
      requiredStat: 'VIG',
      statMinimum: 7,
      manaCost: 150,
      unlocks: [],
      purchased: false,
      position: { x: 0, y: 3 },
      prerequisites: ['endurance_mastery']
    }
  ];
  
  return nodes;
};

export const getStatColor = (stat: string): string => {
  switch (stat) {
    case 'STR': return '#f44336'; // Red
    case 'AGL': return '#4caf50'; // Green
    case 'MND': return '#2196f3'; // Blue
    case 'VIG': return '#ff9800'; // Orange/Yellow
    default: return '#666';
  }
};

export const getResearchNodeById = (nodes: ResearchNode[], id: string): ResearchNode | undefined => {
  return nodes.find(node => node.id === id);
};
