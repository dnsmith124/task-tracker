import { GuildState, Building } from '../types/Guild';
import { createInitialAdventurers } from './adventurerUtils';
import { getResearchTreeLayout } from './researchUtils';
import { getTotalBuildingEffects } from './buildingUtils';

export const getInitialGuildState = (): GuildState => {
  // Create initial Guild Hall at center position
  const initialGuildHall: Building = {
    id: crypto.randomUUID(),
    type: 'guild_hall',
    level: 1,
    position: { x: 2, y: 2 }
  };

  // Calculate max adventurers from buildings
  const maxAdventurers = getTotalBuildingEffects([initialGuildHall], 'adventurer_capacity');

  // Create initial adventurer (start with just 1)
  const initialAdventurers = createInitialAdventurers(1);

  // Get research tree layout
  const researchTree = getResearchTreeLayout();

  return {
    adventurers: initialAdventurers,
    maxAdventurers: maxAdventurers,
    buildings: [initialGuildHall],
    research: researchTree,
    unlockedBuildings: ['guild_hall', 'blacksmith', 'sparring_ring', 'library']
  };
};
