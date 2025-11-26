import { create } from "zustand";

export type GamePhase = "vessel" | "menu" | "hub" | "planet" | "battle" | "gameover";
export type Route = "pacifist" | "neutral" | "genocide";

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spared: boolean;
  killed: boolean;
  talkProgress: number;
  canSpare: boolean;
}

export interface Planet {
  id: number;
  name: string;
  shardsCollected: number;
  totalShards: number;
  coreSealed: boolean;
  enemiesKilled: number;
  enemiesSpared: number;
  allEnemiesCleared: boolean;
}

export interface Traveler {
  id: string;
  name: string;
  portrait: string;
  recruited: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "healing" | "weapon" | "armor" | "key";
  value: number;
  quantity: number;
}

interface RPGState {
  gamePhase: GamePhase;
  playerName: string;
  vesselName: string;
  
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  atk: number;
  def: number;
  
  gold: number;
  inventory: InventoryItem[];
  
  nebuliShards: number;
  nebuliTotal: number;
  
  currentPlanetId: number;
  planets: Planet[];
  
  totalKills: number;
  totalSpares: number;
  currentRoute: Route;
  
  travelers: Traveler[];
  lakineDialogueIndex: number;
  
  currentEnemy: Enemy | null;
  battleTurn: "player" | "enemy";
  battlePhase: "menu" | "fight" | "act" | "item" | "defend" | "mercy" | "enemy_attack" | "victory" | "defeat";
  
  defeatedEnemyIds: string[];
  lastBattlePlanetId: number;
  
  saveSlots: { slot: number; data: string | null; timestamp: string | null }[];
  
  setGamePhase: (phase: GamePhase) => void;
  setPlayerName: (name: string) => void;
  setVesselName: (name: string) => void;
  
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  gainXP: (amount: number) => void;
  levelUp: () => void;
  
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string) => void;
  useItem: (itemId: string) => void;
  
  collectShard: () => void;
  sealCore: () => void;
  
  startBattle: (enemy: Enemy) => void;
  endBattle: (outcome: "victory" | "defeat" | "spare") => void;
  setBattlePhase: (phase: RPGState["battlePhase"]) => void;
  damageEnemy: (amount: number) => void;
  progressTalk: () => void;
  spareEnemy: () => void;
  
  updateRoute: () => void;
  
  recruitTraveler: (travelerId: string) => void;
  advanceLakineDialogue: () => void;
  
  saveGame: (slot: number) => void;
  loadGame: (slot: number) => void;
  
  travelToPlanet: (planetId: number) => void;
  returnToHub: () => void;
  
  playerPosition: { x: number; y: number };
  setPlayerPosition: (pos: { x: number; y: number }) => void;
}

const generatePlanets = (): Planet[] => {
  const planetNames = [
    "Verdantis", "Crystallum", "Obsidian Prime", "Nebula's Edge", "Frostveil",
    "Ember Plains", "Aquanis", "Shadow Reach", "Luminos", "Dustworld",
    "Thornspire", "Misthollow", "Ironclad", "Voidrift", "Starfall",
  ];
  
  return planetNames.map((name, index) => ({
    id: index + 1,
    name,
    shardsCollected: 0,
    totalShards: 25,
    coreSealed: false,
    enemiesKilled: 0,
    enemiesSpared: 0,
    allEnemiesCleared: false,
  }));
};

const initialTravelers: Traveler[] = [
  { id: "zara", name: "ZARA", portrait: "zara", recruited: false },
  { id: "korin", name: "KORIN", portrait: "korin", recruited: false },
  { id: "mira", name: "MIRA", portrait: "mira", recruited: false },
];

const calculateXPToNextLevel = (level: number): number => {
  return Math.floor(10 * Math.pow(level, 1.5));
};

