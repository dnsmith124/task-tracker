import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Quest } from '@/features/quests/types/Quest';
import { Campaign } from '@/features/campaigns/types/Campaign';
import { Character, PendingBonus } from '@/features/character/types/Character';
import { calculateLevelUp } from '@/features/character/utils/xpCalculations';
import { toast } from 'react-toastify';
import { TimerState } from '@/features/adventureTimer/types/Timer';
import { getInitialTimerState, calculateIncrements, getPresetBonusMultiplier } from '@/features/adventureTimer/utils/timerUtils';
import { ADVENTURES } from '@/features/adventureTimer/types/Timer';
import { Settings, DEFAULT_SETTINGS } from '@/features/settings/types/Settings';
import { GuildState, Building, GridPosition } from '@/features/guild/types/Guild';
import { getInitialGuildState } from '@/features/guild/utils/guildUtils';
import { getBuildingCost, canPlaceBuilding, calculateRefund, getTotalBuildingEffects } from '@/features/guild/utils/buildingUtils';
import { calculateAdventurerMultiplier, distributeXPToAdventurers, createAdventurer } from '@/features/guild/utils/adventurerUtils';
import { canPurchaseResearch } from '@/features/guild/utils/researchUtils';
import { getBuildingTemplate } from '@/features/guild/types/BuildingTemplates';

interface AppState {
  quests: Quest[];
  campaigns: Campaign[];
  character: Character;
  timerState: TimerState;
  settings: Settings;
  guildState: GuildState;
}

