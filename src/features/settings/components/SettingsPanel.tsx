import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ALERT_SOUND_OPTIONS, AlertSound } from '../types/Settings';
import { playAlertSound } from '../utils/soundUtils';
import { Attributes } from '@/features/character/types/Character';
import styles from './SettingsPanel.module.scss';

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, character, updateCharacter } = useApp();
  
  // Debug panel state
  const [debugGold, setDebugGold] = useState<string>('');
  const [debugRenown, setDebugRenown] = useState<string>('');
  const [debugMana, setDebugMana] = useState<string>('');
  const [debugSTR, setDebugSTR] = useState<string>('');
  const [debugAGL, setDebugAGL] = useState<string>('');
  const [debugMND, setDebugMND] = useState<string>('');
  const [debugVIG, setDebugVIG] = useState<string>('');

  const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ alertSound: e.target.value as AlertSound });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ alertVolume: parseInt(e.target.value) });
  };

  const handleTestSound = () => {
    playAlertSound(settings.alertSound, settings.alertVolume);
  };

  // Debug handlers
  const handleAddGold = () => {
    const amount = parseInt(debugGold);
    if (!isNaN(amount) && amount > 0) {
      updateCharacter({ gold: character.gold + amount });
      setDebugGold('');
    }
  };

  const handleAddRenown = () => {
    const amount = parseInt(debugRenown);
    if (!isNaN(amount) && amount > 0) {
      updateCharacter({ renown: character.renown + amount });
      setDebugRenown('');
    }
  };

  const handleAddMana = () => {
    const amount = parseInt(debugMana);
    if (!isNaN(amount) && amount > 0) {
      updateCharacter({ mana: character.mana + amount });
      setDebugMana('');
    }
  };

  const handleSetStat = (stat: keyof Attributes, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateCharacter({
        attributes: {
          ...character.attributes,
          [stat]: numValue,
        },
      });
    }
  };

  const handleSetSTR = () => {
    handleSetStat('STR', debugSTR);
    setDebugSTR('');
  };

  const handleSetAGL = () => {
    handleSetStat('AGL', debugAGL);
    setDebugAGL('');
  };

  const handleSetMND = () => {
    handleSetStat('MND', debugMND);
    setDebugMND('');
  };

  const handleSetVIG = () => {
    handleSetStat('VIG', debugVIG);
    setDebugVIG('');
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

        {/* Debug Panel */}
        <div className={`${styles.settingSection} ${styles.debugSection}`}>
          <h3 className={styles.sectionTitle}>🐛 Debug Tools</h3>
          <p className={styles.debugWarning}>⚠️ For development and testing purposes only</p>
          
          {/* Resources */}
          <div className={styles.debugGroup}>
            <h4 className={styles.debugGroupTitle}>Resources</h4>
            
            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                💰 Add Gold (Current: {character.gold})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugGold}
                  onChange={(e) => setDebugGold(e.target.value)}
                  placeholder="Amount"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleAddGold}
                  disabled={!debugGold || parseInt(debugGold) <= 0}
                >
                  Add
                </button>
              </div>
            </div>

            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                ⭐ Add Renown (Current: {character.renown})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugRenown}
                  onChange={(e) => setDebugRenown(e.target.value)}
                  placeholder="Amount"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleAddRenown}
                  disabled={!debugRenown || parseInt(debugRenown) <= 0}
                >
                  Add
                </button>
              </div>
            </div>

            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                🔮 Add Mana (Current: {character.mana})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugMana}
                  onChange={(e) => setDebugMana(e.target.value)}
                  placeholder="Amount"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleAddMana}
                  disabled={!debugMana || parseInt(debugMana) <= 0}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className={styles.debugGroup}>
            <h4 className={styles.debugGroupTitle}>Attributes</h4>
            
            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                💪 Set STR (Current: {character.attributes.STR})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugSTR}
                  onChange={(e) => setDebugSTR(e.target.value)}
                  placeholder="Value"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleSetSTR}
                  disabled={!debugSTR || parseInt(debugSTR) < 0}
                >
                  Set
                </button>
              </div>
            </div>

            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                🏃 Set AGL (Current: {character.attributes.AGL})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugAGL}
                  onChange={(e) => setDebugAGL(e.target.value)}
                  placeholder="Value"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleSetAGL}
                  disabled={!debugAGL || parseInt(debugAGL) < 0}
                >
                  Set
                </button>
              </div>
            </div>

            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                🧠 Set MND (Current: {character.attributes.MND})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugMND}
                  onChange={(e) => setDebugMND(e.target.value)}
                  placeholder="Value"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleSetMND}
                  disabled={!debugMND || parseInt(debugMND) < 0}
                >
                  Set
                </button>
              </div>
            </div>

            <div className={styles.debugControl}>
              <label className={styles.debugLabel}>
                ❤️ Set VIG (Current: {character.attributes.VIG})
              </label>
              <div className={styles.debugInputGroup}>
                <input
                  type="number"
                  className={styles.debugInput}
                  value={debugVIG}
                  onChange={(e) => setDebugVIG(e.target.value)}
                  placeholder="Value"
                  min="0"
                />
                <button
                  className={styles.debugButton}
                  onClick={handleSetVIG}
                  disabled={!debugVIG || parseInt(debugVIG) < 0}
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

