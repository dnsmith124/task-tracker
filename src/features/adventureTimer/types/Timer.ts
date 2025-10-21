export type TimerPreset = 'short' | 'medium' | 'epic';

export type TimerPhase = 'work' | 'break' | 'idle';

export type RewardType = 'gold' | 'renown' | 'mana' | 'STR' | 'AGL' | 'MND' | 'VIG';

export interface PresetConfig {
  name: string;
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  bonusMultiplier: number; // for attribute bonuses
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  rewardType: RewardType;
  rewardPerIncrement?: number; // for gold/renown/mana (per 5 minutes)
  isAttributeBonus?: boolean; // true for STR/AGL/MND/VIG
}

export interface TimerState {
  preset: TimerPreset;
  phase: TimerPhase;
  remainingTime: number; // in seconds
  isRunning: boolean;
  selectedAdventure: string; // adventure id
  workDurationCompleted: number; // in seconds, tracks completed work time
  startTimestamp?: number; // timestamp when timer started/resumed (for accurate timing)
  totalDuration?: number; // total duration of current phase (for calculating workDurationCompleted)
}

export const TIMER_PRESETS: Record<TimerPreset, PresetConfig> = {
  short: {
    name: 'Short',
    workDuration: 25 * 60, // 25 minutes
    breakDuration: 5 * 60, // 5 minutes
    bonusMultiplier: 1,
  },
  medium: {
    name: 'Long',
    workDuration: 50 * 60, // 50 minutes
    breakDuration: 10 * 60, // 10 minutes
    bonusMultiplier: 2,
  },
  epic: {
    name: 'Epic',
    workDuration: 75 * 60, // 75 minutes
    breakDuration: 15 * 60, // 15 minutes
    bonusMultiplier: 3,
  },
};

export const ADVENTURES: Adventure[] = [
  {
    id: 'dungeon',
    name: 'Delve into a dungeon',
    description: 'Grants 5 gold pieces per 5min worked',
    rewardType: 'gold',
    rewardPerIncrement: 5,
  },
  {
    id: 'monster',
    name: 'Hunt a great monster',
    description: 'Grants 1 renown per 5min worked',
    rewardType: 'renown',
    rewardPerIncrement: 1,
  },
  {
    id: 'orb',
    name: 'Ponder your orb',
    description: 'Grants 1 mana per 5min worked',
    rewardType: 'mana',
    rewardPerIncrement: 1,
  },
  {
    id: 'strength',
    name: 'Lift heavy things',
    description: 'Complete to earn bonus STR on next level up',
    rewardType: 'STR',
    isAttributeBonus: true,
  },
  {
    id: 'acrobatics',
    name: 'Practice acrobatics',
    description: 'Complete to earn bonus AGL on next level up',
    rewardType: 'AGL',
    isAttributeBonus: true,
  },
  {
    id: 'library',
    name: 'Wander the stacks',
    description: 'Complete to earn bonus MND on next level up',
    rewardType: 'MND',
    isAttributeBonus: true,
  },
  {
    id: 'bladeyard',
    name: 'Spar in the bladeyard',
    description: 'Complete to earn bonus VIG on next level up',
    rewardType: 'VIG',
    isAttributeBonus: true,
  },
];

