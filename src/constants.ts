import { Card, LocationState } from './types';

export const BOARD_WIDTH = 3; // 3 Locations
export const MAX_MANA = 6; 
export const MAX_TURNS = 6;
export const BATTLEPASS_XP_PER_LEVEL = 1000;
export const STORE_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

// LOCATIONS
export const LOCATIONS: LocationState[] = [
  { id: 'l1', name: 'Neural Core', description: '+2 Power for every unit here.', isRevealed: false, revealTurn: 1, playerUnits: [], enemyUnits: [], playerPower: 0, enemyPower: 0, effectType: 'POWER_BOOST' },
  { id: 'l2', name: 'Dark Web', description: 'Cards cannot be played here after Turn 4.', isRevealed: false, revealTurn: 2, playerUnits: [], enemyUnits: [], playerPower: 0, enemyPower: 0, effectType: 'NO_CARDS' },
  { id: 'l3', name: 'Bit Cloud', description: 'On Reveal effects happen twice.', isRevealed: false, revealTurn: 3, playerUnits: [], enemyUnits: [], playerPower: 0, enemyPower: 0, effectType: 'DOUBLE_ON_REVEAL' },
  { id: 'l4', name: 'Void Node', description: 'At the end of the game, destroy a random unit here.', isRevealed: false, revealTurn: 1, playerUnits: [], enemyUnits: [], playerPower: 0, enemyPower: 0, effectType: 'DESTROY_RANDOM' },
  { id: 'l5', name: 'Silicon Valley', description: 'Ongoing effects are doubled.', isRevealed: false, revealTurn: 2, playerUnits: [], enemyUnits: [], playerPower: 0, enemyPower: 0, effectType: 'POWER_BOOST' },
  { id: 'l6', name: 'Cyber Museum', description: 'Cards with no effects here have +3 Power.', isRevealed: false, revealTurn: 3, playerUnits: [], enemyUnits: [], playerPower: 0, enemyPower: 0, effectType: 'VANILLA_BOOST' },
];

