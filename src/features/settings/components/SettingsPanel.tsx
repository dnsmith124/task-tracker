import React from 'react';
import { useApp } from '@/context/AppContext';
import { ALERT_SOUND_OPTIONS, AlertSound } from '../types/Settings';
import { playAlertSound } from '../utils/soundUtils';
import styles from './SettingsPanel.module.scss';

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ alertSound: e.target.value as AlertSound });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ alertVolume: parseInt(e.target.value) });
  };

  const handleTestSound = () => {
    playAlertSound(settings.alertSound, settings.alertVolume);
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>⚙️ Settings</h2>
        <p className={styles.subtitle}>Configure your timer alerts and preferences</p>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>Timer Completion Alert</h3>
          
          <div className={styles.settingGroup}>
            <label htmlFor="alert-sound" className={styles.label}>
              Alert Sound
            </label>
            <select
              id="alert-sound"
              className={styles.select}
              value={settings.alertSound}
              onChange={handleSoundChange}
            >
              {ALERT_SOUND_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label htmlFor="alert-volume" className={styles.label}>
              Volume: {settings.alertVolume}%
            </label>
            <div className={styles.volumeControl}>
              <input
                type="range"
                id="alert-volume"
                className={styles.slider}
                min="0"
                max="100"
                value={settings.alertVolume}
                onChange={handleVolumeChange}
              />
              <div className={styles.volumeIndicator}>
                <div 
                  className={styles.volumeFill}
                  style={{ width: `${settings.alertVolume}%` }}
                />
              </div>
            </div>
          </div>

          <div className={styles.testButtonContainer}>
            <button
              className={styles.testButton}
              onClick={handleTestSound}
            >
              🔊 Test Alert Sound
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

