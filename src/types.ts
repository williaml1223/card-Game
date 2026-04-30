export type Archetype = 'TANK' | 'SNIPER' | 'HEALER' | 'HORDE' | 'MAGE' | 'STRIKER';

export interface Unit {
  id: string;
  type: Archetype;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  nexusDamage: number;
  range: number;
  movement: number;
  team: 'PLAYER' | 'ENEMY';
  x: number;
  y: number;
  cost: number;
  description: string;
  image?: string;
  borderId?: string;
  backgroundId?: string;
  ability?: Card['ability'];
  effects?: { type: 'HEAL' | 'DAMAGE' | 'BUFF', value: number, id: string }[];
  lastHit?: number;
  isAttacking?: { x: number, y: number } | null;
}

export interface Card {
  id: string;
  type: Archetype;
  name: string;
  cost: number;
  description: string;
  stats: Partial<Unit>;
  image?: string;
  voiceLine?: string;
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  ability?: {
    name: string;
    description: string;
    type: 'PASSIVE' | 'ON_ATTACK' | 'ON_SPAWN' | 'ON_DEATH';
    effectValue: number;
  };
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
}

export interface CardSkin {
  id: string;
  name: string;
  image: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  leaderId: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardType: 'GOLD' | 'XP' | 'MATERIALS' | 'CREDITS';
  rewardAmount: number;
  completed: boolean;
  type: 'DAILY' | 'GUILD';
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
  board: (Unit | null)[][];
  playerHp: number;
  enemyHp: number;
  playerMana: number;
  enemyMana: number;
  turn: 'PLAYER' | 'ENEMY';
  selectedCell: { x: number; y: number } | null;
  hand: Card[];
  log: string[];
}
