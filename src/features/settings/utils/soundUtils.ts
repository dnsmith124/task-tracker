import { AlertSound } from '../types/Settings';

/**
 * Plays an alert sound using Web Audio API
 * @param soundType - The type of sound to play
 * @param volume - Volume level (0-100)
 */
export const playAlertSound = (soundType: AlertSound, volume: number): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = audioContext.createGain();
    
    // Convert volume (0-100) to gain (0-1)
    gainNode.gain.value = volume / 100;
    gainNode.connect(audioContext.destination);

    switch (soundType) {
      case 'bell':
        playBellSound(audioContext, gainNode);
        break;
      case 'chime':
        playChimeSound(audioContext, gainNode);
        break;
      case 'gentle':
        playGentleSound(audioContext, gainNode);
        break;
    }
  } catch (error) {
    console.error('Failed to play alert sound:', error);
  }
};

/**
 * Creates a bell-like sound with a clear tone and decay
 */
const playBellSound = (audioContext: AudioContext, gainNode: GainNode): void => {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  
  envelope.gain.setValueAtTime(0, audioContext.currentTime);
  envelope.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

  oscillator.connect(envelope);
  envelope.connect(gainNode);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1.5);
};

/**
 * Creates a chime sound with multiple harmonic tones
 */
const playChimeSound = (audioContext: AudioContext, gainNode: GainNode): void => {
  const frequencies = [523.25, 659.25, 783.99]; // C, E, G
  const startTime = audioContext.currentTime;

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, startTime);
    
    const delay = index * 0.1;
    envelope.gain.setValueAtTime(0, startTime + delay);
    envelope.gain.linearRampToValueAtTime(0.3, startTime + delay + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, startTime + delay + 1.2);

    oscillator.connect(envelope);
    envelope.connect(gainNode);

    oscillator.start(startTime + delay);
    oscillator.stop(startTime + delay + 1.2);
  });
};

/**
 * Creates a gentle, soothing tone
 */
const playGentleSound = (audioContext: AudioContext, gainNode: GainNode): void => {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  
  envelope.gain.setValueAtTime(0, audioContext.currentTime);
  envelope.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.3);
  envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

  oscillator.connect(envelope);
  envelope.connect(gainNode);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);
};

