import { Attributes } from '@/features/character/types/Character';

export interface Adventurer {
  id: string;
  name: string;
  level: number;
  xp: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface Building {
  id: string;
  type: string;
  level: number;
  position: GridPosition;
}

export type BuildingEffectType = 
  | 'gold_per_adventure'
  | 'mana_per_break'
  | 'gold_per_quest'
  | 'mana_per_adventure'
  | 'gold_per_break'
  | 'renown_per_quest'
  | 'adventurer_xp_per_work'
  | 'adventurer_efficiency'
  | 'adventurer_capacity';

export interface BuildingEffect {
  type: BuildingEffectType;
  value: number;
}

export interface BuildingTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  effects: BuildingEffect[];
  unlockedByDefault?: boolean;
}

export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  requiredStat: keyof Attributes;
  statMinimum: number;
  manaCost: number;
  unlocks: string[];
  purchased: boolean;
  position: { x: number; y: number };
  prerequisites?: string[];
}

export interface GuildState {
  adventurers: Adventurer[];
  maxAdventurers: number;
  buildings: Building[];
  research: ResearchNode[];
  unlockedBuildings: string[];
}
