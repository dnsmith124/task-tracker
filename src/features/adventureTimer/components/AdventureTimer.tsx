import React, { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { TIMER_PRESETS, ADVENTURES, TimerPreset, TimerState } from '../types/Timer';
import { formatTime, getPresetDuration } from '../utils/timerUtils';
import { playAlertSound } from '@/features/settings/utils/soundUtils';
import styles from './AdventureTimer.module.scss';

const AdventureTimer: React.FC = () => {
  const { timerState, updateTimerState, completeWorkSession, settings } = useApp();
  const intervalRef = useRef<number | null>(null);

  // Timer countdown effect - using timestamp-based approach for accuracy across tab focus changes
  useEffect(() => {
    if (timerState.isRunning && timerState.remainingTime > 0 && timerState.startTimestamp) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (timerState.startTimestamp || now)) / 1000);
        const totalDuration = timerState.totalDuration || 0;
        const newRemainingTime = Math.max(0, totalDuration - elapsed);
        
        updateTimerState((prev: TimerState) => {
          // Calculate actual elapsed time for work duration
          const actualElapsed = (prev.totalDuration || 0) - newRemainingTime;
          
          return {
            ...prev,
            remainingTime: newRemainingTime,
            ...(prev.phase === 'work' && {
              workDurationCompleted: actualElapsed,
            }),
          };
        });
      }, 100); // Check more frequently for smoother updates
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.startTimestamp, timerState.totalDuration, updateTimerState]);

  const handleTimerComplete = () => {
    updateTimerState({ 
      isRunning: false,
      startTimestamp: undefined,
      totalDuration: undefined,
    });

    // Play alert sound
    playAlertSound(settings.alertSound, settings.alertVolume);

    if (timerState.phase === 'work') {
      // Award rewards for completed work session
      completeWorkSession();
      
      // Set up break timer
      const breakDuration = getPresetDuration(timerState.preset, 'break');
      updateTimerState({
        phase: 'break',
        remainingTime: breakDuration,
        workDurationCompleted: 0,
      });
    } else if (timerState.phase === 'break') {
      // Break complete, return to idle
      const workDuration = getPresetDuration(timerState.preset, 'work');
      updateTimerState({
        phase: 'idle',
        remainingTime: workDuration,
      });
    }
  };

  // Handle timer completion
  useEffect(() => {
    if (timerState.remainingTime === 0 && timerState.phase !== 'idle') {
      handleTimerComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState.remainingTime, timerState.phase]);

  const handlePlayPause = () => {
    if (timerState.phase === 'idle') {
      // Starting a new work session
      const workDuration = getPresetDuration(timerState.preset, 'work');
      updateTimerState({
        phase: 'work',
        isRunning: true,
        workDurationCompleted: 0,
        startTimestamp: Date.now(),
        totalDuration: workDuration,
      });
    } else if (timerState.isRunning) {
      // Pausing - calculate actual remaining time based on elapsed time
      const now = Date.now();
      const elapsed = Math.floor((now - (timerState.startTimestamp || now)) / 1000);
      const actualRemainingTime = Math.max(0, (timerState.totalDuration || 0) - elapsed);
      
      updateTimerState({
        isRunning: false,
        remainingTime: actualRemainingTime,
        startTimestamp: undefined,
      });
    } else {
      // Resuming - set new timestamp with current remaining time
      updateTimerState({
        isRunning: true,
        startTimestamp: Date.now(),
        totalDuration: timerState.remainingTime,
      });
    }
  };

  const handleStop = () => {
    const workDuration = getPresetDuration(timerState.preset, 'work');
    updateTimerState({
      phase: 'idle',
      isRunning: false,
      remainingTime: workDuration,
      workDurationCompleted: 0,
      startTimestamp: undefined,
      totalDuration: undefined,
    });
  };

  const handlePresetChange = (preset: TimerPreset) => {
    const workDuration = getPresetDuration(preset, 'work');
    updateTimerState({
      preset,
      phase: 'idle',
      isRunning: false,
      remainingTime: workDuration,
      workDurationCompleted: 0,
      startTimestamp: undefined,
      totalDuration: undefined,
    });
  };

  const handleAdventureChange = (adventureId: string) => {
    updateTimerState({
      selectedAdventure: adventureId,
    });
  };

  const selectedAdventure = ADVENTURES.find(a => a.id === timerState.selectedAdventure) || ADVENTURES[0];
  const progress = timerState.phase !== 'idle' 
    ? ((getPresetDuration(timerState.preset, timerState.phase) - timerState.remainingTime) / 
       getPresetDuration(timerState.preset, timerState.phase)) * 100
    : 0;

  return (
    <div className={styles.adventureTimer}>
      <div className={styles.header}>
        <h2 className={styles.title}>⏱️ Adventure Timer</h2>
      </div>

      <div className={styles.timerContent}>
        {/* Preset Selection */}
        <div className={styles.presetSection}>
          <div className={styles.presetButtons}>
            {(Object.keys(TIMER_PRESETS) as TimerPreset[]).map(preset => (
              <button
                key={preset}
                className={`${styles.presetButton} ${timerState.preset === preset ? styles.active : ''}`}
                onClick={() => handlePresetChange(preset)}
                disabled={timerState.phase !== 'idle'}
              >
                <div className={styles.presetName}>{TIMER_PRESETS[preset].name}</div>
                <div className={styles.presetDetails}>
                  {TIMER_PRESETS[preset].workDuration / 60}m / {TIMER_PRESETS[preset].breakDuration / 60}m
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Adventure Selection */}
        <div className={styles.adventureSection}>
          <select
            id="adventure-select"
            className={styles.adventureSelect}
            value={timerState.selectedAdventure}
            onChange={(e) => handleAdventureChange(e.target.value)}
            disabled={timerState.phase === 'work' || timerState.phase === 'break'}
          >
            {ADVENTURES.map(adventure => (
              <option key={adventure.id} value={adventure.id}>
                {adventure.name}
              </option>
            ))}
          </select>
          <p className={styles.adventureDescription}>{selectedAdventure.description}</p>
        </div>

        {/* Timer Display */}
        <div className={styles.timerDisplay}>
          <div className={styles.phaseLabel}>
            {timerState.phase === 'idle' && 'Ready'}
            {timerState.phase === 'work' && '🗡️ Working'}
            {timerState.phase === 'break' && '🍺 Break'}
          </div>
          <div className={styles.timeDisplay}>
            {formatTime(timerState.remainingTime)}
          </div>
          {timerState.phase !== 'idle' && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={`${styles.controlButton} ${styles.primary}`}
            onClick={handlePlayPause}
            disabled={timerState.remainingTime === 0}
          >
            {timerState.isRunning ? '⏸️' : '▶️'}
          </button>
          {timerState.phase !== 'idle' && (
            <button
              className={`${styles.controlButton} ${styles.secondary}`}
              onClick={handleStop}
            >
              ⏹️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdventureTimer;