interface AppContextType extends AppState {
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt'>) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  completeCampaign: (id: string) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  assignAttributePoint: (attribute: keyof Character['attributes']) => void;
  awardXP: (amount: number) => void;
  getCampaignQuests: (campaignId: string) => Quest[];
  hasUncompletedQuests: (campaignId: string) => boolean;
  updateTimerState: (updates: Partial<TimerState> | ((prev: TimerState) => Partial<TimerState>)) => void;
  completeWorkSession: () => void;
  updateSettings: (updates: Partial<Settings>) => void;
  // Guild management functions
  purchaseBuilding: (buildingType: string, position: GridPosition) => void;
  upgradeBuilding: (buildingId: string) => void;
  removeBuilding: (buildingId: string) => void;
  moveBuilding: (buildingId: string, newPosition: GridPosition) => void;
  purchaseResearch: (nodeId: string) => void;
  levelUpAdventurer: () => void;
  completeBreakSession: () => void;
  hireAdventurer: () => void;
  removeAdventurer: (adventurerId: string) => void;
  renameAdventurer: (adventurerId: string, newName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'productiquest_data';

const getInitialCharacter = (): Character => ({
  name: 'Adventurer',
  xp: 0,
  level: 1,
  attributes: {
    STR: 0,
    AGL: 0,
    MND: 0,
    VIG: 0,
  },
  unassignedPoints: 0,
  gold: 0,
  renown: 0,
  mana: 0,
  pendingBonuses: {},
});

const loadFromStorage = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure character has all new properties (for backward compatibility)
      if (parsed.character) {
        parsed.character = {
          ...getInitialCharacter(),
          ...parsed.character,
          pendingBonuses: parsed.character.pendingBonuses || {},
        };
      }
      // Ensure timer state exists
      if (!parsed.timerState) {
        parsed.timerState = getInitialTimerState();
      }
      // Ensure settings exists
      if (!parsed.settings) {
        parsed.settings = DEFAULT_SETTINGS;
      }
      // Ensure guild state exists
      if (!parsed.guildState) {
        parsed.guildState = getInitialGuildState();
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return {
    quests: [],
    campaigns: [],
    character: getInitialCharacter(),
    timerState: getInitialTimerState(),
    settings: DEFAULT_SETTINGS,
    guildState: getInitialGuildState(),
  };
};

const saveToStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const addQuest = (quest: Omit<Quest, 'id' | 'createdAt'>) => {
    const newQuest: Quest = {
      ...quest,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, quests: [...prev.quests, newQuest] }));
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => (q.id === id ? { ...q, ...updates } : q)),
    }));
  };

  const deleteQuest = (id: string) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== id),
    }));
  };

  const completeQuest = (id: string) => {
    const quest = state.quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    updateQuest(id, { completed: true });
    
    // Award XP based on quest type
    const xpAmount = quest.type === 'main' ? 25 : 10;
    awardXP(xpAmount);

    // Apply building effects for quest completion
    const buildingGoldBonus = getTotalBuildingEffects(state.guildState.buildings, 'gold_per_quest');
    const buildingRenownBonus = getTotalBuildingEffects(state.guildState.buildings, 'renown_per_quest');

    if (buildingGoldBonus > 0 || buildingRenownBonus > 0) {
      setState(prev => ({
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold + buildingGoldBonus,
          renown: prev.character.renown + buildingRenownBonus,
        },
      }));

      const bonusText = [];
      if (buildingGoldBonus > 0) bonusText.push(`${buildingGoldBonus} gold`);
      if (buildingRenownBonus > 0) bonusText.push(`${buildingRenownBonus} renown`);
      
      if (bonusText.length > 0) {
        toast.success(`🏰 Guild buildings granted: ${bonusText.join(', ')}!`, { autoClose: 3000 });
      }
    }
  };

  const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, campaigns: [...prev.campaigns, newCampaign] }));
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setState(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteCampaign = (id: string) => {
    setState(prev => ({
      ...prev,
      campaigns: prev.campaigns.filter(c => c.id !== id),
      quests: prev.quests.filter(q => q.campaignId !== id),
    }));
  };

  const completeCampaign = (id: string) => {
    const campaign = state.campaigns.find(c => c.id === id);
    if (!campaign || campaign.completed) return;

    updateCampaign(id, { completed: true });
    
    // Award campaign XP
    awardXP(100);

    // Apply building effects for campaign completion (same as quest completion)
    const buildingGoldBonus = getTotalBuildingEffects(state.guildState.buildings, 'gold_per_quest');
    const buildingRenownBonus = getTotalBuildingEffects(state.guildState.buildings, 'renown_per_quest');

    if (buildingGoldBonus > 0 || buildingRenownBonus > 0) {
      setState(prev => ({
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold + buildingGoldBonus,
          renown: prev.character.renown + buildingRenownBonus,
        },
      }));

      const bonusText = [];
      if (buildingGoldBonus > 0) bonusText.push(`${buildingGoldBonus} gold`);
      if (buildingRenownBonus > 0) bonusText.push(`${buildingRenownBonus} renown`);
      
      if (bonusText.length > 0) {
        toast.success(`🏰 Guild buildings granted: ${bonusText.join(', ')}!`, { autoClose: 3000 });
      }
    }
  };

  const updateCharacter = (updates: Partial<Character>) => {
    setState(prev => ({
      ...prev,
      character: { ...prev.character, ...updates },
    }));
  };

  const assignAttributePoint = (attribute: keyof Character['attributes']) => {
    setState(prev => {
      if (prev.character.unassignedPoints <= 0) return prev;
      
      return {
        ...prev,
        character: {
          ...prev.character,
          attributes: {
            ...prev.character.attributes,
            [attribute]: prev.character.attributes[attribute] + 1,
          },
          unassignedPoints: prev.character.unassignedPoints - 1,
        },
      };
    });
  };

  const awardXP = (amount: number) => {
    setState(prev => {
      const newXP = prev.character.xp + amount;
      const levelUpResult = calculateLevelUp(newXP, prev.character.level);

      if (levelUpResult) {
        const { newLevel, remainingXP, pointsGained } = levelUpResult;
        const newUnassignedPoints = prev.character.unassignedPoints + pointsGained;
        
        // Apply pending bonuses to attributes
        const updatedAttributes = { ...prev.character.attributes };
        const pendingBonuses = prev.character.pendingBonuses;
        let bonusesApplied: string[] = [];

        (Object.keys(pendingBonuses) as Array<keyof PendingBonus>).forEach(attr => {
          const bonus = pendingBonuses[attr];
          if (bonus && bonus > 0) {
            updatedAttributes[attr] += bonus;
            bonusesApplied.push(`+${bonus} ${attr}`);
          }
        });

        // Show level up notification with bonuses if any
        let message = `🎉 Congratulations! You've reached level ${newLevel}! You have ${newUnassignedPoints} attribute point${newUnassignedPoints !== 1 ? 's' : ''} to assign.`;
        if (bonusesApplied.length > 0) {
          message += ` Adventure bonuses applied: ${bonusesApplied.join(', ')}!`;
        }
        
        toast.success(message, { autoClose: 6000 });

        return {
          ...prev,
          character: {
            ...prev.character,
            xp: remainingXP,
            level: newLevel,
            unassignedPoints: newUnassignedPoints,
            attributes: updatedAttributes,
            pendingBonuses: {}, // Clear pending bonuses after applying
          },
        };
      }

      return {
        ...prev,
        character: {
          ...prev.character,
          xp: newXP,
        },
      };
    });
  };

  const getCampaignQuests = (campaignId: string): Quest[] => {
    return state.quests.filter(q => q.campaignId === campaignId);
  };

  const hasUncompletedQuests = (campaignId: string): boolean => {
    return state.quests.some(q => q.campaignId === campaignId && !q.completed);
  };

  const updateTimerState = (updates: Partial<TimerState> | ((prev: TimerState) => Partial<TimerState>)) => {
    setState(prev => {
      const newUpdates = typeof updates === 'function' ? updates(prev.timerState) : updates;
      return {
        ...prev,
        timerState: { ...prev.timerState, ...newUpdates },
      };
    });
  };

  const completeWorkSession = () => {
    const { timerState, character, guildState } = state;
    const adventure = ADVENTURES.find(a => a.id === timerState.selectedAdventure);
    
    if (!adventure) return;

    const increments = calculateIncrements(timerState.workDurationCompleted);
    const bonusMultiplier = getPresetBonusMultiplier(timerState.preset);

    // Calculate adventurer multiplier
    const adventurerMultiplier = calculateAdventurerMultiplier(guildState.adventurers);

    let goldEarned = 0;
    let renownEarned = 0;
    let manaEarned = 0;
    const newPendingBonuses: PendingBonus = { ...character.pendingBonuses };

    if (adventure.isAttributeBonus) {
      // Attribute bonus adventures only grant reward on completion
      const attributeKey = adventure.rewardType as keyof PendingBonus;
      newPendingBonuses[attributeKey] = (newPendingBonuses[attributeKey] || 0) + bonusMultiplier;
      
      toast.success(
        `🎯 Adventure complete! You earned +${bonusMultiplier} ${adventure.rewardType} bonus for your next level up!`,
        { autoClose: 4000 }
      );
    } else {
      // Incremental rewards (gold, renown, mana) with adventurer multiplier
      const baseRewardAmount = (adventure.rewardPerIncrement || 0) * increments;
      const rewardAmount = baseRewardAmount * Math.max(1, adventurerMultiplier);
      
      if (adventure.rewardType === 'gold') {
        goldEarned = rewardAmount;
      } else if (adventure.rewardType === 'renown') {
        renownEarned = rewardAmount;
      } else if (adventure.rewardType === 'mana') {
        manaEarned = rewardAmount;
      }

      const multiplierText = adventurerMultiplier > 1 ? ` (${adventurerMultiplier}x from adventurers)` : '';
      toast.success(
        `✨ Work session complete! You earned ${rewardAmount} ${adventure.rewardType}${multiplierText}!`,
        { autoClose: 4000 }
      );
    }

    // Apply building effects that trigger on work session completion
    const buildingGoldBonus = getTotalBuildingEffects(guildState.buildings, 'gold_per_adventure');
    const buildingManaBonus = getTotalBuildingEffects(guildState.buildings, 'mana_per_adventure');
    const buildingXPBonus = getTotalBuildingEffects(guildState.buildings, 'adventurer_xp_per_work');

    goldEarned += buildingGoldBonus;
    manaEarned += buildingManaBonus;

    // Distribute XP to adventurers
    const updatedAdventurers = distributeXPToAdventurers(guildState.adventurers, buildingXPBonus);

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        gold: prev.character.gold + goldEarned,
        renown: prev.character.renown + renownEarned,
        mana: prev.character.mana + manaEarned,
        pendingBonuses: newPendingBonuses,
      },
      guildState: {
        ...prev.guildState,
        adventurers: updatedAdventurers,
      },
    }));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  // Guild management functions
  const purchaseBuilding = (buildingType: string, position: GridPosition) => {
    const { character, guildState } = state;
    const cost = getBuildingCost(buildingType, 1);
    const buildingName = getBuildingTemplate(buildingType)?.name;
    
    if (character.gold < cost) {
      toast.error(`Not enough gold! Need ${cost} gold.`);
      return;
    }
    
    if (!canPlaceBuilding(position, guildState.buildings)) {
      toast.error('Cannot place building at this position!');
      return;
    }
    
    if (!guildState.unlockedBuildings.includes(buildingType)) {
      toast.error('Building not unlocked! Research it first.');
      return;
    }

    // Check if a building of this type already exists
    if (guildState.buildings.some(building => building.type === buildingType)) {
      toast.error('Only one instance of each building type can be constructed!');
      return;
    }

    const newBuilding: Building = {
      id: crypto.randomUUID(),
      type: buildingType,
      level: 1,
      position,
    };

    setState(prev => {
      const updatedBuildings = [...prev.guildState.buildings, newBuilding];
      
      // Recalculate max adventurers based on updated buildings
      const newMaxAdventurers = getTotalBuildingEffects(updatedBuildings, 'adventurer_capacity');
      
      return {
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold - cost,
        },
        guildState: {
          ...prev.guildState,
          buildings: updatedBuildings,
          maxAdventurers: newMaxAdventurers,
        },
      };
    });

    toast.success(`🏗️ Built ${buildingName}!`);
  };

  const upgradeBuilding = (buildingId: string) => {
    const { character, guildState } = state;
    const building = guildState.buildings.find(b => b.id === buildingId);
    const template = building ? getBuildingTemplate(building.type) : undefined;
    
    if (!building) return;
    
    const cost = getBuildingCost(building.type, building.level + 1);
    
    if (character.gold < cost) {
      toast.error(`Not enough gold! Need ${cost} gold.`);
      return;
    }

    setState(prev => {
      const updatedBuildings = prev.guildState.buildings.map(b => 
        b.id === buildingId ? { ...b, level: b.level + 1 } : b
      );
      
      // Recalculate max adventurers based on updated buildings
      const newMaxAdventurers = getTotalBuildingEffects(updatedBuildings, 'adventurer_capacity');
      
      return {
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold - cost,
        },
        guildState: {
          ...prev.guildState,
          buildings: updatedBuildings,
          maxAdventurers: newMaxAdventurers,
        },
      };
    });

    toast.success(`⬆️ Upgraded ${template?.name} to level ${building.level + 1}!`);
  };

  const removeBuilding = (buildingId: string) => {
    const { guildState } = state;
    const building = guildState.buildings.find(b => b.id === buildingId);
    const template = building ? getBuildingTemplate(building.type) : undefined;
    
    if (!building) return;
    
    // Prevent removing the guild hall
    if (building.type === 'guild_hall') {
      toast.error('Cannot remove the Guild Hall! It can only be moved or upgraded.');
      return;
    }
    
    const refund = calculateRefund(building.type, building.level);

    setState(prev => {
      const updatedBuildings = prev.guildState.buildings.filter(b => b.id !== buildingId);
      
      // Recalculate max adventurers based on updated buildings
      const newMaxAdventurers = getTotalBuildingEffects(updatedBuildings, 'adventurer_capacity');
      
      return {
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold + refund,
        },
        guildState: {
          ...prev.guildState,
          buildings: updatedBuildings,
          maxAdventurers: newMaxAdventurers,
        },
      };
    });

    toast.success(`💰 Removed ${template?.name} and refunded ${refund} gold!`);
  };

  const moveBuilding = (buildingId: string, newPosition: GridPosition) => {
    const { guildState } = state;
    
    if (!canPlaceBuilding(newPosition, guildState.buildings.filter(b => b.id !== buildingId))) {
      toast.error('Cannot move building to this position!');
      return;
    }

    setState(prev => ({
      ...prev,
      guildState: {
        ...prev.guildState,
        buildings: prev.guildState.buildings.map(b => 
          b.id === buildingId ? { ...b, position: newPosition } : b
        ),
      },
    }));

    toast.success('🏗️ Building moved!');
  };

  const purchaseResearch = (nodeId: string) => {
    const { character, guildState } = state;
    const node = guildState.research.find(n => n.id === nodeId);
    
    if (!node) return;
    
    if (!canPurchaseResearch(node, character, guildState)) {
      toast.error('Cannot purchase this research! Check requirements.');
      return;
    }

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        mana: prev.character.mana - node.manaCost,
      },
      guildState: {
        ...prev.guildState,
        research: prev.guildState.research.map(n => 
          n.id === nodeId ? { ...n, purchased: true } : n
        ),
        unlockedBuildings: [...prev.guildState.unlockedBuildings, ...node.unlocks],
      },
    }));

    toast.success(`🔬 Researched ${node.name}!`);
  };

  const levelUpAdventurer = () => {
    // This function is for manual leveling if needed, but adventurers auto-level from XP
    toast.info('Adventurers level up automatically from XP!');
  };

  const completeBreakSession = () => {
    const { guildState } = state;
    
    // Apply building effects that trigger on break completion
    const buildingGoldBonus = getTotalBuildingEffects(guildState.buildings, 'gold_per_break');
    const buildingManaBonus = getTotalBuildingEffects(guildState.buildings, 'mana_per_break');

    if (buildingGoldBonus > 0 || buildingManaBonus > 0) {
      setState(prev => ({
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold + buildingGoldBonus,
          mana: prev.character.mana + buildingManaBonus,
        },
      }));

      const bonusText = [];
      if (buildingGoldBonus > 0) bonusText.push(`${buildingGoldBonus} gold`);
      if (buildingManaBonus > 0) bonusText.push(`${buildingManaBonus} mana`);
      
      if (bonusText.length > 0) {
        toast.success(`🏰 Guild buildings granted: ${bonusText.join(', ')}!`, { autoClose: 3000 });
      }
    }
  };

  const hireAdventurer = () => {
    const { guildState, character } = state;
    
    if (guildState.adventurers.length >= guildState.maxAdventurers) {
      toast.error('Cannot hire more adventurers! Upgrade your Guild Hall to increase capacity.');
      return;
    }

    const hireCost = guildState.adventurers.length * 5;
    
    if (character.renown < hireCost) {
      toast.error(`Not enough renown! Need ${hireCost} renown to hire an adventurer.`);
      return;
    }

    const newAdventurer = createAdventurer();

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        renown: prev.character.renown - hireCost,
      },
      guildState: {
        ...prev.guildState,
        adventurers: [...prev.guildState.adventurers, newAdventurer],
      },
    }));

    toast.success(`✨ Hired a new adventurer for ${hireCost} renown!`);
  };

  const removeAdventurer = (adventurerId: string) => {
    const { guildState } = state;
    
    if (guildState.adventurers.length <= 1) {
      toast.error('Cannot remove your last adventurer!');
      return;
    }

    setState(prev => ({
      ...prev,
      guildState: {
        ...prev.guildState,
        adventurers: prev.guildState.adventurers.filter(adv => adv.id !== adventurerId),
      },
    }));

    toast.success('👋 Removed adventurer from your guild.');
  };

  const renameAdventurer = (adventurerId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Adventurer name cannot be empty!');
      return;
    }

    setState(prev => ({
      ...prev,
      guildState: {
        ...prev.guildState,
        adventurers: prev.guildState.adventurers.map(adv =>
          adv.id === adventurerId ? { ...adv, name: newName.trim() } : adv
        ),
      },
    }));

    toast.success(`✏️ Adventurer renamed to ${newName.trim()}!`);
  };

  const value: AppContextType = {
    ...state,
    addQuest,
    updateQuest,
    deleteQuest,
    completeQuest,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    completeCampaign,
    updateCharacter,
    assignAttributePoint,
    awardXP,
    getCampaignQuests,
    hasUncompletedQuests,
    updateTimerState,
    completeWorkSession,
    updateSettings,
    purchaseBuilding,
    upgradeBuilding,
    removeBuilding,
    moveBuilding,
    purchaseResearch,
    levelUpAdventurer,
    completeBreakSession,
    hireAdventurer,
    removeAdventurer,
    renameAdventurer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

