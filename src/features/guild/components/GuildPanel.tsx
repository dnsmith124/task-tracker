import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BuildingGrid from './BuildingGrid';
import BuildingCard from './BuildingCard';
import AdventurerList from './AdventurerList';
import ResearchTreeModal from './ResearchTreeModal';
import styles from './GuildPanel.module.scss';

const GuildPanel: React.FC = () => {
  const { character, guildState } = useApp();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [movingBuildingId, setMovingBuildingId] = useState<string | null>(null);

  const selectedBuilding = selectedBuildingId 
    ? guildState.buildings.find(b => b.id === selectedBuildingId)
    : null;

  const handleBuildingSelect = (buildingId: string) => {
    // Don't allow selecting a different building while in move mode
    if (movingBuildingId) return;
    setSelectedBuildingId(buildingId);
  };

  const handleCloseBuildingCard = () => {
    setSelectedBuildingId(null);
    setMovingBuildingId(null);
  };

  const handleOpenResearchModal = () => {
    setShowResearchModal(true);
  };

  const handleCloseResearchModal = () => {
    setShowResearchModal(false);
  };

  const handleMoveMode = (buildingId: string) => {
    if (movingBuildingId === buildingId) {
      // Cancel move mode
      setMovingBuildingId(null);
    } else {
      // Enter move mode for this building
      setMovingBuildingId(buildingId);
    }
  };

  const handleMovingComplete = () => {
    setMovingBuildingId(null);
  };

  return (
    <div className={styles.guildPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>🏰 Guild</h2>
        <div className={styles.resources}>
          <div className={styles.resource}>
            <span className={styles.resourceIcon}>💰</span>
            <span className={styles.resourceValue}>{character.gold}</span>
          </div>
          <div className={styles.resource}>
            <span className={styles.resourceIcon}>⭐</span>
            <span className={styles.resourceValue}>{character.renown}</span>
          </div>
          <div className={styles.resource}>
            <span className={styles.resourceIcon}>🔮</span>
            <span className={styles.resourceValue}>{character.mana}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainSection}>
          <div className={styles.gridSection}>
            <div className={styles.sectionHeader}>
              <h3>Building Grid</h3>
              <button 
                className={styles.researchButton}
                onClick={handleOpenResearchModal}
              >
                🔬 Research Tree
              </button>
            </div>
            <div className={styles.gridSectionInner}>
              <BuildingGrid 
                onBuildingSelect={handleBuildingSelect}
                movingBuildingId={movingBuildingId}
                onMovingComplete={handleMovingComplete}
              />
              {selectedBuilding && (
                <BuildingCard 
                  building={selectedBuilding} 
                  onClose={handleCloseBuildingCard}
                  onMoveMode={handleMoveMode}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <AdventurerList />
        </div>
      </div>

      <ResearchTreeModal 
        isOpen={showResearchModal}
        onClose={handleCloseResearchModal}
      />
    </div>
  );
};

export default GuildPanel;
