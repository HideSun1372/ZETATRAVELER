import { create } from "zustand";
import { PLANET_DATA } from "../data/planets";

export type GamePhase = "vessel" | "intro" | "menu" | "hub" | "planet" | "battle" | "gameover";
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
  planetId?: number;
  isBoss?: boolean;
  isSecretBoss?: boolean;
}

export type PuzzleType = "simon" | "rhythm" | "misdirection";

export interface AreaState {
  id: string;
  visited: boolean;
  enemiesDefeated: number;
  shardsCollected: number;
  keyCollected: boolean;
  loreDiscovered: string[];
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
  bossDefeated: boolean;
  secretBossDefeated: boolean;
  keysFound: number;
  keysRequired: number;
  minEnemiesRequired: number;
  puzzleType: PuzzleType;
  currentAreaId: string;
  areaStates: AreaState[];
  loreDiscovered: string[];
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
  
  hope: number;
  hopeBonus: { hp: number; def: number };
  
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
  gainHope: (amount: number) => void;
  
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
  
  collectKey: () => void;
  defeatBoss: () => void;
  defeatSecretBoss: () => void;
  canSealCore: () => boolean;
  
  changeArea: (areaId: string) => void;
  discoverLore: (loreId: string) => void;
  markAreaVisited: (areaId: string) => void;
  collectAreaShard: (areaId: string) => void;
  collectAreaKey: (areaId: string) => void;
  defeatAreaEnemy: (areaId: string) => void;
}

const getPuzzleType = (planetId: number): PuzzleType => {
  const types: PuzzleType[] = ["simon", "rhythm", "misdirection"];
  return types[planetId % 3];
};

