import { Adventurer, Building } from '../types/Guild';

const FIRST_NAMES = [
  'Aria', 'Bjorn', 'Cedric', 'Diana', 'Erik', 'Fiona', 'Gareth', 'Helena',
  'Ivar', 'Jade', 'Kael', 'Luna', 'Marcus', 'Nyx', 'Orin', 'Petra',
  'Quinn', 'Raven', 'Soren', 'Thalia', 'Ulric', 'Vera', 'Wren', 'Xander',
  'Yara', 'Zephyr', 'Ash', 'Brynn', 'Cato', 'Dara', 'Eamon', 'Freya',
  'Alaric', 'Isolde', 'Thorin', 'Elara', 'Draven', 'Lyria', 'Ragnar', 'Seraphina',
  'Aldric', 'Mira', 'Kaelen', 'Astrid', 'Theron', 'Selene', 'Rowan', 'Elise',
  'Valen', 'Nimue', 'Torsten', 'Cassia', 'Fenris', 'Liora', 'Baldric', 'Rhiannon',
  'Dorian', 'Kalista', 'Magnus', 'Aurelia', 'Silas', 'Tessa', 'Varian', 'Serina',
  'Lucian', 'Zahra', 'Eirik', 'Cordelia', 'Bastian', 'Vesper', 'Leif', 'Morgana',
  'Caius', 'Elara', 'Finn', 'Rowena', 'Jasper', 'Nerissa', 'Thaddeus', 'Isadora',
  'Corwin', 'Sable', 'Alarion', 'Evangeline', 'Brennan', 'Celestia', 'Drake', 'Vivienne',
  'Aldwyn', 'Amara', 'Sigurd', 'Ophelia', 'Halvar', 'Zara', 'Tobias', 'Arianne',
  'Griffin', 'Lorelei', 'Osric', 'Sabine', 'Kieran', 'Elspeth', 'Roland', 'Sylvia',
  'Broderick', 'Maelis', 'Valtor', 'Lunette', 'Tiberius', 'Fiora', 'Callum', 'Seraphine'
];

const LAST_NAMES = [
  'Ironheart', 'Stormborn', 'Shadowblade', 'Brightshield', 'Swiftarrow',
  'Stonefist', 'Moonwhisper', 'Flameheart', 'Frostbeard', 'Windwalker',
  'Earthshaker', 'Stargazer', 'Nightblade', 'Sunseeker', 'Thornwood',
  'Silverhand', 'Goldenhair', 'Blackthorn', 'Redcloak', 'Bluemoon',
  'Greywolf', 'Whitefang', 'Darkwater', 'Lightbringer', 'Skyrunner',
  'Dragonsbane', 'Ravenwood', 'Emberforge', 'Crystalbrook', 'Steelwing',
  'Dawnbringer', 'Ashenvale', 'Wyrmwood', 'Frostfire', 'Thunderstrike',
  'Moonstone', 'Suncaller', 'Shadowmere', 'Wildrose', 'Ironwood',
  'Stormheart', 'Darkblade', 'Brightmoon', 'Swiftshadow', 'Goldforge',
  'Ravencrest', 'Nightwhisper', 'Dawnstar', 'Stonebreaker', 'Flamecrest',
  'Winterborn', 'Oakheart', 'Bloodmoon', 'Starweaver', 'Thornblade',
  'Silverthorn', 'Firewalker', 'Iceheart', 'Mistborn', 'Forestkeeper',
  'Ironvale', 'Stormweaver', 'Shadowfell', 'Brightblade', 'Moonveil',
  'Wolfsbane', 'Wintermoon', 'Stoneheart', 'Swiftblade', 'Darkrose',
  'Sunforge', 'Ravenfall', 'Thornheart', 'Frostmoon', 'Goldcrest',
  'Emberwind', 'Silverbrook', 'Nightstorm', 'Dawnforge', 'Ashenblade',
  'Stormridge', 'Ironcloak', 'Moonfire', 'Wildheart', 'Crystalwind',
  'Shadowstorm', 'Brightforge', 'Ravenshield', 'Flamebringer', 'Frostcrest',
  'Starfall', 'Thornshield', 'Goldheart', 'Stoneward', 'Swiftstrike'
];

export const generateAdventurerName = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

export const calculateAdventurerMultiplier = (adventurers: Adventurer[]): number => {
  return adventurers.reduce((total, adventurer) => total + adventurer.level, 0);
};

export const getAdventurerXPForLevel = (level: number): number => {
  // Similar curve to character XP: level * 100
  return (level * 2) * 25;
};

export const distributeXPToAdventurers = (adventurers: Adventurer[], totalXP: number): Adventurer[] => {
  if (adventurers.length === 0) return adventurers;
  
  const xpPerAdventurer = Math.floor(totalXP / adventurers.length);
  const remainder = totalXP % adventurers.length;
  
  return adventurers.map((adventurer, index) => {
    const xpToAdd = xpPerAdventurer + (index < remainder ? 1 : 0);
    const newXP = adventurer.xp + xpToAdd;
    const xpForNextLevel = getAdventurerXPForLevel(adventurer.level);
    
    if (newXP >= xpForNextLevel) {
      // Level up
      return {
        ...adventurer,
        level: adventurer.level + 1,
        xp: newXP - xpForNextLevel
      };
    } else {
      // Just add XP
      return {
        ...adventurer,
        xp: newXP
      };
    }
  });
};

export const getAdventurerXPProgress = (adventurer: Adventurer): number => {
  const currentLevelXP = getAdventurerXPForLevel(adventurer.level);
  const nextLevelXP = getAdventurerXPForLevel(adventurer.level + 1);
  const xpInCurrentLevel = adventurer.xp;
  
  return (xpInCurrentLevel / (nextLevelXP - currentLevelXP)) * 100;
};

export const getAdventurerCapacity = (buildings: any[]): number => {
  // This will be called from building utils to get total capacity
  const { getTotalBuildingEffects } = require('./buildingUtils');
  return getTotalBuildingEffects(buildings, 'adventurer_capacity');
};

export const createAdventurer = (): Adventurer => {
  return {
    id: crypto.randomUUID(),
    name: generateAdventurerName(),
    level: 1,
    xp: 0
  };
};

export const createInitialAdventurers = (count: number): Adventurer[] => {
  return Array.from({ length: count }, createAdventurer);
};

export const getMaxAdventurers = (guildHall: Building): number => {
  return guildHall.level * 5;
};