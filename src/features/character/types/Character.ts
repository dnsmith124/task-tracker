export interface Attributes {
  STR: number;
  AGL: number;
  MND: number;
  VIG: number;
}

export interface PendingBonus {
  STR?: number;
  AGL?: number;
  MND?: number;
  VIG?: number;
}

export interface Character {
  name: string;
  xp: number;
  level: number;
  attributes: Attributes;
  unassignedPoints: number;
  gold: number;
  renown: number;
  mana: number;
  pendingBonuses: PendingBonus;
}

