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

interface AppState {
  quests: Quest[];
  campaigns: Campaign[];
  character: Character;
  timerState: TimerState;
  settings: Settings;
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
    const { timerState, character } = state;
    const adventure = ADVENTURES.find(a => a.id === timerState.selectedAdventure);
    
    if (!adventure) return;

    const increments = calculateIncrements(timerState.workDurationCompleted);
    const bonusMultiplier = getPresetBonusMultiplier(timerState.preset);

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
      // Incremental rewards (gold, renown, mana)
      const rewardAmount = (adventure.rewardPerIncrement || 0) * increments;
      
      if (adventure.rewardType === 'gold') {
        goldEarned = rewardAmount;
      } else if (adventure.rewardType === 'renown') {
        renownEarned = rewardAmount;
      } else if (adventure.rewardType === 'mana') {
        manaEarned = rewardAmount;
      }

      toast.success(
        `✨ Work session complete! You earned ${rewardAmount} ${adventure.rewardType}!`,
        { autoClose: 4000 }
      );
    }

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        gold: prev.character.gold + goldEarned,
        renown: prev.character.renown + renownEarned,
        mana: prev.character.mana + manaEarned,
        pendingBonuses: newPendingBonuses,
      },
    }));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
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

