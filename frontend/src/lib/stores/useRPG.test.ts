import { describe, it, expect, beforeEach, vi } from "vitest";
import { useRPG } from "./useRPG";

const TEST_SLOT = 99;

function makeLocalStorageMock() {
  const storage: Record<string, string> = {};
  return {
    storage,
    mock: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    },
  };
}

describe("useRPG", () => {
  beforeEach(() => {
    const { mock } = makeLocalStorageMock();
    vi.stubGlobal("localStorage", mock);
  });

  describe("loadGame", () => {
    it("returns error when slot has no data", () => {
      const result = useRPG.getState().loadGame(TEST_SLOT);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("No save data");
      }
    });

    it("returns error when save data is invalid JSON", () => {
      (globalThis.localStorage as Storage).setItem(`zetatraveler_save_${TEST_SLOT}`, "not json {");
      const result = useRPG.getState().loadGame(TEST_SLOT);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeDefined();
      }
    });

    it("returns error when save data fails schema validation", () => {
      (globalThis.localStorage as Storage).setItem(
        `zetatraveler_save_${TEST_SLOT}`,
        JSON.stringify({ invalid: "shape" })
      );
      const result = useRPG.getState().loadGame(TEST_SLOT);
      expect(result.ok).toBe(false);
    });

    it("restores state after saveGame round-trip", () => {
      const state = useRPG.getState();
      state.setPlayerName("TestPlayer");
      state.setVesselName("TestVessel");
      state.saveGame(TEST_SLOT);

      state.setPlayerName("Other");
      state.setVesselName("Other");
      const result = state.loadGame(TEST_SLOT);
      expect(result.ok).toBe(true);

      const after = useRPG.getState();
      expect(after.playerName).toBe("TestPlayer");
      expect(after.vesselName).toBe("TestVessel");
      expect(after.gamePhase).toBe("hub");
    });
  });

  describe("saveGame", () => {
    it("writes timestamp to localStorage so slot shows date in menu", () => {
      useRPG.getState().saveGame(TEST_SLOT);
      const timestamp = (globalThis.localStorage as Storage).getItem(
        `zetatraveler_save_${TEST_SLOT}_timestamp`
      );
      expect(timestamp).toBeTruthy();
      expect(() => new Date(timestamp!).toISOString()).not.toThrow();
    });
  });

  describe("takeDamage", () => {
    it("reduces hp by at least 1 when damage exceeds def", () => {
      useRPG.setState({ hp: 20, def: 0 });
      useRPG.getState().takeDamage(10);
      expect(useRPG.getState().hp).toBe(10);
    });

    it("applies minimum 1 damage when amount is positive", () => {
      useRPG.setState({ hp: 20, def: 100 });
      useRPG.getState().takeDamage(5);
      expect(useRPG.getState().hp).toBe(19);
    });
  });

  describe("gainXP", () => {
    it("increases xp and levels up when exceeding xpToNextLevel", () => {
      useRPG.setState({ level: 1, xp: 0, xpToNextLevel: 10, maxHp: 20, hp: 20, atk: 10, def: 5 });
      useRPG.getState().gainXP(10);
      const state = useRPG.getState();
      expect(state.level).toBe(2);
      expect(state.maxHp).toBeGreaterThan(20);
      expect(state.atk).toBeGreaterThan(10);
    });
  });

  describe("updateRoute", () => {
    it("sets pacifist when no kills", () => {
      useRPG.setState({ totalKills: 0, totalSpares: 5 });
      useRPG.getState().updateRoute();
      expect(useRPG.getState().currentRoute).toBe("pacifist");
    });

    it("sets genocide when only kills and at least 5", () => {
      useRPG.setState({ totalKills: 5, totalSpares: 0 });
      useRPG.getState().updateRoute();
      expect(useRPG.getState().currentRoute).toBe("genocide");
    });
  });

  describe("canSealCore", () => {
    it("returns false when current planet has boss not defeated", () => {
      const state = useRPG.getState();
      const planets = state.planets.map((p) =>
        p.id === 1
          ? { ...p, bossDefeated: false, keysFound: 1, keysRequired: 1, enemiesKilled: 5, enemiesSpared: 0, minEnemiesRequired: 5 }
          : p
      );
      useRPG.setState({ currentPlanetId: 1, planets });
      expect(useRPG.getState().canSealCore()).toBe(false);
    });

    it("returns true when planet has enough enemies, keys, and boss defeated", () => {
      const state = useRPG.getState();
      const planets = state.planets.map((p) =>
        p.id === 1
          ? { ...p, bossDefeated: true, keysFound: 1, keysRequired: 1, enemiesKilled: 5, enemiesSpared: 0, minEnemiesRequired: 5 }
          : p
      );
      useRPG.setState({ currentPlanetId: 1, planets });
      expect(useRPG.getState().canSealCore()).toBe(true);
    });
  });
});
