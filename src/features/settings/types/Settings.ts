export type AlertSound = 'bell' | 'chime' | 'gentle';

export interface Settings {
  alertSound: AlertSound;
  alertVolume: number; // 0-100
}

export const DEFAULT_SETTINGS: Settings = {
  alertSound: 'bell',
  alertVolume: 50,
};

export const ALERT_SOUND_OPTIONS: { value: AlertSound; label: string }[] = [
  { value: 'bell', label: '🔔 Bell' },
  { value: 'chime', label: '🎵 Chime' },
  { value: 'gentle', label: '✨ Gentle Tone' },
];

