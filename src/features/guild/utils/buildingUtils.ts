import { Building, GridPosition, BuildingEffect } from '../types/Guild';
import { getBuildingTemplate } from '../types/BuildingTemplates';

export const getBuildingCost = (buildingType: string, level: number): number => {
  const template = getBuildingTemplate(buildingType);
  if (!template) return 0;
  
  // Free starter building
  if (template.baseCost === 0) return 0;
  
  // Scaling cost: baseCost * (1.5 ^ (level - 1))
  return Math.floor(template.baseCost * Math.pow(1.5, level - 1));
};

export const getBuildingEffect = (buildingType: string, level: number, effectType: string): number => {
  const template = getBuildingTemplate(buildingType);
  if (!template) return 0;
  
  const effect = template.effects.find(e => e.type === effectType);
  if (!effect) return 0;
  
  // Effects scale with level
  return effect.value * level;
};

export const canPlaceBuilding = (position: GridPosition, existingBuildings: Building[]): boolean => {
  // Check if position is within grid bounds
  if (position.x < 0 || position.x > 4 || position.y < 0 || position.y > 4) {
    return false;
  }
  
  // Check if position is already occupied
  return !existingBuildings.some(building => 
    building.position.x === position.x && building.position.y === position.y
  );
};

export const calculateRefund = (buildingType: string, level: number): number => {
  // Full cost refund
  return getBuildingCost(buildingType, level);
};

export const getAvailableBuildings = (unlockedBuildings: string[]) => {
  const { BUILDING_TEMPLATES } = require('../types/BuildingTemplates');
  return BUILDING_TEMPLATES.filter((template: any) => 
    template.unlockedByDefault || unlockedBuildings.includes(template.id)
  );
};

export const getBuildingAtPosition = (position: GridPosition, buildings: Building[]): Building | undefined => {
  return buildings.find(building => 
    building.position.x === position.x && building.position.y === position.y
  );
};

export const canUpgradeBuilding = (building: Building): boolean => {
  const template = getBuildingTemplate(building.type);
  if (!template) return false;
  
  return building.level < template.maxLevel;
};

export const getTotalBuildingEffects = (buildings: Building[], effectType: string): number => {
  return buildings.reduce((total, building) => {
    return total + getBuildingEffect(building.type, building.level, effectType);
  }, 0);
};
