import { create } from "zustand";

export type GamePhase = "menu" | "overworld" | "battle";

interface RPGState {
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;
}

export const useRPG = create<RPGState>((set) => ({
  gamePhase: "menu",
  setGamePhase: (phase) => set({ gamePhase: phase }),
}));
