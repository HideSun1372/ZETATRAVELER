import { create } from "zustand";

export type GamePhase = "intro" | "menu" | "overworld" | "battle";

interface RPGState {
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;
}

export const useRPG = create<RPGState>((set) => ({
  gamePhase: "intro",
  setGamePhase: (phase) => set({ gamePhase: phase }),
}));
