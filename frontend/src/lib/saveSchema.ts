import { z } from "zod";

const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["healing", "weapon", "armor", "key"]),
  value: z.number(),
  quantity: z.number(),
});

const areaStateSchema = z.object({
  id: z.string(),
  visited: z.boolean(),
  enemiesDefeated: z.number(),
  shardsCollected: z.number(),
  keyCollected: z.boolean(),
  loreDiscovered: z.array(z.string()),
});

const planetSchema = z.object({
  id: z.number(),
  name: z.string(),
  shardsCollected: z.number(),
  totalShards: z.number(),
  coreSealed: z.boolean(),
  enemiesKilled: z.number(),
  enemiesSpared: z.number(),
  allEnemiesCleared: z.boolean(),
  bossDefeated: z.boolean(),
  secretBossDefeated: z.boolean(),
  keysFound: z.number(),
  keysRequired: z.number(),
  minEnemiesRequired: z.number(),
  puzzleType: z.enum(["simon", "rhythm", "misdirection"]),
  currentAreaId: z.string(),
  areaStates: z.array(areaStateSchema),
  loreDiscovered: z.array(z.string()),
});

const travelerSchema = z.object({
  id: z.string(),
  name: z.string(),
  portrait: z.string(),
  recruited: z.boolean(),
});

const playerPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const saveDataSchema = z.object({
  playerName: z.string(),
  vesselName: z.string(),
  hp: z.number().min(0),
  maxHp: z.number().min(1),
  level: z.number().min(1).max(100),
  xp: z.number().min(0),
  atk: z.number().min(0),
  def: z.number().min(0),
  gold: z.number().min(0),
  inventory: z.array(inventoryItemSchema),
  nebuliShards: z.number().min(0),
  nebuliTotal: z.number().min(0),
  currentPlanetId: z.number().min(0),
  planets: z.array(planetSchema),
  totalKills: z.number().min(0),
  totalSpares: z.number().min(0),
  currentRoute: z.enum(["pacifist", "neutral", "genocide"]),
  travelers: z.array(travelerSchema),
  lakineDialogueIndex: z.number().min(0),
  playerPosition: playerPositionSchema,
});

export type SaveData = z.infer<typeof saveDataSchema>;

export type LoadResult = { ok: true; data: SaveData } | { ok: false; error: string };

export function parseSaveData(raw: string): LoadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid save file (not valid JSON)." };
  }
  const result = saveDataSchema.safeParse(parsed);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const message = result.error.errors.map((e) => e.message).join("; ") || "Invalid save data.";
  return { ok: false, error: message };
}
