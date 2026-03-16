import { describe, it, expect } from "vitest";
import { parseSaveData, saveDataSchema } from "./saveSchema";

const minimalValidSave = {
  playerName: "Aiden",
  vesselName: "Aiden",
  hp: 20,
  maxHp: 20,
  level: 1,
  xp: 0,
  atk: 10,
  def: 5,
  gold: 0,
  inventory: [
    { id: "bandage", name: "BANDAGE", description: "Heals 10 HP", type: "healing" as const, value: 10, quantity: 3 },
  ],
  nebuliShards: 0,
  nebuliTotal: 0,
  currentPlanetId: 0,
  planets: [
    {
      id: 1,
      name: "Test",
      shardsCollected: 0,
      totalShards: 1,
      coreSealed: false,
      enemiesKilled: 0,
      enemiesSpared: 0,
      allEnemiesCleared: false,
      bossDefeated: false,
      secretBossDefeated: false,
      keysFound: 0,
      keysRequired: 1,
      minEnemiesRequired: 1,
      puzzleType: "simon" as const,
      currentAreaId: "1-area-0",
      areaStates: [
        { id: "1-area-0", visited: false, enemiesDefeated: 0, shardsCollected: 0, keyCollected: false, loreDiscovered: [] },
      ],
      loreDiscovered: [],
    },
  ],
  totalKills: 0,
  totalSpares: 0,
  currentRoute: "neutral" as const,
  travelers: [
    { id: "zara", name: "ZARA", portrait: "zara", recruited: false },
  ],
  lakineDialogueIndex: 0,
  playerPosition: { x: 0, y: 0 },
};

describe("parseSaveData", () => {
  it("accepts valid save JSON", () => {
    const result = parseSaveData(JSON.stringify(minimalValidSave));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.playerName).toBe("Aiden");
      expect(result.data.level).toBe(1);
      expect(result.data.planets).toHaveLength(1);
    }
  });

  it("rejects invalid JSON", () => {
    const result = parseSaveData("not json {");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("JSON");
    }
  });

  it("rejects empty string", () => {
    const result = parseSaveData("");
    expect(result.ok).toBe(false);
  });

  it("rejects object with missing required fields", () => {
    const result = parseSaveData(JSON.stringify({ playerName: "Aiden" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid currentRoute", () => {
    const invalid = { ...minimalValidSave, currentRoute: "evil" };
    const result = parseSaveData(JSON.stringify(invalid));
    expect(result.ok).toBe(false);
  });

  it("rejects invalid inventory item type", () => {
    const invalid = {
      ...minimalValidSave,
      inventory: [{ ...minimalValidSave.inventory[0], type: "invalid" }],
    };
    const result = parseSaveData(JSON.stringify(invalid));
    expect(result.ok).toBe(false);
  });

  it("rejects negative hp", () => {
    const invalid = { ...minimalValidSave, hp: -1 };
    const result = parseSaveData(JSON.stringify(invalid));
    expect(result.ok).toBe(false);
  });
});

describe("saveDataSchema", () => {
  it("accepts minimal valid save via schema directly", () => {
    const parsed = saveDataSchema.safeParse(minimalValidSave);
    expect(parsed.success).toBe(true);
  });
});
