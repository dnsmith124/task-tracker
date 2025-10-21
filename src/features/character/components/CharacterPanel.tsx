import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getXPForNextLevel, getXPProgress } from '@/features/character/utils/xpCalculations';
import styles from './CharacterPanel.module.scss';

const CharacterPanel: React.FC = () => {
  const { character, updateCharacter, assignAttributePoint } = useApp();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(character.name);

  const xpForNext = getXPForNextLevel(character.level);
  const xpProgress = getXPProgress(character.xp, character.level);

  const hasPendingBonuses = Object.values(character.pendingBonuses).some(v => v && v > 0);

  const handleNameEdit = () => {
    if (isEditingName) {
      if (tempName.trim()) {
        updateCharacter({ name: tempName.trim() });
      } else {
        setTempName(character.name);
      }
    }
    setIsEditingName(!isEditingName);
  };

  const handleAttributeIncrease = (attr: keyof typeof character.attributes) => {
    assignAttributePoint(attr);
  };

  return (
    <div className={styles.characterPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Character Sheet</h2>
      </div>

      <div className={styles.nameSection}>
        <div className={styles.nameDisplay}>
          {isEditingName ? (
            <input
              type="text"
              className={styles.nameInput}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameEdit();
                if (e.key === 'Escape') {
                  setTempName(character.name);
                  setIsEditingName(false);
                }
              }}
              autoFocus
            />
          ) : (
            <h3 style={{ margin: 0, flex: 1 }}>{character.name}</h3>
          )}
          <button className={styles.editButton} onClick={handleNameEdit}>
            {isEditingName ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      <div className={styles.levelSection}>
        <div className={styles.level}>
          Level <span>{character.level}</span>
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpLabel}>
            <span>Experience</span>
            <span>{character.xp} / {xpForNext} XP</span>
          </div>
          <div className={styles.xpProgress}>
            <div 
              className={styles.xpFill} 
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.resourcesSection}>
        <h3 className={styles.resourcesTitle}>Resources</h3>
        <div className={styles.resourcesList}>
          <div className={styles.resourceItem}>
            <span className={styles.resourceIcon}>💰</span>
            <span className={styles.resourceLabel}>Gold</span>
            <span className={styles.resourceValue}>{character.gold}</span>
          </div>
          <div className={styles.resourceItem}>
            <span className={styles.resourceIcon}>⭐</span>
            <span className={styles.resourceLabel}>Renown</span>
            <span className={styles.resourceValue}>{character.renown}</span>
          </div>
          <div className={styles.resourceItem}>
            <span className={styles.resourceIcon}>🔮</span>
            <span className={styles.resourceLabel}>Mana</span>
            <span className={styles.resourceValue}>{character.mana}</span>
          </div>
        </div>
      </div>

      {hasPendingBonuses && (
        <div className={styles.pendingBonusesSection}>
          <h3 className={styles.pendingBonusesTitle}>⚡ Pending Bonuses</h3>
          <p className={styles.pendingBonusesDescription}>
            These bonuses will be applied on your next level up:
          </p>
          <div className={styles.pendingBonusesList}>
            {(Object.keys(character.pendingBonuses) as Array<keyof typeof character.pendingBonuses>).map((attr) => {
              const bonus = character.pendingBonuses[attr];
              if (!bonus || bonus <= 0) return null;
              return (
                <div key={attr} className={styles.pendingBonusItem}>
                  <span className={styles.pendingBonusAttr}>{attr}</span>
                  <span className={styles.pendingBonusValue}>+{bonus}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.attributesSection}>
        <div className={styles.attributesHeader}>
          <h3 className={styles.attributesTitle}>Attributes</h3>
          {character.unassignedPoints > 0 && (
            <div className={styles.unassignedPoints}>
              {character.unassignedPoints} point{character.unassignedPoints !== 1 ? 's' : ''} available
            </div>
          )}
        </div>

        <div className={styles.attributesList}>
          {(Object.keys(character.attributes) as Array<keyof typeof character.attributes>).map((attr) => (
            <div key={attr} className={styles.attributeRow}>
              <span className={styles.attributeName}>{attr}</span>
              <span className={styles.attributeValue}>{character.attributes[attr]}</span>
              <div className={styles.attributeControls}>
                <button
                  className={styles.attributeButton}
                  onClick={() => handleAttributeIncrease(attr)}
                  disabled={character.unassignedPoints <= 0}
                  title="Increase attribute"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterPanel;

