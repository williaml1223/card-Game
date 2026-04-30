import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Target, 
  Heart, 
  Users, 
  Zap, 
  Sword, 
  Activity, 
  ArrowRight,
  RefreshCw,
  Trophy,
  Skull,
  ChevronUp,
  Cpu,
  ShoppingBag,
  Package,
  Home,
  User as UserIcon,
  LogOut,
  Sparkles,
  Coins,
  Hammer,
  CircleDollarSign,
  Plus,
  Dna,
  LogIn,
  X
} from 'lucide-react';
import { Archetype, Unit, Card, UserProfile, OwnedCardData, Guild, Mission, CardSkin } from './types';
import { auth, db, signInWithGoogle, signInGuest } from './firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { CARD_DATA, SKIN_DATA, BOARD_WIDTH, BOARD_HEIGHT, MAX_MANA, STORE_REFRESH_INTERVAL, BORDER_DATA, BACKGROUND_DATA, DEFAULT_ICONS } from './constants';

type ViewMode = 'LOGIN' | 'MENU' | 'BATTLE' | 'GACHA' | 'STORE' | 'COLLECTION' | 'ARENA' | 'GUILDS' | 'MISSIONS' | 'BATTLEPASS';

const BATTLEPASS_LEVELS = 50;
const BATTLEPASS_XP_PER_LEVEL = 1000;

interface BPReward {
  level: number;
  type: 'CREDITS' | 'GOLD' | 'MATERIALS' | 'SKIN' | 'CARD' | 'SKIN_PACK' | 'BOX';
  amount?: number;
  id?: string;
  label: string;
}

