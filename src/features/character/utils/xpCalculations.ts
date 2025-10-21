export interface LevelUpResult {
  newLevel: number;
  remainingXP: number;
  pointsGained: number;
}

/**
 * Calculate XP required for the next level
 * Formula: 100 × (current level / 2)
 */
export const getXPForNextLevel = (currentLevel: number): number => {
  return Math.floor(100 * (currentLevel / 2));
};

/**
 * Calculate total XP required to reach a specific level from level 1
 */
export const getTotalXPForLevel = (targetLevel: number): number => {
  let totalXP = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXP += getXPForNextLevel(level);
  }
  return totalXP;
};

/**
 * Calculate if character should level up and return new level details
 */
export const calculateLevelUp = (currentXP: number, currentLevel: number): LevelUpResult | null => {
  let level = currentLevel;
  let xp = currentXP;
  let levelsGained = 0;

  while (true) {
    const xpNeeded = getXPForNextLevel(level);
    if (xp >= xpNeeded) {
      xp -= xpNeeded;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  if (levelsGained > 0) {
    return {
      newLevel: level,
      remainingXP: xp,
      pointsGained: levelsGained * 2, // 2 attribute points per level
    };
  }

  return null;
};

/**
 * Calculate XP progress as a percentage for the current level
 */
export const getXPProgress = (currentXP: number, currentLevel: number): number => {
  const xpNeeded = getXPForNextLevel(currentLevel);
  return xpNeeded > 0 ? Math.min((currentXP / xpNeeded) * 100, 100) : 0;
};

