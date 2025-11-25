import { create } from "zustand";

export type GamePhase = "intro" | "naming" | "menu" | "overworld" | "battle";

interface RPGState {
  gamePhase: GamePhase;
  playerName: string;
  setGamePhase: (phase: GamePhase) => void;
  setPlayerName: (name: string) => void;
}

export const useRPG = create<RPGState>((set) => ({
  gamePhase: "intro",
  playerName: "",
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerName: (name) => set({ playerName: name }),
}));