const BATTLEPASS_REWARDS: BPReward[] = [
  { level: 1, type: 'CREDITS', amount: 500, label: '500 Credits' },
  { level: 2, type: 'GOLD', amount: 500, label: '500 Gold' },
  { level: 3, type: 'MATERIALS', amount: 10, label: '10 Alloys' },
  { level: 4, type: 'CREDITS', amount: 200, label: '200 Credits' },
  { level: 5, type: 'GOLD', amount: 2000, label: '2000 Gold' },
  { level: 6, type: 'MATERIALS', amount: 15, label: '15 Alloys' },
  { level: 7, type: 'GOLD', amount: 750, label: '750 Gold' },
  { level: 8, type: 'CREDITS', amount: 250, label: '250 Credits' },
  { level: 9, type: 'MATERIALS', amount: 20, label: '20 Alloys' },
  { level: 10, type: 'CARD', id: 'x1', label: 'Mythic: Nexus God' },
  { level: 11, type: 'SKIN', id: 's_nexus_1', label: 'Skin: Divine Overseer' },
  { level: 12, type: 'GOLD', amount: 1000, label: '1000 Gold' },
  { level: 13, type: 'MATERIALS', amount: 25, label: '25 Alloys' },
  { level: 14, type: 'CREDITS', amount: 300, label: '300 Credits' },
  { level: 15, type: 'GOLD', amount: 1200, label: '1200 Gold' },
  { level: 16, type: 'MATERIALS', amount: 30, label: '30 Alloys' },
  { level: 17, type: 'CREDITS', amount: 350, label: '350 Credits' },
  { level: 18, type: 'GOLD', amount: 1400, label: '1400 Gold' },
  { level: 19, type: 'MATERIALS', amount: 35, label: '35 Alloys' },
  { level: 20, type: 'SKIN_PACK', amount: 1, label: 'Random Skin Pack' },
  { level: 21, type: 'CREDITS', amount: 400, label: '400 Credits' },
  { level: 22, type: 'GOLD', amount: 1500, label: '1500 Gold' },
  { level: 23, type: 'MATERIALS', amount: 40, label: '40 Alloys' },
  { level: 24, type: 'CREDITS', amount: 450, label: '450 Credits' },
  { level: 25, type: 'MATERIALS', amount: 50, label: '50 Alloys' },
  { level: 26, type: 'GOLD', amount: 1600, label: '1600 Gold' },
  { level: 27, type: 'CREDITS', amount: 500, label: '500 Credits' },
  { level: 28, type: 'MATERIALS', amount: 45, label: '45 Alloys' },
  { level: 29, type: 'GOLD', amount: 1700, label: '1700 Gold' },
  { level: 30, type: 'SKIN_PACK', amount: 1, label: 'Alpha Spec Pack' },
  { level: 31, type: 'CREDITS', amount: 550, label: '550 Credits' },
  { level: 32, type: 'GOLD', amount: 1800, label: '1800 Gold' },
  { level: 33, type: 'MATERIALS', amount: 50, label: '50 Alloys' },
  { level: 34, type: 'CREDITS', amount: 600, label: '600 Credits' },
  { level: 35, type: 'GOLD', amount: 1900, label: '1900 Gold' },
  { level: 36, type: 'MATERIALS', amount: 55, label: '55 Alloys' },
  { level: 37, type: 'CREDITS', amount: 650, label: '650 Credits' },
  { level: 38, type: 'GOLD', amount: 2000, label: '2000 Gold' },
  { level: 39, type: 'MATERIALS', amount: 60, label: '60 Alloys' },
  { level: 40, type: 'SKIN_PACK', amount: 1, label: 'Elite Skin Pack' },
  { level: 41, type: 'CREDITS', amount: 700, label: '700 Credits' },
  { level: 42, type: 'GOLD', amount: 2200, label: '2200 Gold' },
  { level: 43, type: 'MATERIALS', amount: 65, label: '65 Alloys' },
  { level: 44, type: 'CREDITS', amount: 750, label: '750 Credits' },
  { level: 45, type: 'SKIN_PACK', amount: 1, label: 'Omega Spec Pack' },
  { level: 46, type: 'GOLD', amount: 2500, label: '2500 Gold' },
  { level: 47, type: 'MATERIALS', amount: 70, label: '70 Alloys' },
  { level: 48, type: 'CREDITS', amount: 800, label: '800 Credits' },
  { level: 49, type: 'GOLD', amount: 3000, label: '3000 Gold' },
  { level: 50, type: 'BOX', amount: 1, label: 'Infinity Box' },
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AestheticCustomizationModal = ({ ownedCard, onUpdate, onClose }: { ownedCard: OwnedCardData, onUpdate: (data: Partial<OwnedCardData>) => void, onClose: () => void }) => {
  const card = CARD_DATA.find(c => c.id === ownedCard.cardId);
  if (!card) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-card max-w-4xl w-full rounded-[3rem] overflow-hidden border-white/10 flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full md:w-2/5 p-8 border-r border-white/5 bg-black/40 flex flex-col items-center justify-center gap-6">
           <div className={`relative w-64 aspect-[3/4] rounded-3xl overflow-hidden border-4 ${BORDER_DATA.find(b => b.id === ownedCard.borderId)?.style || 'border-white/10'} ${BACKGROUND_DATA.find(bg => bg.id === ownedCard.backgroundId)?.style || 'bg-neutral-900'} transition-all`}>
              <img src={SKIN_DATA.find(s => s.id === ownedCard.activeSkinId)?.image || card.image} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent">
                 <div className="text-xl font-display font-black italic italic">{card.name}</div>
              </div>
           </div>
           <p className="text-[10px] font-black uppercase text-nexus-blue tracking-tighter">Real-time Preview</p>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-3xl font-display font-black tracking-tight italic italic underline decoration-nexus-blue underline-offset-8">AESTHETIC UPGRADE</h2>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2 italic italic">Unit Skins</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               <button 
                onClick={() => onUpdate({ activeSkinId: null })}
                className={`p-3 rounded-2xl border transition-all text-left ${!ownedCard.activeSkinId ? 'border-nexus-blue bg-nexus-blue/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
              >
                <div className="text-xs font-black uppercase tracking-widest">Base Skin</div>
              </button>
              {SKIN_DATA.filter(s => s.id.includes(card.id.substring(0, 2))).map(skin => (
                <button 
                  key={skin.id}
                  onClick={() => onUpdate({ activeSkinId: skin.id })}
                  className={`p-3 rounded-2xl border transition-all text-left ${ownedCard.activeSkinId === skin.id ? 'border-nexus-blue bg-nexus-blue/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="text-xs font-black uppercase tracking-widest">{skin.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 uppercase">{skin.rarity}</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2 italic italic">Neural Borders</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {BORDER_DATA.map(border => (
                <button 
                  key={border.id}
                  onClick={() => onUpdate({ borderId: border.id })}
                  className={`p-3 rounded-2xl border transition-all text-left ${ownedCard.borderId === border.id ? 'border-nexus-blue bg-nexus-blue/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="text-xs font-black uppercase tracking-widest">{border.name}</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2 italic italic">Combat Backgrounds</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {BACKGROUND_DATA.map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => onUpdate({ backgroundId: bg.id })}
                  className={`p-3 rounded-2xl border transition-all text-left ${ownedCard.backgroundId === bg.id ? 'border-nexus-blue bg-nexus-blue/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="text-xs font-black uppercase tracking-widest">{bg.name}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AvatarSelectionModal = ({ ownedIcons, ownedCards, onSelect, onClose }: { ownedIcons: string[], ownedCards: OwnedCardData[], onSelect: (url: string) => void, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-card max-w-2xl w-full rounded-[2rem] overflow-hidden border-white/10 flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-black tracking-tight italic italic">UPLINK IDENTITY</h2>
            <p className="text-xs text-nexus-blue font-bold tracking-widest uppercase mt-1">Select your neural representation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2">Neural Symbols (Icons)</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {ownedIcons.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => { onSelect(url); onClose(); }}
                  className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 hover:border-nexus-blue transition-all group relative"
                >
                  <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-nexus-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 px-2">Unit Signatures (Cards)</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {ownedCards.map((oc, i) => {
                const card = CARD_DATA.find(c => c.id === oc.cardId);
                if (!card) return null;
                return (
                  <button 
                    key={i} 
                    onClick={() => { if(card.image) { onSelect(card.image); onClose(); } }}
                    className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 hover:border-nexus-blue transition-all group relative"
                  >
                    <img src={card.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-nexus-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CardDetailModal = ({ card, onClose, onPlay }: { card: Card, onClose: () => void, onPlay?: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-all"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, rotateY: -30, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        exit={{ scale: 0.8, rotateY: 30, opacity: 0 }}
        className="relative max-w-4xl w-full bg-neutral-900 rounded-[1.5rem] overflow-hidden border-[6px] border-black shadow-[15px_15px_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Halftone Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[length:4px_4px]" />
        
        <div className="w-full md:w-1/2 h-80 md:h-auto relative border-b-4 md:border-b-0 md:border-r-4 border-black">
          <img src={card.image} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-6 left-6 -rotate-6">
            <div className={`px-4 py-2 bg-yellow-400 text-black font-black uppercase text-[12px] border-2 border-black shadow-[4px_4px_0_#000] tracking-widest`}>
               {card.rarity} {card.type}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
             <div className="p-4 bg-white text-black border-4 border-black shadow-[8px_8px_0_#000] -rotate-1">
                <div className="text-[10px] font-black uppercase tracking-tighter opacity-50 mb-1">Transmission Log</div>
                <div className="text-sm font-black italic tracking-tight leading-tight">"{card.voiceLine}"</div>
             </div>
          </div>
        </div>
        
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between gap-10 bg-neutral-800 relative">
          <div className="absolute top-0 right-0 p-8">
             <div className="w-16 h-16 rounded-full bg-nexus-blue border-4 border-black shadow-[6px_6px_0_#000] flex flex-col items-center justify-center text-black">
                <Zap size={20} className="fill-current" />
                <span className="text-lg font-black leading-none">{card.cost}</span>
             </div>
          </div>

          <div>
            <h2 className="text-6xl font-black tracking-tighter uppercase mb-6 italic text-white drop-shadow-[4px_4px_0_theme(colors.black)]">
              {card.name}
            </h2>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-medium">
              {card.description}
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Integrity', val: card.stats.hp, icon: Activity, color: 'text-green-400' },
                { label: 'Output', val: card.stats.damage, icon: Sword, color: 'text-rose-400' },
                { label: 'Radius', val: card.stats.range, icon: Target, color: 'text-blue-400' },
                { label: 'Velocity', val: card.stats.movement, icon: ArrowRight, color: 'text-amber-400' }
              ].map(stat => (
                <div key={stat.label} className="group flex items-center gap-4 p-4 bg-black/40 border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform">
                  <stat.icon className={`${stat.color} shrink-0`} size={24} />
                  <div>
                    <div className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</div>
                    <div className="text-2xl font-black text-white">{stat.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <button 
              onClick={onClose}
              className="px-8 py-5 border-4 border-black bg-neutral-700 text-white font-black uppercase text-[12px] tracking-[0.2em] shadow-[6px_6px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Abort
            </button>
            {onPlay && (
               <button 
                onClick={() => { onPlay(); onClose(); }}
                className="flex-1 py-5 border-4 border-black bg-nexus-blue text-black font-black uppercase text-[12px] tracking-[0.3em] shadow-[8px_8px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Execute Deployment
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const playPlacementSound = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

const speakLine = (line: string, type: Archetype) => {
  const utterance = new SpeechSynthesisUtterance(line);
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find a fitting voice based on archetype
  switch(type) {
    case 'TANK': 
      utterance.pitch = 0.5; 
      utterance.rate = 0.7; 
      break;
    case 'SNIPER': 
      utterance.pitch = 0.7; 
      utterance.rate = 0.9; 
      break;
    case 'HEALER': 
      utterance.pitch = 1.2; 
      utterance.rate = 0.8; 
      break;
    case 'HORDE': 
      utterance.pitch = 1.5; 
      utterance.rate = 1.4; 
      break;
    case 'MAGE': 
      utterance.pitch = 0.9; 
      utterance.rate = 0.8; 
      break;
  }
  
  window.speechSynthesis.speak(utterance);
};

const MenuCard = ({ icon, title, desc, onClick, color }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'border-nexus-blue/30 text-nexus-blue bg-nexus-blue/10 hover:shadow-[0_0_20px_rgba(0,210,255,0.2)]',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    cyan: 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group flex flex-col p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 ${colorMap[color] || colorMap.blue} text-left`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="p-4 bg-black/40 rounded-2xl w-fit mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
           {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <h3 className="text-2xl font-black tracking-tight text-white mb-2 uppercase italic">{title}</h3>
        <p className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-[0.3em] font-mono leading-relaxed">{desc}</p>
      </div>
    </motion.button>
  );
};

const getArchetypeIcon = (type: Archetype) => {
  switch (type) {
    case 'TANK': return <Shield size={16} />;
    case 'SNIPER': return <Target size={16} />;
    case 'HEALER': return <Heart size={16} />;
    case 'HORDE': return <Users size={16} />;
    case 'MAGE': return <Zap size={16} />;
    case 'STRIKER': return <Sword size={16} />;
  }
};

const RarityGlow = {
  COMMON: 'shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] border-white/10',
  RARE: 'shadow-[0_0_20px_rgba(59,130,246,0.2),inset_0_0_10px_rgba(59,130,246,0.1)] border-blue-500/40',
  EPIC: 'shadow-[0_0_25px_rgba(168,85,247,0.3),inset_0_0_12px_rgba(168,85,247,0.2)] border-purple-500/40',
  LEGENDARY: 'shadow-[0_0_35px_rgba(234,179,8,0.4),inset_0_0_15px_rgba(234,179,8,0.3)] border-amber-400 ring-2 ring-amber-400/20',
  MYTHIC: 'shadow-[0_0_50px_rgba(244,63,94,0.6),inset_0_0_20px_rgba(244,63,94,0.4)] border-rose-500 ring-4 ring-rose-500/30 animate-pulse',
};

const playRaritySound = (rarity: Card['rarity']) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (rarity === 'MYTHIC') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    } else if (rarity === 'LEGENDARY') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    }
  } catch (e) {
    console.warn("Audio Context failed", e);
  }
};

const MissionArea = ({ missions, onComplete, onBack }: { missions: Mission[], onComplete: (id: string) => void, onBack: () => void }) => {
  return (
    <div className="flex-1 flex flex-col items-center p-6 gap-12 overflow-y-auto custom-scrollbar pb-24 relative">
       <div className="absolute top-8 left-8">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <Home size={20} />
          </button>
       </div>
      <div className="text-center">
         <h2 className="text-5xl font-serif italic mb-2 tracking-tighter">Command Directives</h2>
         <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Execute protocols to secure resources</p>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {missions.map((m) => (
          <div key={m.id} className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${m.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-6">
              <div className={`p-3 rounded-2xl ${m.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {m.type === 'DAILY' ? <Zap size={24} /> : <Users size={24} />}
              </div>
              <div>
                <div className="text-md font-bold">{m.title}</div>
                <div className="text-[10px] text-neutral-500 uppercase font-black">{m.description}</div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                <span>+{m.rewardAmount}</span>
                <span className="text-[8px] uppercase">{m.rewardType}</span>
              </div>
              <button 
                onClick={() => !m.completed && onComplete(m.id)}
                disabled={m.completed}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${m.completed ? 'bg-green-500/20 text-green-500' : 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-lg'}`}
              >
                {m.completed ? 'Sync Success' : 'Execute'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GuildArea = ({ guilds, profile, onJoin, onCreate, onBack }: { guilds: Guild[], profile: UserProfile, onJoin: (id: string) => void, onCreate: (name: string) => void, onBack: () => void }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const myGuild = guilds.find(g => g.id === profile.guildId);

  return (
    <div className="flex-1 flex flex-col items-center p-6 gap-12 overflow-y-auto custom-scrollbar pb-24 relative">
      <div className="absolute top-8 left-8">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
          <Home size={20} />
        </button>
      </div>
      <div className="text-center">
         <h2 className="text-5xl font-serif italic mb-2 tracking-tighter">Tactical Guilds</h2>
         <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Collective intelligence networks</p>
      </div>

      {myGuild ? (
        <div className="w-full max-w-4xl glass-card p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="text-6xl font-black italic tracking-tighter text-blue-400 mb-2">{myGuild.name}</div>
              <p className="text-[10px] text-neutral-500 uppercase font-black tracking-[0.4em] mb-8">Guild ID: {myGuild.id}</p>
              <p className="text-zinc-400 text-sm max-w-md">{myGuild.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                <div className="text-2xl font-black">{myGuild.memberCount}</div>
                <div className="text-[8px] font-black uppercase text-neutral-500">Nodes Active</div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                <div className="text-2xl font-black">1.2K</div>
                <div className="text-[8px] font-black uppercase text-neutral-500">Sync Level</div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/20">
             <div className="flex items-center gap-2 mb-6">
               <Users size={16} className="text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Guild Directives</span>
             </div>
             <div className="space-y-4 opacity-50">
                <div className="text-xs italic underline">Guild missions coming soon...</div>
             </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <h3 className="text-xl font-black uppercase tracking-widest">Active Networks</h3>
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
            >
              Initialize New Guild
            </button>
          </div>

          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 flex gap-4">
              <input 
                type="text" 
                placeholder="NETWORK NAME" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase focus:border-blue-500 outline-none text-white"
              />
              <button 
                onClick={() => { onCreate(newName); setShowCreate(false); }}
                className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-lg"
              >
                Establish
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guilds.map((g) => (
              <div key={g.id} className="glass-card p-8 rounded-[3rem] border-white/5 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                <div>
                  <div className="text-2xl font-black italic tracking-tighter mb-1 select-none">{g.name}</div>
                  <div className="text-[8px] font-black uppercase text-neutral-500 tracking-[0.3em]">{g.memberCount}/20 PILOTS</div>
                </div>
                <button 
                  onClick={() => onJoin(g.id)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  Sync Link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Update GachaArea to include results animation
const GachaArea = ({ credits, arenaScrolls, onOpen, onDetail, onBack }: { credits: number, arenaScrolls: number, onOpen: (count: number, isScroll?: boolean) => Promise<Card[] | undefined>, onDetail: (card: Card) => void, onBack: () => void }) => {
  const [opening, setOpening] = useState(false);
  const [results, setResults] = useState<Card[] | null>(null);

  const startOpening = async (count: number, isScroll: boolean = false) => {
    const cost = isScroll ? 10 : (count === 10 ? 1800 : 200);
    const balance = isScroll ? arenaScrolls : credits;
    if (balance < cost) return;

    setOpening(true);
    setResults(null);
    const cards = await onOpen(count, isScroll);
    
    // Simulate "loading/summoning" delay
    setTimeout(() => {
      setResults(cards || null);
      setOpening(false);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-8 overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-neutral-950 to-black">
      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <Home size={14} />
          <span>Exit to Nexus</span>
        </button>
      </div>
      <AnimatePresence>
        {opening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <motion.div 
              animate={{ 
                rotate: 360, 
                scale: [1, 1.2, 1],
                boxShadow: ["0 0 20px #3b82f6", "0 0 60px #3b82f6", "0 0 20px #3b82f6"] 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-56 h-56 rounded-full border-b-4 border-blue-500 relative flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border-t-2 border-white/5 animate-pulse" />
              <div className="relative flex flex-col items-center">
                 <Cpu size={56} className="text-blue-500 animate-spin mb-4" />
                 <Dna size={32} className="text-blue-300/50 animate-pulse" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 text-sm font-black uppercase tracking-[0.6em] text-white animate-pulse text-center"
            >
              <div className="text-blue-500 mb-2">Neural Extraction in Progress</div>
              <div className="text-[10px] text-neutral-500">Syncing Unit Templates...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!results && !opening && (
        <div className="flex flex-col items-center gap-16 py-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-5xl font-serif italic mb-2 tracking-tighter text-blue-400">Unit Extraction</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em]">Acquire master-grade tactical data blocks</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-12 sm:gap-16">
            {/* Standard Pack */}
            <motion.div 
              onClick={() => startOpening(1)}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`w-64 h-96 relative cursor-pointer group transition-all ${credits < 200 ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-full h-full bg-neutral-900 border-2 border-white/10 rounded-[3rem] flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                 <Package size={64} className="text-white mb-6 group-hover:scale-110 transition-transform" />
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Tactical Pack</div>
                 <div className="text-sm font-serif italic text-neutral-400 mt-2">200 Credits</div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max px-6 py-2 bg-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">Decrypt x1</div>
            </motion.div>

            {/* Tactical Decade Pack */}
            <motion.div 
              onClick={() => startOpening(10)}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`w-64 h-96 relative cursor-pointer group transition-all ${credits < 1800 ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-amber-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-full h-full bg-neutral-900 border-2 border-amber-500/30 rounded-[3rem] flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10" />
                 <div className="flex -space-x-4 mb-6 group-hover:scale-110 transition-transform">
                    <Package size={48} className="text-amber-400/50" />
                    <Package size={48} className="text-amber-500 relative z-10" />
                    <Package size={48} className="text-amber-400/50" />
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Decade Protocol</div>
                 <div className="text-sm font-serif italic text-neutral-400 mt-2">1,800 Credits</div>
                 <div className="mt-4 px-3 py-1 bg-amber-500/20 rounded-lg border border-amber-500/50 text-[6px] font-black uppercase tracking-widest text-amber-500">Legendary Guaranteed</div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max px-6 py-2 bg-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">Decrypt x10</div>
            </motion.div>

            {/* Elite Arena Scroll */}
            <motion.div 
              onClick={() => startOpening(1, true)}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`w-64 h-96 relative cursor-pointer group transition-all ${arenaScrolls < 10 ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-rose-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-full h-full bg-neutral-900 border-2 border-rose-500/40 rounded-[3rem] flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-rose-500/10" />
                 <Sparkles size={64} className="text-rose-400 mb-6 animate-pulse group-hover:scale-110 transition-transform" />
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Elite Data Scroll</div>
                 <div className="text-sm font-serif italic text-neutral-400 mt-2">10 Scrolls</div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max px-6 py-2 bg-rose-600 rounded-full text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">Extract Master Data</div>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-neutral-600">
             <div className="flex items-center gap-2">Common: 60%</div>
             <div className="flex items-center gap-2">Rare: 25%</div>
             <div className="flex items-center gap-2">Epic: 10%</div>
             <div className="flex items-center gap-2 text-amber-500/80">Legendary: 4%</div>
             <div className="flex items-center gap-2 text-rose-500/80">Mythic: 1%</div>
          </div>
        </div>
      )}

      {results && !opening && (
        <div className="flex flex-col items-center gap-12 w-full max-w-6xl py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-4xl font-black italic tracking-tighter text-blue-400 uppercase">Extraction Result</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2">{results.length} Tactical units synced to archives</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 px-4">
            {results.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
                onClick={() => onDetail(card)}
                className={`w-48 aspect-[3/4] relative rounded-3xl overflow-hidden border shadow-2xl group/card cursor-pointer ${RarityGlow[card.rarity || 'COMMON']}`}
              >
                <img src={card.image} className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className={`text-[8px] font-black uppercase tracking-widest mb-1 ${card.rarity === 'LEGENDARY' ? 'text-amber-400' : card.rarity === 'MYTHIC' ? 'text-rose-500' : 'text-neutral-400'}`}>
                    {card.rarity}
                  </div>
                  <div className="text-sm font-black text-white truncate leading-tight">{card.name}</div>
                  <div className="text-[8px] text-neutral-500 mt-1 uppercase font-black">{card.type}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: results.length * 0.1 + 0.5 }}
            onClick={() => setResults(null)}
            className="px-16 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-2xl mt-8"
          >
            De-link Portal
          </motion.button>
        </div>
      )}
    </div>
  );
};

const StoreArea = ({ credits, gold, materials, onBuy, storeIcons, onBuyIcon, onBack }: { credits: number, gold: number, materials: number, onBuy: (type: string) => void, storeIcons: any[], onBuyIcon: (icon: any) => void, onBack: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-start p-6 gap-12 overflow-y-auto custom-scrollbar pb-32 relative">
    <div className="absolute top-8 left-8">
      <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
        <Home size={20} />
      </button>
    </div>
    <div className="text-center">
       <h2 className="text-5xl font-display font-black italic tracking-tighter italic italic underline decoration-nexus-blue underline-offset-8 mb-4">Nano-Alloy Foundry</h2>
       <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-black">Tactical Enhancement Sector</p>
    </div>

    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col items-center text-center group hover:border-nexus-blue/30 transition-all">
        <div className="p-4 bg-nexus-blue/10 rounded-3xl mb-6 text-nexus-blue shadow-[0_0_20px_rgba(0,242,255,0.2)] group-hover:scale-110 transition-transform"><Hammer size={40} /></div>
        <div className="text-2xl font-black italic tracking-tighter mb-2 italic italic">Nano-Alloy Cache</div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-8 font-black">Contains 50x Sync Alloys</div>
        <button 
          onClick={() => onBuy('ALLOY')}
          className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-nexus-blue hover:text-white transition-all shadow-xl"
        >
          <span>30 Gold</span>
        </button>
      </div>

      <div className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col items-center text-center border-amber-500/20 group hover:border-amber-500/50 transition-all">
        <div className="p-4 bg-amber-500/10 rounded-3xl mb-6 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform"><CircleDollarSign size={40} /></div>
        <div className="text-2xl font-black italic tracking-tighter mb-2 italic italic">Credit Infusion</div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-8 font-black">Convert Gold to 1000 Credits</div>
        <button 
          onClick={() => onBuy('CREDITS')}
          className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-xl"
        >
          <span>50 Gold</span>
        </button>
      </div>

      <div className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col items-center text-center border-purple-500/20 group hover:border-purple-500/50 transition-all">
        <div className="p-4 bg-purple-500/10 rounded-3xl mb-6 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform"><Dna size={40} /></div>
        <div className="text-2xl font-black italic tracking-tighter mb-2 italic italic">Neural Package</div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-8 font-black">Contains 5x Neural Scrolls</div>
        <button 
          onClick={() => onBuy('SCROLLS')}
          className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl"
        >
          <span>100 Gold</span>
        </button>
      </div>
    </div>

    {storeIcons && storeIcons.length > 0 && (
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <h3 className="text-3xl font-display font-black tracking-tight italic italic underline decoration-purple-500 underline-offset-8">NEURAL SYMBOLS</h3>
           <div className="flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <RefreshCw size={12} className="animate-spin-slow" />
             Rotates every 7h
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeIcons.map((icon, i) => (
            <div key={icon.id} className="glass-card p-6 rounded-[2.5rem] border-white/5 flex items-center gap-6 group hover:border-purple-500/30 transition-all">
               <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 relative">
                  <img src={icon.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="flex-1">
                  <div className="text-lg font-black italic tracking-tighter mb-2 italic italic">Neural Icon #{i+1}</div>
                  <button 
                    onClick={() => onBuyIcon(icon)}
                    disabled={credits < icon.cost}
                    className="w-full py-2 bg-nexus-blue/10 border border-nexus-blue/30 rounded-xl text-nexus-blue font-black uppercase text-[9px] tracking-widest hover:bg-nexus-blue hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {icon.cost} Credits
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
const POINTS_THRESHOLDS = [10, 20, 40, 60, 80, 90, 100];

const OnlineBattleArea = ({ profile, onCombat }: { profile: UserProfile, onCombat: () => void }) => {
  const isAscencion = profile.rank === 'ASCENCION';
  const nextThreshold = POINTS_THRESHOLDS.find(p => p > profile.points) || 100;
  const progressToNext = isAscencion ? 100 : (profile.points / nextThreshold) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 overflow-y-auto custom-scrollbar">
      <div className="text-center">
        <h2 className="text-7xl font-serif italic mb-2 tracking-tighter text-blue-500">Online Sector</h2>
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] animate-pulse whitespace-nowrap">Global tactical network linked</p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="glass-card p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden h-full flex flex-col justify-center bg-gradient-to-br from-neutral-900 to-black">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Sword size={160} /></div>
          
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Combat Profile</div>
            <div className="text-6xl font-black italic mb-2 tracking-tighter">{isAscencion ? 'ASCENCION' : profile.rank}</div>
            <div className="flex items-baseline gap-2 mb-8">
               <span className="text-3xl font-black text-white">{isAscencion ? profile.elo : profile.points}</span>
               <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{isAscencion ? 'ELO Rating' : 'Combat Points'}</span>
            </div>

            {!isAscencion && (
              <div className="space-y-4">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-neutral-500">
                  <span>System Progress to next tier</span>
                  <span>{Math.floor(progressToNext)}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {POINTS_THRESHOLDS.map(p => (
                    <div key={p} className={`h-1 w-6 rounded-full ${profile.points >= p ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-neutral-800'}`} />
                  ))}
                </div>
              </div>
            )}

            {isAscencion && (
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Ascencion Protocol Active</div>
                <div className="text-[9px] text-neutral-500 leading-relaxed uppercase font-black">Elite ELO calculations in effect. Global ranking active.</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex items-center gap-6 bg-white/5">
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]"><Trophy size={32} /></div>
            <div>
              <div className="text-sm font-black text-white">Reward Stream</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Victory awarded GOLD + BP XP</div>
            </div>
          </div>

          <button 
            onClick={onCombat}
            className="group relative w-full py-12 rounded-[3.5rem] bg-white text-black font-black uppercase text-xl tracking-[0.5em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl overflow-hidden"
          >
            <span className="relative z-10 italic">Neural Battle</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-[3.5rem] border-4 border-white/20 group-hover:scale-105 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
const CollectionArea = ({ ownedCards, materials, onUpgrade, onDetail, onAesthetic, onBack }: { ownedCards: OwnedCardData[], materials: number, onUpgrade: (id: string) => void, onDetail: (card: Card) => void, onAesthetic: (oc: OwnedCardData) => void, onBack: () => void }) => {
  const [filter, setFilter] = useState<'ALL' | Archetype>('ALL');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'>('ALL');

  const [sortOrder, setSortOrder] = useState<'RARITY' | 'LEVEL' | 'NAME'>('RARITY');

  const filtered = ownedCards.filter(oc => {
    const card = CARD_DATA.find(c => c.id === oc.cardId);
    if (!card) return false;
    const typeMatch = filter === 'ALL' || card.type === filter;
    const rarityMatch = rarityFilter === 'ALL' || card.rarity === rarityFilter;
    return typeMatch && rarityMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const cardA = CARD_DATA.find(c => c.id === a.cardId);
    const cardB = CARD_DATA.find(c => c.id === b.cardId);
    if (!cardA || !cardB) return 0;

    if (sortOrder === 'RARITY') {
      const rarities = { 'COMMON': 0, 'RARE': 1, 'EPIC': 2, 'LEGENDARY': 3, 'MYTHIC': 4 };
      return rarities[cardB.rarity] - rarities[cardA.rarity];
    }
    if (sortOrder === 'LEVEL') return b.level - a.level;
    return cardA.name.localeCompare(cardB.name);
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 gap-8 overflow-hidden h-full relative">
      <div className="absolute top-4 left-4 lg:hidden">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-lg border border-white/10"><Home size={16} /></button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="hidden lg:flex p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <Home size={20} />
          </button>
          <div>
            <h2 className="text-4xl font-serif italic mb-1 tracking-tighter">Tactical Repository</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{ownedCards.length} Units Recovered</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {['RARITY', 'LEVEL', 'NAME'].map(t => (
              <button 
                key={t}
                onClick={() => setSortOrder(t as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${sortOrder === t ? 'bg-purple-600 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {['ALL', 'TANK', 'STRIKER', 'SNIPER', 'HEALER', 'HORDE'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${filter === t ? 'bg-blue-500 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].map(r => (
              <button 
                key={r}
                onClick={() => setRarityFilter(r as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${rarityFilter === r ? (
                  r === 'MYTHIC' ? 'bg-rose-600 text-white' :
                  r === 'LEGENDARY' ? 'bg-amber-500 text-black' :
                  r === 'EPIC' ? 'bg-purple-600 text-white' :
                  r === 'RARE' ? 'bg-blue-600 text-white' : 'bg-white text-black'
                ) : 'text-neutral-500 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <AnimatePresence mode="popLayout">
            {sorted.map((oc, i) => {
              const card = CARD_DATA.find(c => c.id === oc.cardId)!;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={oc.id || `${oc.cardId}-${i}`}
                  onClick={() => onDetail(card)}
                  className={`group relative aspect-[3/4] rounded-3xl overflow-hidden border cursor-pointer transition-all ${BORDER_DATA.find(b => b.id === oc.borderId)?.style || 'border-white/5'} ${BACKGROUND_DATA.find(bg => bg.id === oc.backgroundId)?.style || 'bg-neutral-900'} ${RarityGlow[card.rarity || 'COMMON']}`}
                >
                  <img src={SKIN_DATA.find(s => s.id === oc.activeSkinId)?.image || card.image} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="p-1 px-2 bg-black/60 rounded-lg border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                        <span className="text-white/80">{getArchetypeIcon(card.type)}</span>
                      </div>
                      <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-lg font-black shadow-lg">LV.{oc.level}</div>
                    </div>

                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${card.rarity === 'LEGENDARY' ? 'text-amber-400' : card.rarity === 'MYTHIC' ? 'text-rose-500' : 'text-neutral-400'}`}>
                        {card.rarity}
                      </div>
                      <div className="text-sm font-black truncate text-white">{card.name}</div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); if (materials >= 20) onUpgrade(oc.cardId); }}
                        className={`mt-4 w-full py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-xl group/btn ${materials >= 20 ? 'bg-white text-black hover:bg-blue-500 hover:text-white' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Hammer size={12} className="group-hover/btn:animate-pulse" />
                          <span>Fix (20)</span>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAesthetic(oc); }}
                        className="mt-2 w-full py-2 rounded-xl text-[9px] font-black uppercase transition-all bg-nexus-blue/10 border border-nexus-blue/30 text-nexus-blue hover:bg-nexus-blue hover:text-black"
                      >
                        Aesthetics
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const BattlePassArea = ({ profile, onClaim, onBack }: { profile: UserProfile, onClaim: (level: number) => void, onBack: () => void }) => {
  const currentLevel = profile.battlePassLevel || 0;
  const currentXp = profile.battlePassXp || 0;
  const progress = (currentXp / BATTLEPASS_XP_PER_LEVEL) * 100;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar pb-32 relative">
       <div className="absolute top-8 left-8">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <Home size={20} />
          </button>
       </div>
      <div className="mb-12 text-center">
        <h2 className="text-6xl font-serif italic mb-2 tracking-tighter text-purple-500 italic">Neural Pass</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="text-2xl font-black text-white">LEVEL {currentLevel}</div>
          <div className="h-4 w-64 bg-neutral-900 rounded-full border border-white/10 overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
          </div>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{currentXp}/{BATTLEPASS_XP_PER_LEVEL} XP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto w-full">
        {Array.from({ length: 50 }).map((_, i) => {
          const level = i + 1;
          const reward = BATTLEPASS_REWARDS.find(r => r.level === level);
          const isUnlocked = currentLevel >= level;
          const isClaimed = profile.claimedRewards?.includes(level);

          return (
            <div key={level} className={`glass-card p-6 rounded-[2rem] border-white/5 flex flex-col items-center text-center relative overflow-hidden transition-all ${!isUnlocked ? 'opacity-40 grayscale' : 'ring-2 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}`}>
              <div className="absolute top-2 left-4 text-[8px] font-black uppercase text-neutral-500">Tier {level}</div>
              
              <div className="p-4 bg-purple-500/10 rounded-2xl mb-4 text-purple-400">
                {reward?.type === 'CARD' ? <Sparkles size={32} /> : reward?.type === 'SKIN' ? <UserIcon size={32} /> : reward?.type === 'SKIN_PACK' ? <Package size={32} /> : reward?.type === 'BOX' ? <Activity size={32} /> : <Coins size={32} />}
              </div>

              <div className="text-xs font-bold mb-1">{reward?.label || 'Supply Drop'}</div>
              <div className="text-[8px] text-neutral-500 uppercase tracking-widest mb-4">{reward?.type || 'MATERIALS'}</div>

              {reward && isUnlocked && !isClaimed && (
                <button 
                  onClick={() => onClaim(level)}
                  className="w-full py-2 bg-purple-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg"
                >
                  Claim Reward
                </button>
              )}
              {isClaimed && (
                <div className="w-full py-2 bg-neutral-800 text-neutral-500 rounded-xl text-[8px] font-black uppercase tracking-widest italic">
                  Claimed
                </div>
              )}
              {!isUnlocked && (
                <div className="w-full py-2 bg-neutral-900 text-neutral-700 rounded-xl text-[8px] font-black uppercase tracking-widest">
                  Locked
                </div>
              )}
            </div>
          );
        })}
        {currentLevel >= 50 && (
          <div className="glass-card p-6 rounded-[2rem] border-white/5 flex flex-col items-center text-center relative overflow-hidden ring-2 ring-cyan-500/30">
            <div className="absolute top-2 left-4 text-[8px] font-black uppercase text-neutral-500">Tier 50+</div>
            <div className="p-4 bg-cyan-500/10 rounded-2xl mb-4 text-cyan-400">
              <Activity size={32} />
            </div>
            <div className="text-xs font-bold mb-1">Infinity Box</div>
            <div className="text-[8px] text-neutral-500 uppercase tracking-widest mb-4">Post-Season Rewards</div>
            <button 
              onClick={() => onClaim(currentLevel)}
              className="w-full py-2 bg-cyan-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg"
            >
              Open Box
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, value, label, colorClass, textClass }: { icon: any, value: any, label: string, colorClass: string, textClass: string }) => (
  <div className="flex items-center gap-3 group cursor-default">
    <div className={`p-2 rounded-xl ${colorClass}/10 border border-white/5 text-${textClass.replace('text-', '')} group-hover:scale-110 transition-transform`}>
      <Icon size={14} />
    </div>
    <div className="flex flex-col">
      <span className={`text-xs font-black italic tracking-tight ${textClass}`}>{value.toLocaleString()}</span>
      <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/30 -mt-1">{label}</span>
    </div>
  </div>
);

const TopBar = ({ profile, onLogout }: { profile: UserProfile, onLogout: () => void }) => {
  return (
    <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-50 sticky top-0">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-nexus-blue to-purple-600 p-[1px] group-hover:rotate-12 transition-transform">
             <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-nexus-blue">
                <Zap size={20} fill="currentColor" />
             </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic tracking-tighter leading-none">NEXUS<span className="text-nexus-blue font-serif italic font-normal text-sm">os</span></h1>
            <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em]">Neural Interface v9.5</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <StatItem icon={CircleDollarSign} value={profile.credits} label="Nano-Credits" colorClass="bg-nexus-blue" textClass="text-nexus-blue" />
          <StatItem icon={Coins} value={profile.gold} label="Materials" colorClass="bg-amber-500" textClass="text-amber-400" />
          <StatItem icon={Sparkles} value={profile.xp} label="Pilot Experience" colorClass="bg-purple-500" textClass="text-purple-400" />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 group cursor-pointer pr-8 border-r border-white/5">
           <div className="text-right">
              <div className="text-xs font-black text-white group-hover:text-nexus-blue transition-colors italic uppercase tracking-tighter">{profile.displayName}</div>
              <div className="h-1 w-24 bg-neutral-900 rounded-full mt-1 overflow-hidden border border-white/5">
                 <div className="h-full bg-nexus-blue shadow-[0_0_8px_rgba(0,210,255,0.6)]" style={{ width: `${(profile.xp % 100)}%` }} />
              </div>
           </div>
           <div className="relative w-12 h-12 rounded-full p-[1px] bg-gradient-to-tr from-nexus-blue/40 to-transparent">
              <img src={profile.avatarUrl} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border border-nexus-blue/50 flex items-center justify-center text-[10px] font-black italic text-nexus-blue">
                {profile.level}
              </div>
           </div>
        </div>
        <button onClick={onLogout} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

const CyberspaceBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    <motion.div 
      animate={{ 
        backgroundPosition: ['0% 0%', '100% 100%'],
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-blue-900/40"
      style={{ backgroundSize: '200% 200%' }}
    />
    <div className="absolute inset-0 blur-[100px] opacity-30">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full"
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], x: [0, -100, 0], y: [0, 100, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full"
      />
    </div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
  </div>
);

export default function App() {
  const [view, setView] = useState<ViewMode>('LOGIN');
  const [sortOrder, setSortOrder] = useState<'RARITY' | 'LEVEL' | 'NAME'>('RARITY');
  const [selectedCardDetail, setSelectedCardDetail] = useState<Card | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [selectedCardAesthetics, setSelectedCardAesthetics] = useState<OwnedCardData | null>(null);

  const getSortedCards = () => {
    return [...ownedCards].sort((a, b) => {
      const cardA = CARD_DATA.find(c => c.id === a.cardId);
      const cardB = CARD_DATA.find(c => c.id === b.cardId);
      if (!cardA || !cardB) return 0;

      if (sortOrder === 'RARITY') {
        const rarities = { 'COMMON': 0, 'RARE': 1, 'EPIC': 2, 'LEGENDARY': 3 };
        return rarities[cardB.rarity] - rarities[cardA.rarity];
      }
      if (sortOrder === 'LEVEL') return b.level - a.level;
      return cardA.name.localeCompare(cardB.name);
    });
  };

  const generateFriendId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    result += '-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const activateAdminMode = async (targetUid: string) => {
    const userRef = doc(db, 'users', targetUid);
    try {
      await updateDoc(userRef, {
        credits: 999999,
        gold: 999999,
        materials: 999999,
        rank: 'ASCENCION',
        elo: 5000,
        battlePassLevel: 50,
        isAdmin: true
      });
      // Unlock all cards - doing this in a batch or skipping to avoid rate limits
      console.log('SYSTEM SOURCE ACCESSED: Omnipotence protocol active.');
      setView('MENU');
    } catch (e) {
      console.error(e);
    }
  };
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ownedCards, setOwnedCards] = useState<OwnedCardData[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [board, setBoard] = useState<(Unit | null)[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerMana, setPlayerMana] = useState(5);
  const [enemyMana, setEnemyMana] = useState(5);
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(['Nexus Core online. Tactical map loaded.']);
  const [boardScale, setBoardScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const startBattle = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setPlayerHp(100);
    setEnemyHp(100);
    setPlayerMana(5);
    setEnemyMana(5);
    setTurn('PLAYER');
    setGameOver(null);
    setLog(['Nexus Core online. Tactical map loaded.']);
    setView('BATTLE');
  };

  // Auth & Profile Sync
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch or Create Profile
        const userId = u.uid;
        const userRef = doc(db, 'users', userId);
        
        try {
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: userId,
              displayName: u.displayName || 'Pilot',
              friendId: generateFriendId(),
              credits: 2000, 
              gold: 500,
              materials: 100,
              arenaScrolls: 0,
              level: 1,
              xp: 0,
              avatarUrl: u.photoURL || DEFAULT_ICONS[0],
              ownedIcons: [DEFAULT_ICONS[0]],
              storeIcons: [],
              rank: 'BRONZE',
              points: 0,
              elo: 100,
              isGuest: u.isAnonymous,
              isAdmin: u.email === 'williamkas84@gmail.com',
              guildId: null,
              battlePassLevel: 1,
              battlePassXp: 0,
              claimedRewards: []
            };
            await setDoc(userRef, newProfile);
            
            // Create initial missions
            const initialMissions = [
              { id: 'm1', title: 'Daily Login', description: 'Access the grid today', rewardType: 'GOLD', rewardAmount: 100, completed: false, type: 'DAILY' },
              { id: 'm2', title: 'First Battle', description: 'Complete 1 combat simulation', rewardType: 'XP', rewardAmount: 50, completed: false, type: 'DAILY' }
            ];
            for (const m of initialMissions) {
              await setDoc(doc(db, `users/${userId}/missions`, m.id), m);
            }
            
            const starterCards = ['h1', 'r1', 't1'];
            for (const cardId of starterCards) {
               await setDoc(doc(db, `users/${userId}/cards`, cardId), {
                 cardId,
                 level: 1,
                 xp: 0,
                 ownerId: userId,
                 unlockedSkins: []
               });
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
        }

        // Listen to profile
        const unsubProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile;
            
            // Backfill friendId if missing
            if (!data.friendId) {
               updateDoc(userRef, { friendId: generateFriendId() });
            }

            // Store refresh check
            const now = Date.now();
            if (!data.storeIcons || data.storeIcons.length === 0 || now > data.storeIcons[0].expiresAt) {
              const newIcons = [
                { id: `icon_${now}_1`, image: `https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=150`, cost: 500, expiresAt: now + STORE_REFRESH_INTERVAL },
                { id: `icon_${now}_2`, image: `https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=150`, cost: 1000, expiresAt: now + STORE_REFRESH_INTERVAL },
                { id: `icon_${now}_3`, image: `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=150`, cost: 1500, expiresAt: now + STORE_REFRESH_INTERVAL },
              ];
              updateDoc(userRef, { storeIcons: newIcons });
            }

            setProfile(data);
            
            // Auto-Admin Check - check isAdmin flag to prevent repeat calls
            if (u.email === 'williamkas84@gmail.com' && !data.isAdmin) {
               activateAdminMode(u.uid);
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}`);
        });

        // Listen to owned cards
        const cardsPath = `users/${userId}/cards`;
        const cardsQuery = query(collection(db, cardsPath), where('ownerId', '==', userId));
        const unsubCards = onSnapshot(cardsQuery, (snap) => {
          const cards: OwnedCardData[] = [];
          snap.forEach(doc => cards.push(doc.data() as OwnedCardData));
          setOwnedCards(cards);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, cardsPath);
        });

        const missionsPath = `users/${userId}/missions`;
        const unsubMissions = onSnapshot(collection(db, missionsPath), (snap) => {
          const ms: Mission[] = [];
          snap.forEach(doc => ms.push(doc.data() as Mission));
          setMissions(ms);
        }, (error) => handleFirestoreError(error, OperationType.GET, missionsPath));

        const unsubGuilds = onSnapshot(collection(db, 'guilds'), (snap) => {
          const gs: Guild[] = [];
          snap.forEach(doc => gs.push(doc.data() as Guild));
          setGuilds(gs);
        });

        // Add Gold to the cleanup also if needed, but onSnapshot handles updates.

        setView('MENU');
        setLoading(false);
        return () => {
          unsubProfile();
          unsubCards();
        };
      } else {
        setView('LOGIN');
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // Responsive Board Scaling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const targetWidth = 800;
      const scaleW = clientWidth / targetWidth;
      const scaleH = (clientHeight * 1.5) / targetWidth;
      setBoardScale(Math.min(scaleW, scaleH, 1.2));
    };
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();
    return () => observer.disconnect();
  }, []);

  // Initialize hand from owned cards
  useEffect(() => {
    if (view === 'BATTLE' && ownedCards.length > 0) {
      const initialHand = Array(4).fill(null).map(() => {
        const oc = ownedCards[Math.floor(Math.random() * ownedCards.length)];
        return CARD_DATA.find(c => c.id === oc.cardId) || CARD_DATA[0];
      });
      setHand(initialHand);
    }
  }, [view, ownedCards]);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 4));

  const spawnUnit = useCallback((card: Card, x: number, y: number, team: 'PLAYER' | 'ENEMY') => {
    if (board[y][x]) return false;
    
    // Aesthetic check for player units
    const oc = team === 'PLAYER' ? ownedCards.find(c => c.cardId === card.id) : null;
    const skin = SKIN_DATA.find(s => s.id === oc?.activeSkinId);

    const newUnit: Unit = {
      id: Math.random().toString(36).substr(2, 9),
      type: card.type,
      name: card.name,
      hp: card.stats.hp || 100,
      maxHp: card.stats.hp || 100,
      damage: card.stats.damage || 10,
      nexusDamage: card.stats.nexusDamage || 10,
      range: card.stats.range || 1,
      movement: card.stats.movement || 1,
      team,
      x,
      y,
      cost: card.cost,
      description: card.description,
      image: skin?.image || card.image || "",
      borderId: oc?.borderId,
      backgroundId: oc?.backgroundId,
      ability: card.ability
    };

    const newBoard = [...board.map(row => [...row])];
    newBoard[y][x] = newUnit;
    setBoard(newBoard);
    playPlacementSound();
    if (team === 'PLAYER' && (card as any).voiceLine) {
       speakLine((card as any).voiceLine, card.type);
    }
    return true;
  }, [board]);

  const moveUnit = (fromX: number, fromY: number, toX: number, toY: number) => {
    const unit = board[fromY][fromX];
    if (!unit || board[toY][toX]) return;

    const newBoard = [...board.map(row => [...row])];
    newBoard[toY][toX] = { ...unit, x: toX, y: toY };
    newBoard[fromY][fromX] = null;
    setBoard(newBoard);
    setSelectedCell(null);
    addLog(`${unit.name} translated to [${toX}, ${toY}]`);
  };

  const attackUnit = (attacker: Unit, targetX: number, targetY: number) => {
    const target = board[targetY][targetX];
    if (!target) return;

    const newBoard = [...board.map(row => [...row])];
    
    // Set attacking state
    const currentAttacker = { ...attacker, isAttacking: { x: targetX, y: targetY } };
    newBoard[attacker.y][attacker.x] = currentAttacker;
    setBoard([...newBoard]);

    setTimeout(() => {
      const finalBoard = [...board.map(row => [...row])];
      const refreshingAttacker = finalBoard[attacker.y][attacker.x];
      if (refreshingAttacker) {
        finalBoard[attacker.y][attacker.x] = { ...refreshingAttacker, isAttacking: null };
      }

      if (attacker.type === 'HEALER') {
        if (target.team === attacker.team) {
          const healedTarget = { ...target, hp: Math.min(target.maxHp, target.hp + attacker.damage) };
          finalBoard[targetY][targetX] = healedTarget;
          addLog(`${attacker.name} restored status of ${target.name}`);
        }
        setBoard(finalBoard);
        return;
      }

      if (attacker.type === 'MAGE') {
        applyDamage(finalBoard, targetX, targetY, attacker.damage, attacker);
        const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        adj.forEach(([dx, dy]) => {
          const nx = targetX + dx;
          const ny = targetY + dy;
          if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
            applyDamage(finalBoard, nx, ny, Math.floor(attacker.damage / 2), attacker);
          }
        });
        addLog(`${attacker.name} triggered AoE burst!`);
        setBoard(finalBoard);
        return;
      }

      if (target.team !== attacker.team) {
        // ON_ATTACK effects
        if (attacker.ability?.type === 'ON_ATTACK') {
           if (attacker.ability.name === 'Reinforce' || attacker.ability.name === 'Aegis') {
              const currentAttacker = finalBoard[attacker.y][attacker.x];
              if (currentAttacker) {
                finalBoard[attacker.y][attacker.x] = { ...currentAttacker, hp: Math.min(currentAttacker.maxHp, currentAttacker.hp + attacker.ability.effectValue) };
              }
           }
           if (attacker.ability.name === 'Void Reach' && attacker.team === 'PLAYER') {
              setEnemyMana(prev => Math.max(0, prev - attacker.ability!.effectValue));
           }
           if (attacker.ability.name === 'Void Reach' && attacker.team === 'ENEMY') {
              setPlayerMana(prev => Math.max(0, prev - attacker.ability!.effectValue));
           }
        }

        applyDamage(finalBoard, targetX, targetY, attacker.damage, attacker);
        addLog(`${attacker.name} engaged ${target.name}`);
        setBoard(finalBoard);
      }
    }, 400);
  };

  const applyDamage = (boardRef: (Unit | null)[][], x: number, y: number, dmg: number, attacker?: Unit) => {
    const target = boardRef[y][x];
    if (!target) return;

    let finalDamage = dmg;
    
    // Passive defense check
    if (target.ability?.type === 'PASSIVE') {
      if (['Titan Armor', 'Block', 'Fortress', 'Hardened'].includes(target.ability.name)) {
        finalDamage = Math.max(1, finalDamage - target.ability.effectValue);
      }
      if (target.ability.name === 'Void Shield' && attacker) {
        // Reflect damage back to attacker if possible
        const reflected = Math.floor(dmg * target.ability.effectValue);
        const attackerRef = boardRef[attacker.y][attacker.x];
        if (attackerRef) {
          boardRef[attacker.y][attacker.x] = { ...attackerRef, hp: attackerRef.hp - reflected, lastHit: Date.now() };
          if (boardRef[attacker.y][attacker.x]!.hp <= 0) boardRef[attacker.y][attacker.x] = null;
        }
      }
    }

    const updated = { ...target, hp: target.hp - finalDamage, lastHit: Date.now() };
    if (updated.hp <= 0) {
      // ON_DEATH check
      if (target.ability?.type === 'ON_DEATH' && target.ability.name === 'Nuclear Exit') {
        const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        adj.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
            applyDamage(boardRef, nx, ny, target.ability!.effectValue);
          }
        });
      }
      boardRef[y][x] = null;
    } else {
      boardRef[y][x] = updated;
    }
  };

  const attackNexus = (attacker: Unit) => {
    const targetX = attacker.team === 'PLAYER' ? 7 : 0;
    const targetY = 2.5; // Visual center of nexus tiles
    const newBoard = [...board.map(row => [...row])];
    newBoard[attacker.y][attacker.x] = { ...attacker, isAttacking: { x: targetX, y: targetY } };
    setBoard(newBoard);

    setTimeout(() => {
      const finalBoard = [...board.map(row => [...row])];
      const refreshingAttacker = finalBoard[attacker.y][attacker.x];
      if (refreshingAttacker) {
        finalBoard[attacker.y][attacker.x] = { ...refreshingAttacker, isAttacking: null };
      }
      setBoard(finalBoard);

      if (attacker.type === 'HEALER') {
        if (attacker.team === 'PLAYER') {
          setPlayerHp(prev => Math.min(100, prev + 5));
          addLog(`Nexus Integrity restored.`);
        } else {
          setEnemyHp(prev => Math.min(100, prev + 5));
          addLog(`Enemy Nexus Integrity restored.`);
        }
        return;
      }

      if (attacker.team === 'PLAYER') {
        const newHp = Math.max(0, enemyHp - attacker.nexusDamage);
        setEnemyHp(newHp);
        addLog(`Direct hit on Enemy Nexus!`);
        if (newHp === 0) setGameOver('PLAYER');
      } else {
        const newHp = Math.max(0, playerHp - attacker.nexusDamage);
        setPlayerHp(newHp);
        addLog(`CRITICAL: Nexus hit!`);
        if (newHp === 0) setGameOver('ENEMY');
      }
    }, 400);
  };

  const endTurn = () => {
    if (gameOver) return;
    
    if (turn === 'PLAYER') {
      setTurn('ENEMY');
      setEnemyMana(prev => Math.min(MAX_MANA, prev + 2));
      setTimeout(() => processEnemyTurn(), 1000);
    } else {
      setTurn('PLAYER');
      setPlayerMana(prev => Math.min(MAX_MANA, prev + 2));
      setHand(prev => {
        if (prev.length >= 6 || ownedCards.length === 0) return prev;
        const oc = ownedCards[Math.floor(Math.random() * ownedCards.length)];
        const card = CARD_DATA.find(c => c.id === oc.cardId) || CARD_DATA[0];
        return [...prev, card];
      });
    }
  };

  const processEnemyTurn = () => {
    const enemyUnits: Unit[] = [];
    board.forEach(row => row.forEach(unit => {
      if (unit && unit.team === 'ENEMY') enemyUnits.push(unit);
    }));

    enemyUnits.forEach(u => {
      const dxToNexus = Math.abs(u.x - 0);
      const dyToNexus = Math.min(Math.abs(u.y - 2), Math.abs(u.y - 3));

      if (dxToNexus <= u.range && dyToNexus <= u.range) {
        attackNexus(u);
      } else if (u.x > 0) {
        const nextX = u.x - 1;
        if (!board[u.y][nextX]) {
          moveUnit(u.x, u.y, nextX, u.y);
        } else if (board[u.y][nextX]?.team === 'PLAYER') {
          attackUnit(u, nextX, u.y);
        }
      }
    });

    const spawnY = Math.floor(Math.random() * BOARD_HEIGHT);
    const randomCard = CARD_DATA[Math.floor(Math.random() * CARD_DATA.length)];
    if (enemyMana >= randomCard.cost) {
      if (spawnUnit(randomCard, 7, spawnY, 'ENEMY')) {
        setEnemyMana(prev => prev - randomCard.cost);
      }
    }

    setTurn('PLAYER');
    setPlayerMana(prev => Math.min(MAX_MANA, prev + 2));
    setHand(prev => {
      if (prev.length >= 6 || ownedCards.length === 0) return prev;
      const oc = ownedCards[Math.floor(Math.random() * ownedCards.length)];
      const card = CARD_DATA.find(c => c.id === oc.cardId) || CARD_DATA[0];
      return [...prev, card];
    });
  };

  const handleCellClick = (x: number, y: number) => {
    if (turn !== 'PLAYER' || gameOver) return;
    const unit = board[y][x];

    if (selectedCell) {
      const selectedUnit = board[selectedCell.y][selectedCell.x];
      if (selectedUnit && selectedUnit.team === 'PLAYER') {
        const dx = Math.abs(x - selectedCell.x);
        const dy = Math.abs(y - selectedCell.y);
        if (!unit && (dx + dy <= selectedUnit.movement)) {
          moveUnit(selectedCell.x, selectedCell.y, x, y);
          return;
        }
        if ((x === 7 && (y === 2 || y === 3)) && dx <= selectedUnit.range && dy <= selectedUnit.range) {
           attackNexus(selectedUnit);
           setSelectedCell(null);
           return;
        }
        if (unit && unit.team === 'ENEMY' && (dx + dy <= selectedUnit.range)) {
          attackUnit(selectedUnit, x, y);
          setSelectedCell(null);
          return;
        }
      }
      setSelectedCell(null);
    } else if (unit && unit.team === 'PLAYER') {
      setSelectedCell({ x, y });
    }
  };



  const handleClaimBPReward = async (level: number) => {
    if (!profile || !user) return;
    const isInfinityBox = level >= 50;
    if (!isInfinityBox && profile.claimedRewards?.includes(level)) return;
    
    const reward = BATTLEPASS_REWARDS.find(r => r.level === level);
    if (!isInfinityBox && !reward) return;
    if ((profile.battlePassLevel || 0) < level) return;

    const userRef = doc(db, 'users', user.uid);
    const updates: any = {};

    try {
      if (!isInfinityBox) {
        updates.claimedRewards = [...(profile.claimedRewards || []), level];
        if (reward?.type === 'CREDITS') updates.credits = (profile.credits || 0) + (reward.amount || 0);
        if (reward?.type === 'GOLD') updates.gold = (profile.gold || 0) + (reward.amount || 0);
        if (reward?.type === 'MATERIALS') updates.materials = (profile.materials || 0) + (reward.amount || 0);
        if (reward?.type === 'CARD' && reward.id) {
           const cardPath = `users/${user.uid}/cards`;
           await setDoc(doc(db, cardPath, reward.id + "_" + Date.now()), {
              cardId: reward.id,
              level: 1,
              xp: 0,
              ownerId: user.uid,
              unlockedSkins: []
           });
        }
      } else {
        const roll = Math.random();
        if (roll < 0.4) updates.materials = (profile.materials || 0) + 15;
        else if (roll < 0.8) updates.gold = (profile.gold || 0) + 1000;
        else updates.credits = (profile.credits || 0) + 500;
        alert("Infinity Box Opened! Rewards distributed into sector storage.");
      }
      
      await updateDoc(userRef, updates);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleCombatResult = async () => {
    if (!profile || !user) return;
    
    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    const win = Math.random() > 0.4;
    
    let pointsChange = win ? 10 : -5;
    let eloChange = win ? 25 : -20;
    
    let newPoints = Math.max(0, (profile.points || 0) + pointsChange);
    let newElo = Math.max(0, (profile.elo || 100) + eloChange);
    const isAscencion = profile.rank === 'ASCENCION';
    
    let newRank = profile.rank;
    if (!isAscencion) {
      if (newPoints >= 100) {
        newRank = 'ASCENCION';
      } else {
        const ranks = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER'];
        const thresholds = [0, 20, 40, 60, 80, 90];
        let rankIdx = 0;
        for (let i = thresholds.length - 1; i >= 0; i--) {
          if (newPoints >= thresholds[i]) {
            rankIdx = i;
            break;
          }
        }
        newRank = ranks[rankIdx] as any;
      }
    }

    const goldEarned = win ? 250 : 50;
    const bpXpEarned = win ? 300 : 100;
    
    // Threshold bonuses
    let thresholdGoldBonus = 0;
    let thresholdXpBonus = 0;
    const thresholds = [10, 20, 40, 60, 80, 90, 100];
    thresholds.forEach(t => {
      if ((profile.points || 0) < t && newPoints >= t) {
        thresholdGoldBonus += 1000;
        thresholdXpBonus += 500;
      }
    });

    let newBpXp = (profile.battlePassXp || 0) + bpXpEarned + thresholdXpBonus;
    let newBpLevel = (profile.battlePassLevel || 1);
    
    while (newBpXp >= BATTLEPASS_XP_PER_LEVEL && newBpLevel < 50) {
      newBpXp -= BATTLEPASS_XP_PER_LEVEL;
      newBpLevel++;
    }

    try {
      await updateDoc(userRef, {
        points: newPoints,
        elo: newElo,
        rank: newRank,
        gold: (profile.gold || 0) + goldEarned + thresholdGoldBonus,
        battlePassXp: newBpXp,
        battlePassLevel: newBpLevel
      });
      let msg = win ? `Neural Victory! +${pointsChange} Points, +${bpXpEarned} BP XP` : `Neural Disconnect. ${pointsChange} Points, +${bpXpEarned} BP XP`;
      if (thresholdGoldBonus > 0) msg += `\nTHRESHOLD REACHED: +${thresholdGoldBonus} Gold bonus!`;
      alert(msg);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Using existing containerRef and boardScale
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40;
        const boardWidthPx = BOARD_WIDTH * 80 + (BOARD_WIDTH - 1) * 8 + 32;
        const newScale = Math.min(1, containerWidth / boardWidthPx);
        setBoardScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="border-4 border-blue-500/20 border-t-blue-500 w-12 h-12 rounded-full" />
      </div>
    );
  }

  const pickCardByRarity = () => {
    const roll = Math.random() * 100;
    let rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' = 'COMMON';
    
    if (roll < 1) rarity = 'MYTHIC';
    else if (roll < 5) rarity = 'MYTHIC'; // Actually let's make it 1% Mythic, 4% Legendary, 10% Epic, 25% Rare, 60% Common
    else if (roll < 15) rarity = 'EPIC';
    else if (roll < 40) rarity = 'RARE';
    else rarity = 'COMMON';

    // Better weights for 1% Mythic, 5% Legendary, 15% Epic, 40% Rare
    if (roll < 1) rarity = 'MYTHIC';
    else if (roll < 6) rarity = 'LEGENDARY';
    else if (roll < 21) rarity = 'EPIC';
    else if (roll < 51) rarity = 'RARE';
    else rarity = 'COMMON';

    const pool = CARD_DATA.filter(c => c.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)] || CARD_DATA[0];
  };

  const handleOpenPack = async (count: number = 1, isScroll: boolean = false) => {
    const cost = isScroll ? 10 : (count === 10 ? 1800 : 200);
    const balance = isScroll ? profile?.arenaScrolls : profile?.credits;
    if (!profile || (balance || 0) < cost) return;
    
    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    let bonusMaterials = 0;
    
    const results: Card[] = [];
    try {
      for (let i = 0; i < count; i++) {
        let card = pickCardByRarity();
        
        // Elite Gacha (Scrolls) has better rates
        if (isScroll) {
          const eliteRoll = Math.random() * 100;
          let eliteRarity: any = 'RARE';
          if (eliteRoll < 5) eliteRarity = 'MYTHIC';
          else if (eliteRoll < 20) eliteRarity = 'LEGENDARY';
          else if (eliteRoll < 50) eliteRarity = 'EPIC';
          
          const elitePool = CARD_DATA.filter(c => c.rarity === eliteRarity);
          card = elitePool[Math.floor(Math.random() * elitePool.length)] || card;
        }

        // x10 Guarantee: at least one Legendary or higher?
        if (count === 10 && i === 9 && !results.some(c => c.rarity === 'LEGENDARY' || c.rarity === 'MYTHIC')) {
          const highPool = CARD_DATA.filter(c => c.rarity === 'LEGENDARY' || c.rarity === 'MYTHIC');
          card = highPool[Math.floor(Math.random() * highPool.length)];
        }

        results.push(card);
        if (card.rarity === 'LEGENDARY' || card.rarity === 'MYTHIC') {
          playRaritySound(card.rarity);
        }
        
        // Extra materials chance (25% per card in elite)
        if (Math.random() < (isScroll ? 0.4 : 0.2)) bonusMaterials += 10;

        const cardPath = `users/${userId}/cards`;
        await setDoc(doc(db, cardPath, card.id + "_" + Date.now() + "_" + i), {
          cardId: card.id,
          level: 1,
          xp: 0,
          ownerId: userId
        });
      }

      const updates: any = {};
      if (isScroll) updates.arenaScrolls = (profile.arenaScrolls || 0) - cost;
      else updates.credits = (profile.credits || 0) - cost;
      updates.materials = (profile.materials || 0) + bonusMaterials;

      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }

    return results;
  };

  const handleUpgrade = async (cardId: string) => {
    if (!profile || profile.materials < 20) return;
    
    const cardData = ownedCards.find(c => c.cardId === cardId);
    if (!cardData) return;

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    const cardRef = doc(db, `users/${userId}/cards`, cardId);
    
    try {
      await updateDoc(userRef, { materials: profile.materials - 20 });
      await updateDoc(cardRef, { level: cardData.level + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleBuy = async (type: string) => {
    if (!profile || !user) return;
    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    try {
      if (type === 'ALLOY' && profile.gold >= 30) {
        await updateDoc(userRef, { gold: profile.gold - 30, materials: profile.materials + 50 });
      } else if (type === 'CREDITS' && (profile.gold || 0) >= 50) {
        await updateDoc(userRef, { gold: profile.gold - 50, credits: (profile.credits || 0) + 1000 });
      } else if (type === 'SCROLLS' && (profile.gold || 0) >= 100) {
        await updateDoc(userRef, { gold: profile.gold - 100, arenaScrolls: (profile.arenaScrolls || 0) + 5 });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleBuyIcon = async (icon: any) => {
    if (!profile || profile.credits < icon.cost) return;
    const userRef = doc(db, 'users', user!.uid);
    await updateDoc(userRef, {
      credits: profile.credits - icon.cost,
      ownedIcons: [...profile.ownedIcons, icon.image],
      storeIcons: profile.storeIcons.filter((i: any) => i.id !== icon.id)
    });
  };

  const handleUpdateAvatar = async (url: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { avatarUrl: url });
  };

  const handleUpdateCardAesthetics = async (data: Partial<OwnedCardData>) => {
    if (!selectedCardAesthetics || !user) return;
    const cardRef = doc(db, `users/${user.uid}/cards`, selectedCardAesthetics.cardId);
    await updateDoc(cardRef, data);
    setSelectedCardAesthetics(prev => prev ? { ...prev, ...data } : null);
  };

  const handleCompleteMission = async (missionId: string) => {
    if (!user || !profile) return;
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    const userRef = doc(db, 'users', user.uid);
    const missionRef = doc(db, `users/${user.uid}/missions`, missionId);

    try {
      const updates: any = {};
      if (mission.rewardType === 'GOLD') updates.gold = (profile.gold || 0) + mission.rewardAmount;
      if (mission.rewardType === 'XP') updates.xp = (profile.xp || 0) + mission.rewardAmount;
      if (mission.rewardType === 'CREDITS') updates.credits = (profile.credits || 0) + mission.rewardAmount;
      if (mission.rewardType === 'MATERIALS') updates.materials = (profile.materials || 0) + mission.rewardAmount;

      await updateDoc(userRef, updates);
      await updateDoc(missionRef, { completed: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/missions/${missionId}`);
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    const guildRef = doc(db, 'guilds', guildId);
    const guild = guilds.find(g => g.id === guildId);
    if (!guild) return;

    try {
      await updateDoc(userRef, { guildId });
      await updateDoc(guildRef, { memberCount: guild.memberCount + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const handleCreateGuild = async (name: string) => {
    if (!user || !profile || !name) return;
    const guildId = 'g_' + Date.now();
    const guildRef = doc(db, 'guilds', guildId);
    const userRef = doc(db, 'users', user.uid);

    const newGuild: Guild = {
      id: guildId,
      name,
      description: `Tactical network established by ${profile.displayName}`,
      memberCount: 1,
      leaderId: user.uid
    };

    try {
      await setDoc(guildRef, newGuild);
      await updateDoc(userRef, { guildId });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `guilds/${guildId}`);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#030303] font-sans selection:bg-nexus-blue/30 overflow-hidden">
      <div className="absolute inset-0 neural-grid opacity-10 pointer-events-none" />
      <div className="scanline" />
      
      {user && view !== 'LOGIN' && (
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 glass-card z-[60]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAvatarSelection(true)}
              className="w-10 h-10 rounded-full border-2 border-nexus-blue/30 overflow-hidden group relative hover:border-nexus-blue transition-all"
            >
              <img src={profile?.avatarUrl || DEFAULT_ICONS[0]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-nexus-blue/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <RefreshCw size={14} className="text-white" />
              </div>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-black uppercase text-neutral-500">{profile?.displayName}</div>
                <div className="text-[8px] font-mono text-nexus-blue tracking-tighter opacity-50">#{profile?.friendId}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-400">
                  <Coins size={10} /> {profile?.credits}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-cyan-400">
                  <Hammer size={10} /> {profile?.materials}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-rose-400">
                  <Trophy size={10} /> {profile?.arenaScrolls}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-full bg-nexus-blue/10 border border-nexus-blue/20 text-[8px] font-black text-nexus-blue uppercase tracking-widest animate-pulse">Demo_Build_0.4.2</div>
            <button onClick={() => setView('MENU')} className={`p-2 rounded-lg transition-all ${view === 'MENU' ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-neutral-500'}`}><Home size={20} /></button>
            <button onClick={() => setView('COLLECTION')} className={`p-2 rounded-lg transition-all ${view === 'COLLECTION' ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-neutral-500'}`}><Package size={20} /></button>
            <button onClick={() => setView('GACHA')} className={`p-2 rounded-lg transition-all ${view === 'GACHA' ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-neutral-500'}`}><Sparkles size={20} /></button>
            <button onClick={() => setView('ARENA')} className={`p-2 rounded-lg transition-all ${view === 'ARENA' ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-neutral-500'}`}><Trophy size={20} /></button>
            <button onClick={() => setView('STORE')} className={`p-2 rounded-lg transition-all ${view === 'STORE' ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-neutral-500'}`}><ShoppingBag size={20} /></button>
            <button onClick={() => signOut(auth)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 ml-4"><LogOut size={20} /></button>
          </div>
        </div>
      )}

      {view === 'LOGIN' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-12 rounded-[4rem] border-white/5 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-col items-center gap-12">
               <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <h1 className="text-8xl font-display font-black tracking-tighter italic bg-gradient-to-br from-white via-white to-zinc-800 bg-clip-text text-transparent mb-2">NEURAL</h1>
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-nexus-blue/50" />
                  <span className="text-[10px] font-mono tracking-[0.5em] text-nexus-blue uppercase font-bold">Protocol Active</span>
                  <span className="h-px w-8 bg-nexus-blue/50" />
                </div>
              </motion.div>

              <div className="w-full space-y-4">
                <button 
                  onClick={async () => {
                    setAuthLoading(true);
                    await signInWithGoogle();
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className={`w-full h-16 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${authLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-nexus-blue hover:text-white'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-nexus-blue to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-3">
                    {authLoading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <LogIn size={18} />}
                    {authLoading ? 'Synchronizing...' : 'Establish Uplink'}
                  </span>
                </button>

                <button 
                  onClick={async () => {
                    setAuthLoading(true);
                    await signInGuest();
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className={`w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${authLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                >
                  {authLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {authLoading ? 'INITIALIZING...' : 'Initialize as Guest'}
                </button>
              </div>

              <div className="w-full flex flex-col gap-6">
                <div className="h-px w-full bg-white/5" />
                <button 
                  onClick={activateAdminMode}
                  className="w-full py-2 text-[8px] text-zinc-600 font-mono font-bold tracking-[0.4em] hover:text-nexus-red transition-colors uppercase"
                >
                  [ Access System Source ]
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {user && profile && (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden">
          {view !== 'BATTLE' && <TopBar profile={profile} onLogout={() => signOut(auth)} />}
          
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {view === 'MENU' && (
              <div className="flex-1 flex flex-col p-6 sm:p-12 gap-12 overflow-y-auto relative z-10 custom-scrollbar">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                  <div className="flex-1 w-full space-y-12">
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="relative"
                    >
                      <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-1 h-24 bg-nexus-blue rounded-full blur-sm" />
                      <h2 className="text-8xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                        NEXUS <span className="text-nexus-blue">UPLINK</span>
                      </h2>
                      <div className="flex items-center gap-6">
                        <p className="text-nexus-blue font-mono text-[11px] uppercase tracking-[0.5em] flex items-center gap-3">
                          <Activity size={12} className="animate-pulse" /> Signal: Optimal
                        </p>
                        <div className="h-px flex-1 bg-gradient-to-r from-nexus-blue/50 to-transparent" />
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <MenuCard icon={<Sword />} title="Tactical Simulation" desc="Combat exercises vs AI" onClick={startBattle} color="blue" />
                      <MenuCard icon={<Trophy />} title="Arena Nodes" desc="Synchronous PvP combat" onClick={() => setView('ARENA')} color="rose" />
                      <MenuCard icon={<Package />} title="Repository" desc="Neural unit management" onClick={() => setView('COLLECTION')} color="indigo" />
                      <MenuCard icon={<Sparkles />} title="Gacha Uplink" desc="Acquire prototype nodes" onClick={() => setView('GACHA')} color="cyan" />
                      <MenuCard icon={<Users />} title="Guild Network" desc="Cluster coordinate collective" onClick={() => setView('GUILDS')} color="emerald" />
                      <MenuCard icon={<ShoppingBag />} title="Nano-Shop" desc="Acquire essential alloys" onClick={() => setView('STORE')} color="amber" />
                    </div>
                  </div>

                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full lg:w-80 space-y-6"
                  >
                    <div className="glass-card p-6 rounded-3xl border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Neural Feed</h3>
                        <div className="w-1.5 h-1.5 rounded-full bg-nexus-blue animate-ping" />
                      </div>
                      <div className="space-y-4">
                        {[
                          { date: '04.30', msg: 'Protocol 0.4.2 deployed. New "Nexus God" node added to archives.' },
                          { date: '04.28', msg: 'Sector 4 containment breach resolved. 500 Credits awarded to all pilots.' },
                          { date: '04.25', msg: 'Global Arena rankings reset in 48 hours. Prepare for recalibration.' }
                        ].map((news, i) => (
                          <div key={i} className="group cursor-default">
                             <div className="text-[10px] font-mono text-nexus-blue mb-1">{news.date}</div>
                             <div className="text-[11px] text-zinc-400 group-hover:text-white transition-colors">{news.msg}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div onClick={() => setView('BATTLEPASS')} className="glass-card p-6 rounded-3xl border-white/5 bg-gradient-to-br from-nexus-purple/10 to-transparent cursor-pointer hover:border-nexus-purple/30 transition-all group">
                       <div className="flex items-center justify-between mb-1">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-nexus-purple">Vanguard Pass</h3>
                          <span className="text-[10px] font-mono text-zinc-500">LVL {profile.battlePassLevel}</span>
                       </div>
                       <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden mt-2 mb-4">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(profile.battlePassXp || 0) / 1000 * 100}%` }} className="h-full bg-nexus-purple group-hover:shadow-[0_0_10px_#a855f7] transition-all" />
                       </div>
                       <div className="text-[10px] text-zinc-500 font-mono uppercase text-right">Unlock Tier {profile.battlePassLevel + 1}</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {view === 'COLLECTION' && (
              <CollectionArea ownedCards={ownedCards} materials={profile.materials} onUpgrade={handleUpgrade} onDetail={setSelectedCardDetail} onAesthetic={setSelectedCardAesthetics} onBack={() => setView('MENU')} />
            )}

            {view === 'ARENA' && (
              <OnlineBattleArea profile={profile} onCombat={handleCombatResult} />
            )}

            {view === 'BATTLEPASS' && (
              <BattlePassArea profile={profile} onClaim={handleClaimBPReward} onBack={() => setView('MENU')} />
            )}

            {view === 'GUILDS' && (
              <GuildArea guilds={guilds} profile={profile} onJoin={handleJoinGuild} onCreate={handleCreateGuild} onBack={() => setView('MENU')} />
            )}

            {view === 'MISSIONS' && (
              <MissionArea missions={missions} onComplete={handleCompleteMission} onBack={() => setView('MENU')} />
            )}

            {view === 'GACHA' && (
              <GachaArea credits={profile.credits} arenaScrolls={profile.arenaScrolls} onOpen={handleOpenPack} onDetail={setSelectedCardDetail} onBack={() => setView('MENU')} />
            )}

            {view === 'STORE' && (
              <StoreArea 
                credits={profile.credits} 
                gold={profile.gold || 0} 
                materials={profile.materials} 
                onBuy={handleBuy} 
                storeIcons={profile.storeIcons || []}
                onBuyIcon={handleBuyIcon}
                onBack={() => setView('MENU')}
              />
            )}

            {view === 'BATTLE' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 glass-card">
            <div className="flex items-center gap-4">
              <Cpu className="text-blue-500 animate-pulse" size={20} />
              <div>
                <div className="text-[10px] font-black uppercase text-neutral-500">Ally Core</div>
                <div className="h-1.5 w-24 sm:w-32 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div animate={{ width: `${playerHp}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_#00f2ff]" />
                </div>
              </div>
            </div>

            <div className={`px-2 py-1 rounded-lg border flex items-center gap-2 ${turn === 'PLAYER' ? 'border-blue-500/50 text-blue-400' : 'border-red-500/50 text-red-400'}`}>
              <span className="text-[8px] font-black uppercase tracking-widest">{turn === 'PLAYER' ? 'Ally Phase' : 'Enemy Phase'}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-neutral-500">Enemy Core</div>
                <div className="h-1.5 w-24 sm:w-32 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div animate={{ width: `${enemyHp}%` }} className="h-full bg-red-500 shadow-[0_0_100px_#ff0055] float-right" />
                </div>
              </div>
              <Activity className="text-red-500" size={20} />
            </div>
          </div>

          <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
            <div ref={containerRef} className="flex-1 perspective-2000 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none" />
              <motion.div 
                layout
                className="board-3d-container origin-center"
                style={{ scale: boardScale, transform: `translateZ(0)` }}
              >
                <div className="board-3d relative p-4 bg-black/40 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-3xl shrink-0 overflow-hidden" 
                     style={{ width: BOARD_WIDTH * 80 + (BOARD_WIDTH - 1) * 8 + 32, height: BOARD_HEIGHT * 80 + (BOARD_HEIGHT - 1) * 8 + 32 }}>
                  
                  {/* Digital Grid Underlay */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,242,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  
                  {/* Scanning Line */}
                  <motion.div 
                    animate={{ top: ['0%', '100%'] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-nexus-blue/20 blur-sm pointer-events-none z-0" 
                  />

                  {/* Grid Cells */}
                  <div className="absolute inset-4 grid grid-cols-8 grid-rows-6 gap-2">
                    {board.map((row, y) => row.map((_, x) => {
                      const isNexus = (x === 0 && (y === 2 || y === 3)) || (x === 7 && (y === 2 || y === 3));
                      const isP1Nexus = x === 0 && (y === 2 || y === 3);
                      return (
                        <div 
                          key={`cell-${x}-${y}`} 
                          onClick={() => handleCellClick(x, y)}
                          className={`w-20 h-20 relative rounded-xl border transition-all duration-300 group cursor-pointer ${
                            isNexus 
                              ? isP1Nexus 
                                ? 'bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                : 'bg-red-500/20 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          } ${selectedCell?.x === x && selectedCell?.y === y ? 'ring-2 ring-blue-400 bg-blue-500/20 z-20 neon-glow-blue' : ''}`}
                        >
                          {isNexus && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                              <Zap size={32} className={isP1Nexus ? 'text-blue-400 animate-pulse' : 'text-red-400 animate-pulse'} />
                            </div>
                          )}
                        </div>
                      );
                    }))}
                  </div>

                  {/* Units Layer */}
                  <div className="absolute inset-4 pointer-events-none">
                    <AnimatePresence>
                      {board.flat().filter(Boolean).map((cell: any) => (
                        <motion.div
                          key={cell.id}
                          layout
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            x: cell.x * 88, 
                            y: cell.y * 88,
                            zIndex: cell.isAttacking ? 50 : 10,
                            rotate: cell.isAttacking ? (cell.team === 'PLAYER' ? 15 : -15) : 0,
                            scaleX: cell.isAttacking ? 1.2 : 1,
                            scaleY: cell.isAttacking ? 1.2 : 1,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 250, 
                            damping: 25,
                            layout: { duration: 0.3 }
                          }}
                          className={`absolute w-20 h-20 p-1 pointer-events-none ${cell.lastHit && Date.now() - cell.lastHit < 500 ? 'damage-shiver' : ''}`}
                        >
                          <div className={`relative w-full h-full rounded-xl overflow-hidden shadow-xl transition-all ${
                            cell.team === 'PLAYER' 
                              ? `${BORDER_DATA.find(b => b.id === cell.borderId)?.style || 'border-2 border-blue-500 neon-glow-blue'} ${BACKGROUND_DATA.find(bg => bg.id === cell.backgroundId)?.style || 'bg-neutral-900'}`
                              : 'border-2 border-red-500 bg-neutral-900 neon-glow-red'
                          }`}>
                            {cell.lastHit && Date.now() - cell.lastHit < 500 && (
                              <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} className="absolute inset-0 bg-white/40 z-20" />
                            )}
                            <img src={cell.image} className="w-full h-full object-cover brightness-75" referrerPolicy="no-referrer" />
                            
                            {cell.ability && (
                              <div className="absolute top-2.5 right-1 px-1 py-0.5 rounded bg-black/80 border border-nexus-blue/30 text-nexus-blue text-[5px] font-black uppercase">
                                {cell.ability.name}
                              </div>
                            )}
                            
                            {/* Health Bar */}
                            <div className="absolute top-1 inset-x-1 h-1 bg-black/50 rounded-full overflow-hidden border border-white/10">
                              <motion.div 
                                initial={{ width: '100%' }}
                                animate={{ width: `${(cell.hp / cell.maxHp) * 100}%` }}
                                className={`h-full ${cell.team === 'PLAYER' ? 'bg-blue-500' : 'bg-red-500'}`}
                              />
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 flex justify-between items-center text-[8px] font-black">
                              <span className="text-white/50">{getArchetypeIcon(cell.type)}</span>
                              <span className={cell.lastHit && Date.now() - cell.lastHit < 500 ? 'text-red-500 scale-125 transition-transform' : ''}>{cell.hp}</span>
                            </div>

                            {/* Damage Numbers */}
                            <AnimatePresence>
                              {cell.lastHit && Date.now() - cell.lastHit < 800 && (
                                <motion.div
                                  initial={{ y: 0, opacity: 1, scale: 1 }}
                                  animate={{ y: -40, opacity: 0, scale: 1.5 }}
                                  className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-xl italic pointer-events-none z-50 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]"
                                >
                                  HIT
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="hidden lg:flex w-64 bg-black/40 border-l border-white/10 p-6 flex-col gap-6 backdrop-blur-xl">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Battle Intelligence</div>
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                {log.map((msg, i) => (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-[11px] text-zinc-400 pl-3 border-l border-white/10 leading-relaxed">{msg}</motion.div>
                ))}
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                 <Trophy className="mx-auto text-blue-500 mb-2" size={20} />
                 <div className="text-[10px] font-black uppercase text-neutral-500">Sector Control</div>
                 <div className="text-xl font-serif italic">Dominant</div>
              </div>
            </div>
          </div>

          <div className="h-44 sm:h-52 lg:h-64 glass-card border-t border-white/10 p-4 lg:p-8 flex flex-col lg:flex-row gap-6 relative z-50">
            <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-start lg:w-48 border-r border-white/5 pr-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Energy</div>
                <div className="flex items-center gap-2 text-2xl font-black text-blue-400">
                  <Zap size={20} className="fill-current" />
                  <span>{playerMana}</span>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={endTurn}
                disabled={turn !== 'PLAYER'}
                className="px-4 py-2 sm:px-6 sm:py-3 lg:w-full bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white disabled:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Sync</span>
                <RefreshCw size={14} className={turn === 'ENEMY' ? 'animate-spin' : ''} />
              </motion.button>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar relative">
              <div className="flex-shrink-0 w-24 h-full border-2 border-white/5 bg-neutral-900 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50">
                 <Package size={32} />
                 <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Archives</div>
              </div>
              <AnimatePresence>
                {hand.map((card, idx) => (
                  <motion.div
                    layout
                    key={`${card.id}-${idx}`}
                    initial={{ x: -100, opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    onClick={() => setSelectedCardDetail(card)}
                    className={`flex-shrink-0 w-28 sm:w-32 lg:w-40 relative group h-full rounded-2xl overflow-hidden border cursor-pointer transition-all ${playerMana >= card.cost ? (BORDER_DATA.find(b => b.id === ownedCards.find(oc => oc.cardId === card.id)?.borderId)?.style || 'border-white/20 hover:border-blue-400') : 'opacity-40 grayscale cursor-not-allowed border-white/5'}`}
                  >
                    <img src={SKIN_DATA.find(s => s.id === ownedCards.find(oc => oc.cardId === card.id)?.activeSkinId)?.image || card.image} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    <div className="relative h-full p-2 sm:p-3 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="p-1 bg-black/50 rounded-lg border border-white/10">{getArchetypeIcon(card.type)}</div>
                        <div className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black">{card.cost}</div>
                      </div>
                      <div className="text-[10px] font-black truncate">{card.name}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      <AnimatePresence>
        {showAvatarSelection && (
          <AvatarSelectionModal 
            ownedIcons={profile?.ownedIcons || []} 
            ownedCards={ownedCards} 
            onSelect={handleUpdateAvatar} 
            onClose={() => setShowAvatarSelection(false)} 
          />
        )}
        {selectedCardAesthetics && (
          <AestheticCustomizationModal
            ownedCard={selectedCardAesthetics}
            onUpdate={handleUpdateCardAesthetics}
            onClose={() => setSelectedCardAesthetics(null)}
          />
        )}
        {selectedCardDetail && (
          <CardDetailModal 
            card={selectedCardDetail} 
            onClose={() => setSelectedCardDetail(null)} 
            onPlay={view === 'BATTLE' && turn === 'PLAYER' && playerMana >= selectedCardDetail.cost ? () => {
              const card = selectedCardDetail;
              if (card.type === 'HORDE') {
                let s = 0; for(let y=0; y<BOARD_HEIGHT && s < 2; y++) if(spawnUnit(card, 0, y, 'PLAYER')) s++;
                if(s > 0) { 
                  setPlayerMana(p => p - card.cost); 
                  setHand(h => {
                    const idx = h.findIndex(hc => hc.id === card.id);
                    if (idx !== -1) return h.filter((_, i) => i !== idx);
                    return h;
                  });
                }
              } else {
                for(let y=0; y<BOARD_HEIGHT; y++) if(spawnUnit(card, 0, y, 'PLAYER')) { 
                  setPlayerMana(p => p - card.cost); 
                  setHand(h => {
                    const idx = h.findIndex(hc => hc.id === card.id);
                    if (idx !== -1) return h.filter((_, i) => i !== idx);
                    return h;
                  });
                  break; 
                }
              }
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden"
          >
            {/* Background Kinetic Pulse */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`absolute inset-0 blur-[150px] ${gameOver === 'PLAYER' ? 'bg-blue-500' : 'bg-red-600'}`}
            />

            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative glass-card p-8 sm:p-16 rounded-[4rem] text-center max-w-xl mx-6 border-white/5 shadow-[0_0_150px_rgba(0,0,0,1)] z-10"
            >
              {/* Top Label */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500 mb-6"
              >
                Simulation Concluded
              </motion.div>

              {/* Main Title with Glitch Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className={`text-5xl sm:text-7xl font-serif italic mb-8 leading-none tracking-tighter ${gameOver === 'PLAYER' ? 'text-blue-400' : 'text-red-500'}`}>
                  {gameOver === 'PLAYER' ? 'NEXUS WON' : 'LINK FAILED'}
                </div>
                {/* Visual aberration shadow */}
                <motion.div 
                  animate={{ x: [-2, 2, -2], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
                  className={`absolute inset-0 text-5xl sm:text-7xl font-serif italic leading-none tracking-tighter -z-10 blur-sm ${gameOver === 'PLAYER' ? 'text-cyan-400' : 'text-orange-600'}`}
                >
                  {gameOver === 'PLAYER' ? 'NEXUS WON' : 'LINK FAILED'}
                </motion.div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-zinc-500 text-sm sm:text-base mb-12 leading-relaxed font-medium px-4"
              >
                {gameOver === 'PLAYER' 
                  ? 'Absolute dominance achieved. Sector 7B has been successfully archived and repurposed.' 
                  : 'Critical tactical failure. Nexus link compromised. Tactical grid collapsing in 3... 2...'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button 
                  onClick={() => { setGameOver(null); setView('MENU'); setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))); }}
                  className="group relative w-full py-5 rounded-3xl bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] overflow-hidden transition-all hover:bg-nexus-blue hover:text-white"
                >
                  <span className="relative z-10">Return to Nexus Command</span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
                  />
                </button>
              </motion.div>

              {/* Status Code */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="mt-8 font-mono text-[8px] text-neutral-500 uppercase tracking-widest"
              >
                Ref: {Math.random().toString(36).substring(7).toUpperCase()} // Latency 12ms // Core: Active
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