export const useRPG = create<RPGState>((set, get) => ({
  gamePhase: "vessel",
  playerName: "",
  vesselName: "",
  
  hp: 20,
  maxHp: 20,
  level: 1,
  xp: 0,
  xpToNextLevel: 10,
  atk: 10,
  def: 5,
  
  gold: 0,
  inventory: [
    { id: "bandage", name: "BANDAGE", description: "Heals 10 HP", type: "healing", value: 10, quantity: 3 },
  ],
  
  nebuliShards: 0,
  nebuliTotal: 0,
  
  currentPlanetId: 0,
  planets: generatePlanets(),
  
  totalKills: 0,
  totalSpares: 0,
  currentRoute: "neutral",
  
  travelers: initialTravelers,
  lakineDialogueIndex: 0,
  
  currentEnemy: null,
  battleTurn: "player",
  battlePhase: "menu",
  
  defeatedEnemyIds: [],
  lastBattlePlanetId: 0,
  
  saveSlots: [
    { slot: 1, data: null, timestamp: null },
    { slot: 2, data: null, timestamp: null },
    { slot: 3, data: null, timestamp: null },
  ],
  
  playerPosition: { x: 0, y: 0 },
  
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerName: (name) => set({ playerName: name }),
  setVesselName: (name) => set({ vesselName: name }),
  
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  
  takeDamage: (amount) => {
    const state = get();
    const actualDamage = Math.max(1, amount - state.def);
    const newHp = Math.max(0, state.hp - actualDamage);
    set({ hp: newHp });
  },
  
  heal: (amount) => {
    const state = get();
    set({ hp: Math.min(state.maxHp, state.hp + amount) });
  },
  
  gainXP: (amount) => {
    const state = get();
    const newXP = state.xp + amount;
    if (newXP >= state.xpToNextLevel) {
      get().levelUp();
    } else {
      set({ xp: newXP });
    }
  },
  
  levelUp: () => {
    const state = get();
    const newLevel = Math.min(100, state.level + 1);
    set({
      level: newLevel,
      xp: 0,
      xpToNextLevel: calculateXPToNextLevel(newLevel),
      maxHp: state.maxHp + 4,
      hp: state.maxHp + 4,
      atk: state.atk + 2,
      def: state.def + 1,
    });
  },
  
  addItem: (item) => {
    const state = get();
    const existingItem = state.inventory.find((i) => i.id === item.id);
    if (existingItem) {
      set({
        inventory: state.inventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ inventory: [...state.inventory, item] });
    }
  },
  
  removeItem: (itemId) => {
    const state = get();
    set({
      inventory: state.inventory
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    });
  },
  
  useItem: (itemId) => {
    const state = get();
    const item = state.inventory.find((i) => i.id === itemId);
    if (item && item.type === "healing") {
      get().heal(item.value);
      get().removeItem(itemId);
    }
  },
  
  collectShard: () => {
    const state = get();
    const currentPlanet = state.planets.find((p) => p.id === state.currentPlanetId);
    if (currentPlanet && currentPlanet.shardsCollected < currentPlanet.totalShards) {
      set({
        nebuliShards: state.nebuliShards + 1,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId
            ? { ...p, shardsCollected: p.shardsCollected + 1 }
            : p
        ),
      });
    }
  },
  
  sealCore: () => {
    const state = get();
    const currentPlanet = state.planets.find((p) => p.id === state.currentPlanetId);
    if (currentPlanet && currentPlanet.allEnemiesCleared && !currentPlanet.coreSealed) {
      set({
        nebuliTotal: state.nebuliTotal + 1,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId ? { ...p, coreSealed: true } : p
        ),
      });
    }
  },
  
  startBattle: (enemy) => {
    const state = get();
    set({
      gamePhase: "battle",
      currentEnemy: enemy,
      battleTurn: "player",
      battlePhase: "menu",
      lastBattlePlanetId: state.currentPlanetId,
    });
  },
  
  endBattle: (outcome) => {
    const state = get();
    const enemyId = state.currentEnemy?.id;
    
    if (outcome === "defeat") {
      set({
        gamePhase: "gameover",
        currentEnemy: null,
        battlePhase: "menu",
      });
      return;
    }
    
    if (outcome === "victory" && state.currentEnemy) {
      const xpGain = 5 + state.currentEnemy.maxHp;
      get().gainXP(xpGain);
      set({
        totalKills: state.totalKills + 1,
        defeatedEnemyIds: enemyId ? [...state.defeatedEnemyIds, enemyId] : state.defeatedEnemyIds,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId
            ? { ...p, enemiesKilled: p.enemiesKilled + 1 }
            : p
        ),
      });
    } else if (outcome === "spare" && state.currentEnemy) {
      set({
        totalSpares: state.totalSpares + 1,
        defeatedEnemyIds: enemyId ? [...state.defeatedEnemyIds, enemyId] : state.defeatedEnemyIds,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId
            ? { ...p, enemiesSpared: p.enemiesSpared + 1 }
            : p
        ),
      });
    }
    
    get().updateRoute();
    
    set({
      gamePhase: state.currentPlanetId === 0 ? "hub" : "planet",
      currentEnemy: null,
      battlePhase: "menu",
    });
  },
  
  setBattlePhase: (phase) => set({ battlePhase: phase }),
  
  damageEnemy: (amount) => {
    const state = get();
    if (state.currentEnemy) {
      const actualDamage = Math.max(1, amount + state.atk - state.currentEnemy.def);
      const newHp = Math.max(0, state.currentEnemy.hp - actualDamage);
      set({
        currentEnemy: { ...state.currentEnemy, hp: newHp },
      });
    }
  },
  
  progressTalk: () => {
    const state = get();
    if (state.currentEnemy) {
      const newProgress = state.currentEnemy.talkProgress + 1;
      const canSpare = newProgress >= 3;
      set({
        currentEnemy: {
          ...state.currentEnemy,
          talkProgress: newProgress,
          canSpare,
        },
      });
    }
  },
  
  spareEnemy: () => {
    const state = get();
    if (state.currentEnemy && state.currentEnemy.canSpare) {
      set({
        currentEnemy: { ...state.currentEnemy, spared: true },
      });
      get().endBattle("spare");
    }
  },
  
  updateRoute: () => {
    const state = get();
    if (state.totalKills === 0 && state.level === 1) {
      set({ currentRoute: "pacifist" });
    } else if (state.totalKills >= state.totalSpares * 2) {
      set({ currentRoute: "genocide" });
    } else {
      set({ currentRoute: "neutral" });
    }
  },
  
  recruitTraveler: (travelerId) => {
    const state = get();
    set({
      travelers: state.travelers.map((t) =>
        t.id === travelerId ? { ...t, recruited: true } : t
      ),
    });
  },
  
  advanceLakineDialogue: () => {
    const state = get();
    set({ lakineDialogueIndex: state.lakineDialogueIndex + 1 });
  },
  
  saveGame: (slot) => {
    const state = get();
    const saveData = JSON.stringify({
      playerName: state.playerName,
      vesselName: state.vesselName,
      hp: state.hp,
      maxHp: state.maxHp,
      level: state.level,
      xp: state.xp,
      atk: state.atk,
      def: state.def,
      gold: state.gold,
      inventory: state.inventory,
      nebuliShards: state.nebuliShards,
      nebuliTotal: state.nebuliTotal,
      currentPlanetId: state.currentPlanetId,
      planets: state.planets,
      totalKills: state.totalKills,
      totalSpares: state.totalSpares,
      currentRoute: state.currentRoute,
      travelers: state.travelers,
      lakineDialogueIndex: state.lakineDialogueIndex,
      playerPosition: state.playerPosition,
    });
    
    const timestamp = new Date().toISOString();
    localStorage.setItem(`zetatraveler_save_${slot}`, saveData);
    
    set({
      saveSlots: state.saveSlots.map((s) =>
        s.slot === slot ? { ...s, data: saveData, timestamp } : s
      ),
    });
  },
  
  loadGame: (slot) => {
    const saveData = localStorage.getItem(`zetatraveler_save_${slot}`);
    if (saveData) {
      const data = JSON.parse(saveData);
      set({
        ...data,
        gamePhase: "hub",
      });
    }
  },
  
  travelToPlanet: (planetId) => {
    set({
      currentPlanetId: planetId,
      gamePhase: "planet",
      playerPosition: { x: 0, y: 0 },
    });
  },
  
  returnToHub: () => {
    set({
      currentPlanetId: 0,
      gamePhase: "hub",
      playerPosition: { x: 0, y: 0 },
    });
  },
}));