export const getRandomLocations = (): LocationState[] => {
  const shuffled = [...LOCATIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((l, i) => ({ ...l, revealTurn: i + 1, isRevealed: false }));
};

const createCard = (id: string, type: any, name: string, cost: number, rarity: any, description: string, power: number, image: string, voiceLine: string, effect?: any): Card => ({
  id, type, name, cost, rarity, description, stats: { power }, image, voiceLine, effect
});

export const CARD_DATA: Card[] = [
  // --- LAYER 1: 1 COST ---
  createCard('c1', 'MAGE', 'Script Kiddy', 1, 'COMMON', 'On Reveal: Give a random ally +2 Power.', 2, "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400", "Script optimized.", { type: 'ON_REVEAL', target: 'SELF', value: 2 }),
  createCard('c2', 'STRIKER', 'Recruit.exe', 1, 'COMMON', 'A basic protocol with untapped potential.', 3, "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400", "Ready to serve.", { type: 'VANILLA' }),
  createCard('c3', 'SNIPER', 'Data Scout', 1, 'COMMON', 'On Reveal: Draw a card.', 1, "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400", "Scanning nodes.", { type: 'ON_REVEAL', target: 'HAND', value: 1 }),

  // --- LAYER 2: 2 COST ---
  createCard('c4', 'TANK', 'Bulk Shield', 2, 'COMMON', 'Heavy architecture, simple logic.', 5, "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400", "Hold the line.", { type: 'VANILLA' }),
  createCard('c5', 'STRIKER', 'Blade Runner', 2, 'RARE', 'On Reveal: Move this card to a random location.', 3, "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400", "Relocating.", { type: 'ON_REVEAL', target: 'SELF', description: 'RELOCATE' }),
  createCard('c6', 'TANK', 'Firewall', 2, 'RARE', 'Ongoing: Give adjacent locations +2 Power.', 1, "https://images.unsplash.com/photo-1558494949-ef010ca6806a?auto=format&fit=crop&q=80&w=400", "Network secure.", { type: 'ONGOING', target: 'ADJACENT', value: 2 }),

  // --- LAYER 3: 3 COST ---
  createCard('c7', 'MAGE', 'The Architect', 3, 'LEGENDARY', 'Ongoing: Your cards with no effects have +4 Power.', 2, "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400", "Unlocking potential.", { type: 'ONGOING', target: 'VANILLA_UNITS', value: 4 }),
  createCard('c8', 'HEALER', 'Cyber Medic', 3, 'RARE', 'On Reveal: Give your highest power card here +3 Power.', 3, "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=400", "Vitals stable.", { type: 'ON_REVEAL', target: 'SELF', value: 3 }),
  createCard('c9', 'STRIKER', 'The Sentinel', 3, 'EPIC', 'Ongoing: If you have 4 cards here, this has +3 Power.', 5, "https://images.unsplash.com/photo-1518066000774-a8ae2b3d8f2b?auto=format&fit=crop&q=80&w=400", "Defense matrix active.", { type: 'ONGOING', target: 'SELF', value: 3 }),

  // --- LAYER 4: 4 COST ---
  createCard('c10', 'SNIPER', 'Quantum Reaper', 4, 'EPIC', 'On Reveal: Afflict a random enemy here with -2 Power.', 4, "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=400", "Subject deleted.", { type: 'ON_REVEAL', target: 'ENEMY', value: 2 }),
  createCard('c11', 'MAGE', 'Ghost in the Machine', 4, 'RARE', 'At the end of each turn, steal 1 Power from a random enemy card here.', 2, "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400", "Ghosting.", { type: 'END_TURN', target: 'ENEMY', value: 1 }),

  // --- LAYER 5: 5+ COST ---
  createCard('c12', 'HORDE', 'Z-Day Virus', 5, 'MYTHIC', 'End Game: Double this units power.', 8, "https://images.unsplash.com/photo-1496247749665-49cf94b99e65?auto=format&fit=crop&q=80&w=400", "The end is here.", { type: 'END_GAME', target: 'SELF' }),
  createCard('c13', 'TANK', 'Void Colossus', 6, 'LEGENDARY', 'This card cannot be destroyed or moved.', 12, "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400", "Immovable.", { type: 'ONGOING', target: 'SELF' }),
];

export const AVATARS = [
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=100",
];

export const BORDER_DATA = [
  { id: 'b1', name: 'Standard Grey', rarity: 'COMMON', style: 'border-[#444] shadow-none' },
  { id: 'b2', name: 'Electric Blue', rarity: 'RARE', style: 'border-blue-500 shadow-[0_0_10px_#3b82f6]' },
  { id: 'b3', name: 'Neon Purple', rarity: 'EPIC', style: 'border-purple-500 shadow-[0_0_15px_#a855f7]' },
  { id: 'b4', name: 'Golden Pulse', rarity: 'LEGENDARY', style: 'border-yellow-400 shadow-[0_0_20px_#facc15]' },
  { id: 'b5', name: 'Nexus Rift', rarity: 'MYTHIC', style: 'border-cyan-400 shadow-[0_0_25px_#22d3ee] animate-pulse' },
];

export const BACKGROUND_DATA = [
  { id: 'bg1', name: 'Cyber Grid', style: 'bg-neutral-900' },
  { id: 'bg2', name: 'Neon Alley', style: 'bg-indigo-950' },
  { id: 'bg3', name: 'Data Stream', style: 'bg-cyan-950' },
];

export const SKIN_DATA = [
  { id: 's1', cardId: 'c1', name: 'Default', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400' },
  { id: 's2', cardId: 'c1', name: 'Hacker Elite', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400' },
];

export const DEFAULT_ICONS = {
  CREDITS: 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png',
  GOLD: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png',
  MATERIALS: 'https://cdn-icons-png.flaticon.com/512/1067/1067555.png',
};

export const BATTLEPASS_REWARDS = [
  { level: 1, type: 'CREDITS', amount: 500 },
  { level: 2, type: 'MATERIALS', amount: 50 },
  { level: 5, type: 'CARD', id: 'c7' },
  { level: 10, type: 'GOLD', amount: 500 },
  { level: 50, type: 'INFINITY_BOX' }
];
