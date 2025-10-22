import { FC } from 'react';
import { BuildingTemplate, BuildingEffect } from '@/features/guild/types/Guild';
import Tooltip, { TooltipPosition } from '@/features/core/components/Tooltip';
import styles from './BuildingTooltip.module.scss';

interface BuildingTooltipProps {
  template: BuildingTemplate;
  level?: number;
  className?: string;
  position?: TooltipPosition;
  visible?: boolean;
}

const BuildingTooltip: FC<BuildingTooltipProps> = ({ 
  template, 
  level = 1, 
  className,
  position = 'top',
  visible = true
}) => {
  const getEffectDescription = (effect: BuildingEffect) => {
    switch (effect.type) {
      case 'gold_per_adventure':
        return `+${effect.value * level} gold per adventure`;
      case 'mana_per_break':
        return `+${effect.value * level} mana per break`;
      case 'gold_per_quest':
        return `+${effect.value * level} gold per quest/campaign`;
      case 'mana_per_adventure':
        return `+${effect.value * level} mana per adventure`;
      case 'gold_per_break':
        return `+${effect.value * level} gold per break`;
      case 'renown_per_quest':
        return `+${effect.value * level} renown per quest/campaign`;
      case 'adventurer_xp_per_work':
        return `+${effect.value * level} XP to adventurers per work session`;
      case 'adventurer_efficiency':
        return `+${(effect.value * level * 100).toFixed(0)}% adventurer efficiency`;
      case 'adventurer_capacity':
        return `+${effect.value * level} adventurer capacity`;
      default:
        return effect.type;
    }
  };

  return (
    <Tooltip className={className} position={position} visible={visible}>
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipIcon}>{template.icon}</div>
        <div className={styles.tooltipTitle}>
          <div className={styles.tooltipName}>{template.name}</div>
          {level > 1 && <div className={styles.tooltipLevel}>Level {level}</div>}
        </div>
      </div>
      
      <div className={styles.tooltipDescription}>
        {template.description}
      </div>
      
      <div className={styles.tooltipEffects}>
        <div className={styles.tooltipEffectsTitle}>Effects:</div>
        {template.effects.map((effect, index) => (
          <div key={index} className={styles.tooltipEffect}>
            {getEffectDescription(effect)}
          </div>
        ))}
      </div>
    </Tooltip>
  );
};

export default BuildingTooltip;