const generatePlanets = (): Planet[] => {
  return PLANET_DATA.map((planet) => {
    const minEnemies = Math.min(10, 5 + Math.floor(planet.id / 10));
    const keysRequired = planet.id <= 10 ? 1 : planet.id <= 30 ? 2 : 3;
    const numAreas = Math.min(3 + Math.floor(planet.difficulty * 0.8), 6);
    
    const initialAreaStates: AreaState[] = [];
    for (let i = 0; i < numAreas; i++) {
      initialAreaStates.push({
        id: `${planet.id}-area-${i}`,
        visited: false,
        enemiesDefeated: 0,
        shardsCollected: 0,
        keyCollected: false,
        loreDiscovered: [],
      });
    }
    
    return {
      id: planet.id,
      name: planet.name,
      shardsCollected: 0,
      totalShards: Math.floor(75 / 50) + (planet.id <= 25 ? 1 : 0),
      coreSealed: false,
      enemiesKilled: 0,
      enemiesSpared: 0,
      allEnemiesCleared: false,
      bossDefeated: false,
      secretBossDefeated: false,
      keysFound: 0,
      keysRequired,
      minEnemiesRequired: minEnemies,
      puzzleType: getPuzzleType(planet.id),
      currentAreaId: `${planet.id}-area-0`,
      areaStates: initialAreaStates,
      loreDiscovered: [],
    };
  });
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
  
  hope: 0,
  hopeBonus: { hp: 0, def: 0 },
  
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
    const totalDef = state.def + state.hopeBonus.def;
    const actualDamage = Math.max(1, amount - totalDef);
    const newHp = Math.max(0, state.hp - actualDamage);
    set({ hp: newHp });
  },
  
  heal: (amount) => {
    const state = get();
    const totalMaxHp = state.maxHp + state.hopeBonus.hp;
    set({ hp: Math.min(totalMaxHp, state.hp + amount) });
  },
  
  gainXP: (amount) => {
    const state = get();
    if (state.level >= 100) return;
    
    let newXP = state.xp + amount;
    let currentLevel = state.level;
    let currentXPToNext = state.xpToNextLevel;
    let hpGained = 0;
    let atkGained = 0;
    let defGained = 0;
    
    while (newXP >= currentXPToNext && currentLevel < 100) {
      newXP -= currentXPToNext;
      currentLevel += 1;
      currentXPToNext = calculateXPToNextLevel(currentLevel);
      hpGained += 4;
      atkGained += 2;
      defGained += 1;
    }
    
    if (currentLevel !== state.level) {
      set({
        level: currentLevel,
        xp: currentLevel >= 100 ? 0 : newXP,
        xpToNextLevel: currentXPToNext,
        maxHp: state.maxHp + hpGained,
        hp: state.maxHp + hpGained,
        atk: state.atk + atkGained,
        def: state.def + defGained,
      });
    } else {
      set({ xp: newXP });
    }
  },
  
  levelUp: () => {
    const state = get();
    if (state.level >= 100) return;
    const newLevel = state.level + 1;
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
  
  gainHope: (amount) => {
    const state = get();
    const newHope = state.hope + amount;
    const hpBonus = Math.floor(newHope / 5) * 2;
    const defBonus = Math.floor(newHope / 3);
    const newMaxHp = 20 + state.hopeBonus.hp + (hpBonus - state.hopeBonus.hp);
    const hpGain = hpBonus - state.hopeBonus.hp;
    set({
      hope: newHope,
      hopeBonus: { hp: hpBonus, def: defBonus },
      maxHp: state.maxHp + hpGain,
      hp: Math.min(state.maxHp + hpGain, state.hp + hpGain),
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
    if (currentPlanet && get().canSealCore() && !currentPlanet.coreSealed) {
      set({
        nebuliTotal: state.nebuliTotal + 1,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId ? { ...p, coreSealed: true } : p
        ),
      });
      get().gainHope(3);
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
      const goldGain = 5 + state.currentEnemy.maxHp;
      get().gainXP(xpGain);
      set({
        totalKills: state.totalKills + 1,
        gold: state.gold + goldGain,
        defeatedEnemyIds: enemyId ? [...state.defeatedEnemyIds, enemyId] : state.defeatedEnemyIds,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId
            ? { ...p, enemiesKilled: p.enemiesKilled + 1 }
            : p
        ),
      });
    } else if (outcome === "spare" && state.currentEnemy) {
      const goldGain = 3 + Math.floor(state.currentEnemy.maxHp / 2);
      const xpGain = Math.floor((5 + state.currentEnemy.maxHp) * 0.5);
      get().gainXP(xpGain);
      set({
        totalSpares: state.totalSpares + 1,
        gold: state.gold + goldGain,
        defeatedEnemyIds: enemyId ? [...state.defeatedEnemyIds, enemyId] : state.defeatedEnemyIds,
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId
            ? { ...p, enemiesSpared: p.enemiesSpared + 1 }
            : p
        ),
      });
      get().gainHope(1);
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
    const totalEncounters = state.totalKills + state.totalSpares;
    
    if (totalEncounters === 0) {
      return;
    }
    
    if (state.totalKills === 0) {
      set({ currentRoute: "pacifist" });
    } else if (state.totalSpares === 0 && state.totalKills >= 5) {
      set({ currentRoute: "genocide" });
    } else {
      const killRatio = state.totalKills / totalEncounters;
      if (killRatio >= 0.8) {
        set({ currentRoute: "genocide" });
      } else if (killRatio <= 0.1) {
        set({ currentRoute: "pacifist" });
      } else {
        set({ currentRoute: "neutral" });
      }
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
  
  collectKey: () => {
    const state = get();
    const currentPlanet = state.planets.find((p) => p.id === state.currentPlanetId);
    if (currentPlanet && currentPlanet.keysFound < currentPlanet.keysRequired) {
      set({
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId ? { ...p, keysFound: p.keysFound + 1 } : p
        ),
      });
    }
  },
  
  defeatBoss: () => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId ? { ...p, bossDefeated: true } : p
      ),
    });
  },
  
  defeatSecretBoss: () => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId ? { ...p, secretBossDefeated: true } : p
      ),
    });
    get().gainHope(2);
  },
  
  canSealCore: () => {
    const state = get();
    const currentPlanet = state.planets.find((p) => p.id === state.currentPlanetId);
    if (!currentPlanet) return false;
    
    const totalEnemiesDealt = currentPlanet.enemiesKilled + currentPlanet.enemiesSpared;
    const hasEnoughEnemies = totalEnemiesDealt >= currentPlanet.minEnemiesRequired;
    const hasAllKeys = currentPlanet.keysFound >= currentPlanet.keysRequired;
    const bossDefeated = currentPlanet.bossDefeated;
    
    return hasEnoughEnemies && hasAllKeys && bossDefeated;
  },
  
  changeArea: (areaId) => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId
          ? { ...p, currentAreaId: areaId }
          : p
      ),
      playerPosition: { x: 10, y: 8 },
    });
    get().markAreaVisited(areaId);
  },
  
  discoverLore: (loreId) => {
    const state = get();
    const currentPlanet = state.planets.find((p) => p.id === state.currentPlanetId);
    if (currentPlanet && !currentPlanet.loreDiscovered.includes(loreId)) {
      set({
        planets: state.planets.map((p) =>
          p.id === state.currentPlanetId
            ? { ...p, loreDiscovered: [...p.loreDiscovered, loreId] }
            : p
        ),
      });
    }
  },
  
  markAreaVisited: (areaId) => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId
          ? {
              ...p,
              areaStates: p.areaStates.map((a) =>
                a.id === areaId ? { ...a, visited: true } : a
              ),
            }
          : p
      ),
    });
  },
  
  collectAreaShard: (areaId) => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId
          ? {
              ...p,
              shardsCollected: p.shardsCollected + 1,
              areaStates: p.areaStates.map((a) =>
                a.id === areaId
                  ? { ...a, shardsCollected: a.shardsCollected + 1 }
                  : a
              ),
            }
          : p
      ),
      nebuliShards: state.nebuliShards + 1,
    });
  },
  
  collectAreaKey: (areaId) => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId
          ? {
              ...p,
              keysFound: p.keysFound + 1,
              areaStates: p.areaStates.map((a) =>
                a.id === areaId ? { ...a, keyCollected: true } : a
              ),
            }
          : p
      ),
    });
  },
  
  defeatAreaEnemy: (areaId) => {
    const state = get();
    set({
      planets: state.planets.map((p) =>
        p.id === state.currentPlanetId
          ? {
              ...p,
              areaStates: p.areaStates.map((a) =>
                a.id === areaId
                  ? { ...a, enemiesDefeated: a.enemiesDefeated + 1 }
                  : a
              ),
            }
          : p
      ),
    });
  },
}));
