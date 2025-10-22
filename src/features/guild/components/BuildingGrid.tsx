import { FC, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Building, GridPosition } from '@/features/guild/types/Guild';
import { getBuildingAtPosition } from '@/features/guild/utils/buildingUtils';
import { getBuildingTemplate } from '@/features/guild/types/BuildingTemplates';
import BuildingTooltip from './BuildingTooltip';
import styles from './BuildingGrid.module.scss';

interface BuildingGridProps {
  onBuildingSelect?: (buildingId: string) => void;
  movingBuildingId?: string | null;
  onMovingComplete?: () => void;
}

const BuildingGrid: FC<BuildingGridProps> = ({ onBuildingSelect, movingBuildingId, onMovingComplete }) => {
  const { guildState, purchaseBuilding, moveBuilding } = useApp();
  const [selectedPosition, setSelectedPosition] = useState<GridPosition | null>(null);
  const [showBuildingMenu, setShowBuildingMenu] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);

  const handleCellClick = (position: GridPosition) => {
    const existingBuilding = getBuildingAtPosition(position, guildState.buildings);
    
    // If in move mode
    if (movingBuildingId) {
      if (!existingBuilding || existingBuilding.id === movingBuildingId) {
        // Move the building to this position
        moveBuilding(movingBuildingId, position);
        onMovingComplete?.();
      }
      return;
    }
    
    if (existingBuilding) {
      // Click on existing building - show building details
      onBuildingSelect?.(existingBuilding.id);
    } else {
      // Click on empty cell - show building placement menu
      setSelectedPosition(position);
      setShowBuildingMenu(true);
    }
  };

  const handleBuildingPlacement = (buildingType: string) => {
    if (selectedPosition) {
      purchaseBuilding(buildingType, selectedPosition);
      setShowBuildingMenu(false);
      setSelectedPosition(null);
    }
  };

  const handleCloseMenu = () => {
    setShowBuildingMenu(false);
    setSelectedPosition(null);
  };

  const renderCell = (x: number, y: number) => {
    const position: GridPosition = { x, y };
    const building = getBuildingAtPosition(position, guildState.buildings);
    const isSelected = selectedPosition && selectedPosition.x === x && selectedPosition.y === y;
    const isHovered = hoveredBuilding && hoveredBuilding.position.x === x && hoveredBuilding.position.y === y;
    const isMovingBuilding = building && building.id === movingBuildingId;
    const isValidMoveTarget = movingBuildingId && (!building || building.id === movingBuildingId);
    const buildingTemplate = building ? getBuildingTemplate(building.type) : null;
    
    return (
      <div
        key={`${x}-${y}`}
        className={`${styles.gridCell} ${isSelected ? styles.selected : ''} ${isMovingBuilding ? styles.moving : ''} ${isValidMoveTarget ? styles.validMoveTarget : ''}`}
        onClick={() => handleCellClick(position)}
        onMouseEnter={() => building && setHoveredBuilding(building)}
        onMouseLeave={() => setHoveredBuilding(null)}
        style={{ position: 'relative' }}
      >
        {building && (
          <div className={styles.building}>
            <div className={styles.buildingIcon}>
              {buildingTemplate?.icon}
            </div>
            <div className={styles.buildingLevel}>
              {building.level}
            </div>
          </div>
        )}
        
        {isHovered && buildingTemplate && building && !movingBuildingId && (
          <BuildingTooltip
            template={buildingTemplate}
            level={building.level}
            position="top"
            visible={true}
            className={styles.buildingTooltip}
          />
        )}
      </div>
    );
  };

  const availableBuildings = guildState.unlockedBuildings
    .map(id => getBuildingTemplate(id))
    .filter((template): template is NonNullable<typeof template> => template !== undefined)
    .filter(template => !guildState.buildings.some(building => building.type === template.id));

  return (
    <div className={styles.buildingGrid}>
      {movingBuildingId && (
        <div className={styles.moveInstructions}>
          🏗️ Click on an empty cell to move the building. Click the building card again to cancel.
        </div>
      )}
      
      <div className={styles.grid}>
        {Array.from({ length: 5 }, (_, y) => 
          Array.from({ length: 5 }, (_, x) => renderCell(x, y))
        )}
      </div>

      {showBuildingMenu && selectedPosition && !movingBuildingId && (
        <div className={styles.buildingMenu}>
          <div className={styles.menuHeader}>
            <h3>Place Building</h3>
            <button className={styles.closeButton} onClick={handleCloseMenu}>
              ✕
            </button>
          </div>
          <div className={styles.buildingOptions}>
            {availableBuildings.map(template => (
              <div
                key={template.id}
                className={styles.buildingOptionContainer}
                onMouseEnter={() => setHoveredBuilding({ id: template.id, type: template.id, level: 1, position: { x: 0, y: 0 } })}
                onMouseLeave={() => setHoveredBuilding(null)}
                style={{ position: 'relative' }}
              >
                <button
                  className={styles.buildingOption}
                  onClick={() => handleBuildingPlacement(template.id)}
                >
                  <div className={styles.optionIcon}>{template.icon}</div>
                  <div className={styles.optionName}>{template.name}</div>
                  <div className={styles.optionCost}>
                    {template.baseCost === 0 ? 'Free' : `${template.baseCost} gold`}
                  </div>
                </button>
                
                {hoveredBuilding?.id === template.id && (
                  <BuildingTooltip
                    template={template}
                    level={hoveredBuilding?.level || 1}
                    position="right"
                    visible={true}
                    className={styles.buildingOptionTooltip}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingGrid;
