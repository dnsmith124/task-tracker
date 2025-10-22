import { FC, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateAdventurerMultiplier, getAdventurerXPProgress } from '../utils/adventurerUtils';
import { ConfirmModal } from '@/features/core/components';
import styles from './AdventurerList.module.scss';

const AdventurerList: FC = () => {
  const { guildState, character, hireAdventurer, removeAdventurer, renameAdventurer } = useApp();
  const { adventurers, maxAdventurers } = guildState;
  const totalMultiplier = calculateAdventurerMultiplier(adventurers);
  
  const [adventurerToRemove, setAdventurerToRemove] = useState<string | null>(null);
  const [showHireConfirm, setShowHireConfirm] = useState(false);
  const [editingAdventurerId, setEditingAdventurerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const canHire = adventurers.length < maxAdventurers;
  const canRemove = adventurers.length > 1;
  const hireCost = adventurers.length * 5;
  const canAffordHire = character.renown >= hireCost;

  const handleHireClick = () => {
    setShowHireConfirm(true);
  };

  const handleConfirmHire = () => {
    hireAdventurer();
    setShowHireConfirm(false);
  };

  const handleCancelHire = () => {
    setShowHireConfirm(false);
  };

  const handleRemoveClick = (adventurerId: string) => {
    setAdventurerToRemove(adventurerId);
  };

  const handleConfirmRemove = () => {
    if (adventurerToRemove) {
      removeAdventurer(adventurerToRemove);
      setAdventurerToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setAdventurerToRemove(null);
  };

  const handleStartEdit = (adventurerId: string, currentName: string) => {
    setEditingAdventurerId(adventurerId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (adventurerId: string) => {
    if (editingName.trim()) {
      renameAdventurer(adventurerId, editingName);
    }
    setEditingAdventurerId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingAdventurerId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, adventurerId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(adventurerId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={styles.adventurerList}>
      <div className={styles.header}>
        <h3 className={styles.title}>Adventurers</h3>
        <div className={styles.summary}>
          <span className={styles.count}>{adventurers.length} / {maxAdventurers} adventurers</span>
          <span className={styles.multiplier}>×{totalMultiplier} multiplier</span>
        </div>
      </div>

      {canHire && (
        <button 
          className={`${styles.hireButton} ${!canAffordHire ? styles.disabled : ''}`}
          onClick={handleHireClick}
          disabled={!canAffordHire}
          title={canAffordHire ? `Hire a new adventurer for ${hireCost} renown` : `Not enough renown (need ${hireCost})`}
        >
          ✨ Hire Adventurer ({hireCost} renown)
        </button>
      )}

      <div className={styles.adventurers}>
        {adventurers.map((adventurer) => {
          const xpProgress = getAdventurerXPProgress(adventurer);
          const xpForNextLevel = (adventurer.level + 1) * 100;
          const xpInCurrentLevel = adventurer.xp;
          const isEditing = editingAdventurerId === adventurer.id;

          return (
            <div key={adventurer.id} className={styles.adventurer}>
              <div className={styles.adventurerInfo}>
                <div className={styles.level}>Lv.{adventurer.level}</div>
                <div className={styles.nameAndXp}>
                  <div className={styles.nameSection}>
                    {isEditing ? (
                      <div className={styles.nameEditContainer}>
                        <input
                          type="text"
                          className={styles.nameInput}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, adventurer.id)}
                          onBlur={() => handleSaveEdit(adventurer.id)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div 
                        className={styles.name}
                        onClick={() => handleStartEdit(adventurer.id, adventurer.name)}
                        title="Click to edit name"
                      >
                        {adventurer.name}
                      </div>
                    )}
                  </div>
                  <div className={styles.xpInfo}>
                    <div className={styles.xpBar}>
                      <div 
                        className={styles.xpFill} 
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                    <div className={styles.xpText}>
                      {xpInCurrentLevel}/{xpForNextLevel} XP
                    </div>
                  </div>
                </div>
              </div>
              {canRemove && (
                <button 
                  className={styles.removeButton}
                  onClick={() => handleRemoveClick(adventurer.id)}
                  title="Remove this adventurer"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {adventurers.length === 0 && (
        <div className={styles.emptyState}>
          <p>No adventurers yet. Build a Guild Hall to recruit them!</p>
        </div>
      )}

      {showHireConfirm && (
        <ConfirmModal
          title="✨ Hire Adventurer"
          message={`Hire a new level 1 adventurer for ${hireCost} renown? This adventurer will join your guild and contribute to your work multiplier.`}
          confirmText={`✓ Hire (${hireCost} renown)`}
          cancelText="✕ Cancel"
          onConfirm={handleConfirmHire}
          onCancel={handleCancelHire}
          variant="warning"
        />
      )}

      {adventurerToRemove && (
        <ConfirmModal
          title="⚠️ Remove Adventurer"
          message="Are you sure you want to remove this adventurer from your guild? This action cannot be undone."
          confirmText="✓ Remove"
          cancelText="✕ Cancel"
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
          variant="danger"
        />
      )}
    </div>
  );
};

export default AdventurerList;
