import React from 'react';
import { useApp } from '@/context/AppContext';
import { Building } from '../types/Guild';
import { getBuildingTemplate } from '../types/BuildingTemplates';
import { getBuildingCost, canUpgradeBuilding, calculateRefund } from '../utils/buildingUtils';
import styles from './BuildingCard.module.scss';

interface BuildingCardProps {
  building: Building;
  onClose: () => void;
  onMoveMode?: (buildingId: string) => void;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building, onClose, onMoveMode }) => {
  const { character, upgradeBuilding, removeBuilding } = useApp();
  const template = getBuildingTemplate(building.type);

  if (!template) {
    return null;
  }

  const upgradeCost = getBuildingCost(building.type, building.level + 1);
  const refundAmount = calculateRefund(building.type, building.level);
  const canUpgrade = canUpgradeBuilding(building) && character.gold >= upgradeCost;
  const isGuildHall = building.type === 'guild_hall';

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeBuilding(building.id);
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Remove ${template.name} and refund ${refundAmount} gold?`)) {
      removeBuilding(building.id);
      onClose();
    }
  };

  const handleMove = () => {
    onMoveMode?.(building.id);
  };

  const getEffectDescription = (effect: any) => {
    switch (effect.type) {
      case 'gold_per_adventure':
        return `+${effect.value * building.level} gold per adventure`;
      case 'mana_per_break':
        return `+${effect.value * building.level} mana per break`;
      case 'gold_per_quest':
        return `+${effect.value * building.level} gold per quest/campaign`;
      case 'mana_per_adventure':
        return `+${effect.value * building.level} mana per adventure`;
      case 'gold_per_break':
        return `+${effect.value * building.level} gold per break`;
      case 'renown_per_quest':
        return `+${effect.value * building.level} renown per quest/campaign`;
      case 'adventurer_xp_per_work':
        return `+${effect.value * building.level} XP to adventurers per work session`;
      case 'adventurer_efficiency':
        return `+${(effect.value * building.level * 100).toFixed(0)}% adventurer efficiency`;
      case 'adventurer_capacity':
        return `+${effect.value * building.level} adventurer capacity`;
      default:
        return effect.type;
    }
  };

  return (
    <div className={styles.buildingCard}>
      <div className={styles.header}>
        <div className={styles.buildingInfo}>
          <div className={styles.icon}>{template.icon}</div>
          <div className={styles.details}>
            <h3 className={styles.name}>{template.name}</h3>
            <div className={styles.level}>Level {building.level}</div>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.description}>
        {template.description}
      </div>

      <div className={styles.effects}>
        <h4>Current Effects:</h4>
        {template.effects.map((effect, index) => (
          <div key={index} className={styles.effect}>
            {getEffectDescription(effect)}
          </div>
        ))}
      </div>

      {building.level < template.maxLevel && (
        <div className={styles.upgradeSection}>
          <h4>Next Level Effects:</h4>
          {template.effects.map((effect, index) => (
            <div key={index} className={styles.effect}>
              {getEffectDescription({ ...effect, value: effect.value * (building.level + 1) })}
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        {building.level < template.maxLevel && (
          <button
            className={`${styles.actionButton} ${styles.upgradeButton}`}
            onClick={handleUpgrade}
            disabled={!canUpgrade}
          >
            Upgrade ({upgradeCost} gold)
          </button>
        )}
        
        <button
          className={`${styles.actionButton} ${styles.moveButton}`}
          onClick={handleMove}
        >
          Move Building
        </button>
        
        {!isGuildHall && (
          <button
            className={`${styles.actionButton} ${styles.removeButton}`}
            onClick={handleRemove}
          >
            Remove ({refundAmount} gold refund)
          </button>
        )}
      </div>
    </div>
  );
};

export default BuildingCard;
