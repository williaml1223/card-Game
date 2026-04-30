export type Archetype = 'TANK' | 'SNIPER' | 'HEALER' | 'HORDE' | 'MAGE' | 'STRIKER';
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
export type EffectType = 'ON_REVEAL' | 'ONGOING' | 'END_TURN' | 'START_GAME' | 'END_GAME' | 'VANILLA' | 'HAND';

export interface CardEffect {
  type: EffectType;
  description: string;
  value?: number;
  target?: 'SELF' | 'LOCATION' | 'ALL_LOCATIONS' | 'HAND' | 'ENEMY' | 'VANILLA_UNITS';
}

export interface Unit {
  id: string;
  cardId: string;
  name: string;
  type: Archetype;
  power: number;
  cost: number;
  image: string;
  team: 'PLAYER' | 'ENEMY';
  effect?: CardEffect;
  locationIndex: number;
  isRevealed: boolean;
  basePower: number;
}

export interface Card {
  id: string;
  type: Archetype;
  name: string;
  cost: number;
  rarity: Rarity;
  description: string;
  stats: {
    power: number;
  };
  image: string;
  voiceLine: string;
  effect?: CardEffect;
}

export interface LocationState {
  id: string;
  name: string;
  description: string;
  isRevealed: boolean;
  revealTurn: number;
  playerUnits: Unit[];
  enemyUnits: Unit[];
  playerPower: number;
  enemyPower: number;
  effectType?: 'POWER_BOOST' | 'NO_CARDS' | 'DRAW_CARD' | 'DESTROY_RANDOM' | 'DOUBLE_ON_REVEAL';
}

export interface Deck {
  id: string;
  name: string;
  cardIds: string[];
  ownerId: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  friendId: string;
  credits: number;
  gold: number;
  materials: number;
  arenaScrolls: number;
  level: number;
  xp: number;
  rank: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER' | 'ASCENCION';
  points: number;
  winStreak?: number;
  maxWinStreak?: number;
  elo: number;
  isGuest?: boolean;
  isAdmin?: boolean;
  guildId?: string | null;
  battlePassLevel: number;
  battlePassXp: number;
  claimedRewards: number[]; // Array of level indices
  avatarUrl?: string;
  ownedIcons: string[];
  storeIcons: { id: string; image: string; cost: number; expiresAt: number }[];
  activeDeckId?: string | null;
}

export interface OwnedCardData {
  id?: string;
  cardId: string;
  level: number;
  xp: number;
  ownerId: string;
  activeSkinId?: string | null;
  unlockedSkins: string[];
  borderId?: string;
  backgroundId?: string;
}

export interface GameState {
  locations: LocationState[];
  playerMana: number;
  enemyMana: number;
  currentTurn: number;
  maxTurns: number;
  playerHand: Card[];
  enemyHandSize: number;
  turnPhase: 'PLAYER' | 'ENEMY' | 'REVEAL';
  isGameOver: boolean;
  winner: 'PLAYER' | 'ENEMY' | 'TIE' | null;
}
