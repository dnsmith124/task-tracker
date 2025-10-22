import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ResearchNode as ResearchNodeType } from '../types/Guild';
import { canPurchaseResearch, getStatColor } from '../utils/researchUtils';
import { getBuildingTemplate } from '../types/BuildingTemplates';
import styles from './ResearchNode.module.scss';

interface ResearchNodeProps {
  node: ResearchNodeType;
  onPurchase: (nodeId: string) => void;
  gridSpacing: number;
}

const ResearchNode: React.FC<ResearchNodeProps> = ({ node, onPurchase, gridSpacing }) => {
  const { character, guildState } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const canPurchase = canPurchaseResearch(node, character, guildState);
  const statColor = getStatColor(node.requiredStat);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag when clicking node
    if (canPurchase) {
      onPurchase(node.id);
    }
  };

  const getNodeState = () => {
    if (node.purchased) return 'purchased';
    if (canPurchase) return 'available';
    return 'locked';
  };

  const nodeState = getNodeState();

  const getTooltipPosition = () => {
    // Position tooltip to avoid edges
    const x = node.position.x;
    const y = node.position.y;
    
    if (x <= -2) return 'right';
    if (x >= 2) return 'left';
    if (y <= -2) return 'bottom';
    if (y >= 2) return 'top';
    
    return 'top';
  };

  const tooltipPosition = getTooltipPosition();

  const formatEffectType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatEffectValue = (type: string, value: number): string => {
    if (type.includes('efficiency')) {
      return `+${(value * 100).toFixed(0)}%`;
    }
    return `+${value}`;
  };

  return (
    <div
      className={`${styles.researchNode} ${styles[nodeState]}`}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        '--stat-color': statColor,
        left: `${(node.position.x + 3) * gridSpacing}px`,
        top: `${(node.position.y + 3) * gridSpacing}px`,
      } as React.CSSProperties}
    >
      <div className={styles.nodeIcon}>
        {node.purchased ? '✓' : '🔬'}
      </div>
      
      <div className={styles.nodeInfo}>
        <div className={styles.nodeName}>{node.name}</div>
        <div className={styles.nodeRequirements}>
          <div className={styles.statRequirement}>
            {node.requiredStat} ≥ {node.statMinimum}
          </div>
          <div className={styles.manaCost}>
            {node.manaCost} mana
          </div>
        </div>
      </div>

      {nodeState === 'locked' && (
        <div className={styles.lockedOverlay}>
          <div className={styles.lockedText}>🔒</div>
        </div>
      )}

      {showTooltip && (
        <div className={`${styles.tooltip} ${styles[tooltipPosition]}`}>
          <div className={styles.tooltipHeader}>
            <div className={styles.tooltipTitle}>{node.name}</div>
            <div className={styles.tooltipSubtitle}>{node.description}</div>
          </div>

          <div className={styles.tooltipSection}>
            <div className={styles.tooltipSectionTitle}>Requirements</div>
            <div className={styles.tooltipRequirements}>
              <div className={styles.tooltipRequirement}>
                <span className={styles.tooltipLabel}>{node.requiredStat}:</span>
                <span className={styles.tooltipValue} style={{ color: statColor }}>
                  {node.statMinimum}+
                </span>
              </div>
              <div className={styles.tooltipRequirement}>
                <span className={styles.tooltipLabel}>Mana:</span>
                <span className={styles.tooltipValue} style={{ color: '#d4af37' }}>
                  {node.manaCost}
                </span>
              </div>
            </div>
          </div>

          {node.unlocks.length > 0 && (
            <div className={styles.tooltipSection}>
              <div className={styles.tooltipSectionTitle}>Unlocks</div>
              {node.unlocks.map(buildingId => {
                const building = getBuildingTemplate(buildingId);
                if (!building) return null;
                
                return (
                  <div key={buildingId} className={styles.tooltipBuilding}>
                    <div className={styles.tooltipBuildingHeader}>
                      <span className={styles.tooltipBuildingIcon}>{building.icon}</span>
                      <span className={styles.tooltipBuildingName}>{building.name}</span>
                    </div>
                    <div className={styles.tooltipBuildingDesc}>{building.description}</div>
                    {building.effects.length > 0 && (
                      <div className={styles.tooltipEffects}>
                        {building.effects.map((effect, idx) => (
                          <div key={idx} className={styles.tooltipEffect}>
                            {formatEffectType(effect.type)}: 
                            <span className={styles.tooltipEffectValue}>
                              {formatEffectValue(effect.type, effect.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {nodeState === 'purchased' && (
            <div className={styles.tooltipStatus}>✓ Purchased</div>
          )}
          {nodeState === 'available' && (
            <div className={`${styles.tooltipStatus} ${styles.available}`}>
              Click to purchase
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchNode;
