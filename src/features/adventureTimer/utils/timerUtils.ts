import { TimerState, TIMER_PRESETS, TimerPreset } from '../types/Timer';

export const getInitialTimerState = (): TimerState => ({
  preset: 'short',
  phase: 'idle',
  remainingTime: TIMER_PRESETS.short.workDuration,
  isRunning: false,
  selectedAdventure: 'dungeon', // default adventure
  workDurationCompleted: 0,
});

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateIncrements = (seconds: number): number => {
  // Calculate number of complete 5-minute increments
  return Math.floor(seconds / (5 * 60));
};

export const getPresetDuration = (preset: TimerPreset, phase: 'work' | 'break'): number => {
  const config = TIMER_PRESETS[preset];
  return phase === 'work' ? config.workDuration : config.breakDuration;
};

export const getPresetBonusMultiplier = (preset: TimerPreset): number => {
  return TIMER_PRESETS[preset].bonusMultiplier;
};

