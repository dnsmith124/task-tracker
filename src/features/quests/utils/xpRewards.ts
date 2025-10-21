export const XP_REWARDS = {
  SIDE_QUEST: 10,
  MAIN_QUEST: 25,
  CAMPAIGN: 100,
} as const;

export const getQuestXP = (questType: 'main' | 'side'): number => {
  return questType === 'main' ? XP_REWARDS.MAIN_QUEST : XP_REWARDS.SIDE_QUEST;
};

export const getCampaignXP = (): number => {
  return XP_REWARDS.CAMPAIGN;
};

