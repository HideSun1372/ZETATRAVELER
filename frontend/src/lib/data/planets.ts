export type PuzzleType = "simon" | "rhythm" | "misdirection";

interface RawPlanetTheme {
  id: number;
  name: string;
  biome: string;
  primaryColor: string;
  secondaryColor: string;
  groundColor: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  region: string;
  description: string;
  enemies: PlanetEnemy[];
  boss?: PlanetEnemy;
  secretBoss?: PlanetEnemy;
  puzzleType?: PuzzleType;
  minEnemiesRequired?: number;
  keysRequired?: number;
}

export interface PlanetTheme extends RawPlanetTheme {
  boss: PlanetEnemy;
  puzzleType: PuzzleType;
  minEnemiesRequired: number;
  keysRequired: number;
}

export type AttackPattern = 
  | "rain" | "spiral" | "sides" | "wave" | "aimed" | "corners"
  | "burst" | "orbit" | "cross" | "scatter" | "chase" | "pulse"
  | "zigzag" | "split" | "bounce" | "sweep" | "vortex" | "barrage";

export interface PlanetEnemy {
  name: string;
  hp: number;
  atk: number;
  def: number;
  color: string;
  spareDialogue: string[];
  attackPattern?: AttackPattern;
}

const REGION_BOSS_DATA: Record<string, { names: string[]; patterns: AttackPattern[] }> = {
  "Verdant Cluster": { names: ["GUARDIAN", "TITAN", "OVERLORD", "ANCIENT", "EMPEROR"], patterns: ["spiral", "orbit", "wave", "scatter", "pulse"] },
  "Frozen Expanse": { names: ["WYRM", "COLOSSUS", "MONARCH", "FROST LORD", "ICE KING"], patterns: ["sides", "sweep", "barrage", "rain", "cross"] },
  "Inferno Sector": { names: ["IFRIT", "OVERLORD", "INFERNAL", "BLAZE LORD", "MAGMA KING"], patterns: ["burst", "cross", "scatter", "vortex", "barrage"] },
  "Void Realm": { names: ["ARCHON", "PARADOX", "NULL KING", "SHADE LORD", "VOID EMPEROR"], patterns: ["vortex", "zigzag", "split", "chase", "pulse"] },
  "Celestial Heights": { names: ["SERAPH", "AVATAR", "CONDUCTOR", "ASTRAL LORD", "CELESTIAL KING"], patterns: ["aimed", "pulse", "barrage", "spiral", "orbit"] },
};

const darkenColor = (color: string, amount: number = 0.3): string => {
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - Math.floor(255 * amount));
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - Math.floor(255 * amount));
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const generateBoss = (planet: RawPlanetTheme): PlanetEnemy => {
  const regionData = REGION_BOSS_DATA[planet.region] || REGION_BOSS_DATA["Verdant Cluster"];
  const nameIndex = planet.id % regionData.names.length;
  const patternIndex = planet.id % regionData.patterns.length;
  
  const biomeWord = planet.biome.split(" ")[0].toUpperCase();
  const bossName = `${biomeWord} ${regionData.names[nameIndex]}`;
  
  const baseHp = 80 + 20 * (planet.difficulty - 1);
  const baseAtk = 12 + 4 * planet.difficulty;
  const baseDef = 8 + 3 * planet.difficulty;
  
  return {
    name: bossName,
    hp: baseHp + (planet.id % 20),
    atk: baseAtk + (planet.id % 5),
    def: baseDef + (planet.id % 4),
    color: darkenColor(planet.primaryColor),
    spareDialogue: [
      `${bossName}'s fury subsides.`,
      "Ancient power recognizes your spirit.",
      "You have earned passage.",
    ],
    attackPattern: regionData.patterns[patternIndex],
  };
};

const generateSecretBoss = (planet: RawPlanetTheme): PlanetEnemy | undefined => {
  if (planet.id % 10 !== 0) return undefined;
  
  const baseBoss = generateBoss(planet);
  return {
    name: `OMEGA ${baseBoss.name}`,
    hp: Math.floor(baseBoss.hp * 1.5),
    atk: Math.floor(baseBoss.atk * 1.3),
    def: Math.floor(baseBoss.def * 1.3),
    color: darkenColor(planet.secondaryColor),
    spareDialogue: [
      `The OMEGA ${baseBoss.name} transcends.`,
      "Ultimate power... at peace.",
      "You have proven worthy of the stars.",
    ],
    attackPattern: "vortex",
  };
};

const getPuzzleType = (planetId: number): PuzzleType => {
  const puzzleTypes: PuzzleType[] = ["simon", "rhythm", "misdirection"];
  return puzzleTypes[planetId % 3];
};

const getMinEnemies = (difficulty: number): number => {
  return 4 + difficulty;
};

const getKeysRequired = (difficulty: number): number => {
  return Math.min(1 + Math.floor(difficulty / 2), 3);
};

const ensureBosses = (planets: RawPlanetTheme[]): PlanetTheme[] => {
  return planets.map((planet) => ({
    ...planet,
    boss: planet.boss || generateBoss(planet),
    secretBoss: planet.secretBoss || generateSecretBoss(planet),
    puzzleType: planet.puzzleType || getPuzzleType(planet.id),
    minEnemiesRequired: planet.minEnemiesRequired || getMinEnemies(planet.difficulty),
    keysRequired: planet.keysRequired || getKeysRequired(planet.difficulty),
  }));
};

const RAW_PLANET_DATA: RawPlanetTheme[] = [
  // REGION 1: VERDANT CLUSTER (Planets 1-10) - Easy
  {
    id: 1,
    name: "Verdantis",
    biome: "Lush Forest",
    primaryColor: "#2ECC71",
    secondaryColor: "#27AE60",
    groundColor: "#1E8449",
    difficulty: 1,
    region: "Verdant Cluster",
    description: "A peaceful world covered in emerald forests.",
    enemies: [
      { name: "LEAFLING", hp: 15, atk: 5, def: 2, color: "#2ECC71", spareDialogue: ["The Leafling rustles peacefully.", "It seems to enjoy the breeze."] },
      { name: "MOSS SPRITE", hp: 12, atk: 4, def: 3, color: "#27AE60", spareDialogue: ["The Moss Sprite hums softly.", "It's calming down."] },
      { name: "THORNBACK", hp: 20, atk: 7, def: 4, color: "#1E8449", spareDialogue: ["Thornback retracts its spines.", "It doesn't want to fight."] },
    ],
    boss: { name: "ELDER TREANT", hp: 80, atk: 12, def: 8, color: "#1B5E20", spareDialogue: ["The Elder Treant's rage subsides.", "Ancient wisdom returns.", "It grants you passage."], attackPattern: "spiral" },
    secretBoss: { name: "FOREST HEART", hp: 120, atk: 15, def: 10, color: "#00E676", spareDialogue: ["The Forest Heart pulses gently.", "Nature recognizes your spirit.", "You are blessed."], attackPattern: "vortex" },
  },
  {
    id: 2,
    name: "Floraheim",
    biome: "Flower Fields",
    primaryColor: "#E91E63",
    secondaryColor: "#F48FB1",
    groundColor: "#8BC34A",
    difficulty: 1,
    region: "Verdant Cluster",
    description: "Endless fields of bioluminescent flowers.",
    enemies: [
      { name: "PETAL DANCER", hp: 14, atk: 6, def: 2, color: "#E91E63", spareDialogue: ["Petal Dancer twirls gracefully.", "It bows to you."] },
      { name: "BLOOMWARDEN", hp: 18, atk: 5, def: 5, color: "#F48FB1", spareDialogue: ["Bloomwarden lowers its guard.", "The flowers calm it."] },
      { name: "NECTAR BEE", hp: 10, atk: 8, def: 1, color: "#FFC107", spareDialogue: ["Nectar Bee buzzes happily.", "It found what it needed."] },
    ],
    boss: { name: "QUEEN BLOSSOM", hp: 85, atk: 13, def: 7, color: "#AD1457", spareDialogue: ["Queen Blossom's petals soften.", "The garden accepts you.", "Beauty in mercy."], attackPattern: "burst" },
  },
  {
    id: 3,
    name: "Mycelium Prime",
    biome: "Mushroom Caverns",
    primaryColor: "#9C27B0",
    secondaryColor: "#CE93D8",
    groundColor: "#4A148C",
    difficulty: 1,
    region: "Verdant Cluster",
    description: "Underground caverns lit by giant glowing mushrooms.",
    enemies: [
      { name: "SPOREKID", hp: 16, atk: 5, def: 3, color: "#9C27B0", spareDialogue: ["Sporekid releases calming spores.", "It seems friendly now."] },
      { name: "FUNGAL KNIGHT", hp: 22, atk: 7, def: 5, color: "#7B1FA2", spareDialogue: ["Fungal Knight sheathes its weapon.", "Honor is satisfied."] },
      { name: "MYCONID", hp: 18, atk: 6, def: 4, color: "#CE93D8", spareDialogue: ["Myconid nods slowly.", "It understands."] },
    ],
    boss: { name: "SPOREMAESTRO", hp: 90, atk: 11, def: 10, color: "#6A1B9A", spareDialogue: ["Sporemaestro's glow dims peacefully.", "The network accepts you.", "You are one with fungi."], attackPattern: "pulse" },
  },
  {
    id: 4,
    name: "Dewdrop",
    biome: "Rainy Wetlands",
    primaryColor: "#00BCD4",
    secondaryColor: "#80DEEA",
    groundColor: "#006064",
    difficulty: 1,
    region: "Verdant Cluster",
    description: "A world of eternal gentle rain and lily pads.",
    enemies: [
      { name: "RAINLING", hp: 14, atk: 5, def: 3, color: "#00BCD4", spareDialogue: ["Rainling splashes playfully.", "It's just playing!"] },
      { name: "PUDDLEJUMP", hp: 12, atk: 6, def: 2, color: "#80DEEA", spareDialogue: ["Puddlejump hops away.", "It lost interest."] },
      { name: "MISTWALKER", hp: 20, atk: 7, def: 4, color: "#006064", spareDialogue: ["Mistwalker fades slightly.", "It means no harm."] },
    ],
    boss: { name: "STORM SERPENT", hp: 88, atk: 14, def: 6, color: "#00838F", spareDialogue: ["Storm Serpent coils peacefully.", "The rain calms.", "Thunder becomes silence."], attackPattern: "rain" },
  },
  {
    id: 5,
    name: "Vineweald",
    biome: "Ancient Jungle",
    primaryColor: "#4CAF50",
    secondaryColor: "#81C784",
    groundColor: "#2E7D32",
    difficulty: 1,
    region: "Verdant Cluster",
    description: "Thick vines and ancient trees older than time.",
    enemies: [
      { name: "VINESNARE", hp: 18, atk: 6, def: 4, color: "#4CAF50", spareDialogue: ["Vinesnare loosens its grip.", "It was just scared."] },
      { name: "ANCIENT APE", hp: 24, atk: 8, def: 5, color: "#795548", spareDialogue: ["Ancient Ape beats its chest.", "Respect earned."] },
      { name: "JUNGLE WISP", hp: 10, atk: 5, def: 2, color: "#81C784", spareDialogue: ["Jungle Wisp floats peacefully.", "It guides the way."] },
    ],
    boss: { name: "PRIMORDIAL TITAN", hp: 95, atk: 15, def: 9, color: "#1B5E20", spareDialogue: ["Primordial Titan kneels.", "Ancient respect earned.", "The jungle bows."], attackPattern: "scatter" },
  },
  {
    id: 6,
    name: "Bamboo Nexus",
    biome: "Bamboo Forest",
    primaryColor: "#8BC34A",
    secondaryColor: "#C5E1A5",
    groundColor: "#558B2F",
    difficulty: 2,
    region: "Verdant Cluster",
    description: "Towering bamboo stalks that sing in the wind.",
    enemies: [
      { name: "REED WARRIOR", hp: 22, atk: 8, def: 4, color: "#8BC34A", spareDialogue: ["Reed Warrior bows.", "A worthy opponent."] },
      { name: "PANDA SPIRIT", hp: 26, atk: 6, def: 8, color: "#ECEFF1", spareDialogue: ["Panda Spirit yawns.", "Nap time."] },
      { name: "WIND CHIME", hp: 14, atk: 9, def: 2, color: "#C5E1A5", spareDialogue: ["Wind Chime rings softly.", "Harmony restored."] },
    ],
  },
  {
    id: 7,
    name: "Serenity Grove",
    biome: "Sacred Garden",
    primaryColor: "#CDDC39",
    secondaryColor: "#E6EE9C",
    groundColor: "#827717",
    difficulty: 2,
    region: "Verdant Cluster",
    description: "A tranquil sanctuary where nature flourishes.",
    enemies: [
      { name: "GARDEN KEEPER", hp: 25, atk: 7, def: 6, color: "#CDDC39", spareDialogue: ["Garden Keeper nods.", "You may pass."] },
      { name: "BUTTERFLY SAGE", hp: 18, atk: 9, def: 3, color: "#FF9800", spareDialogue: ["Butterfly Sage flutters.", "Wisdom shared."] },
      { name: "STONE TOTEM", hp: 30, atk: 5, def: 10, color: "#9E9E9E", spareDialogue: ["Stone Totem crumbles...", "Just kidding. It winks."] },
    ],
  },
  {
    id: 8,
    name: "Willowmere",
    biome: "Weeping Marshes",
    primaryColor: "#607D8B",
    secondaryColor: "#90A4AE",
    groundColor: "#37474F",
    difficulty: 2,
    region: "Verdant Cluster",
    description: "Melancholic willows hang over misty waters.",
    enemies: [
      { name: "MARSH PHANTOM", hp: 20, atk: 10, def: 3, color: "#607D8B", spareDialogue: ["Marsh Phantom sighs.", "It's just lonely."] },
      { name: "WEEPING WILLOW", hp: 28, atk: 6, def: 7, color: "#90A4AE", spareDialogue: ["Weeping Willow stops crying.", "You cheered it up!"] },
      { name: "FOG CRAWLER", hp: 16, atk: 8, def: 4, color: "#455A64", spareDialogue: ["Fog Crawler retreats.", "Another day."] },
    ],
  },
  {
    id: 9,
    name: "Thornvale",
    biome: "Briar Thicket",
    primaryColor: "#795548",
    secondaryColor: "#A1887F",
    groundColor: "#4E342E",
    difficulty: 2,
    region: "Verdant Cluster",
    description: "Dense thorns protect ancient treasures within.",
    enemies: [
      { name: "BRIAR WOLF", hp: 24, atk: 9, def: 5, color: "#795548", spareDialogue: ["Briar Wolf howls.", "Pack satisfied."] },
      { name: "THORN ELEMENTAL", hp: 30, atk: 8, def: 8, color: "#5D4037", spareDialogue: ["Thorn Elemental calms.", "Balance restored."] },
      { name: "ROSE KNIGHT", hp: 26, atk: 10, def: 6, color: "#E91E63", spareDialogue: ["Rose Knight salutes.", "For the garden."] },
    ],
  },
  {
    id: 10,
    name: "Eden's Rest",
    biome: "Paradise Meadow",
    primaryColor: "#4DB6AC",
    secondaryColor: "#80CBC4",
    groundColor: "#00695C",
    difficulty: 2,
    region: "Verdant Cluster",
    description: "The heart of the Verdant Cluster, pure and pristine.",
    enemies: [
      { name: "PARADISE BIRD", hp: 20, atk: 11, def: 4, color: "#4DB6AC", spareDialogue: ["Paradise Bird sings.", "A beautiful melody."] },
      { name: "EDEN GUARDIAN", hp: 35, atk: 9, def: 9, color: "#00897B", spareDialogue: ["Eden Guardian stands down.", "You are worthy."] },
      { name: "GENESIS FLOWER", hp: 22, atk: 7, def: 6, color: "#80CBC4", spareDialogue: ["Genesis Flower blooms.", "Life persists."] },
    ],
  },

  // REGION 2: FROZEN EXPANSE (Planets 11-20) - Medium
  {
    id: 11,
    name: "Frostveil",
    biome: "Eternal Winter",
    primaryColor: "#B3E5FC",
    secondaryColor: "#E1F5FE",
    groundColor: "#0277BD",
    difficulty: 2,
    region: "Frozen Expanse",
    description: "A world locked in beautiful, deadly ice.",
    enemies: [
      { name: "FROST IMP", hp: 22, atk: 10, def: 4, color: "#B3E5FC", spareDialogue: ["Frost Imp shivers.", "It's cold for everyone."] },
      { name: "ICE WRAITH", hp: 26, atk: 12, def: 5, color: "#E1F5FE", spareDialogue: ["Ice Wraith dissipates.", "Only mist remains."] },
      { name: "GLACIER BEAR", hp: 35, atk: 8, def: 10, color: "#ECEFF1", spareDialogue: ["Glacier Bear yawns.", "Hibernation time."] },
    ],
  },
  {
    id: 12,
    name: "Crystalpeak",
    biome: "Crystal Mountains",
    primaryColor: "#CE93D8",
    secondaryColor: "#E1BEE7",
    groundColor: "#6A1B9A",
    difficulty: 2,
    region: "Frozen Expanse",
    description: "Mountains of pure crystal pierce the sky.",
    enemies: [
      { name: "CRYSTAL GOLEM", hp: 40, atk: 9, def: 12, color: "#CE93D8", spareDialogue: ["Crystal Golem powers down.", "Threat eliminated."] },
      { name: "PRISM SPIRIT", hp: 18, atk: 14, def: 3, color: "#E1BEE7", spareDialogue: ["Prism Spirit refracts.", "Beauty in all."] },
      { name: "DIAMOND DRAKE", hp: 32, atk: 11, def: 8, color: "#B39DDB", spareDialogue: ["Diamond Drake lands.", "Treasure shared."] },
    ],
  },
  {
    id: 13,
    name: "Snowfall Haven",
    biome: "Snowy Village",
    primaryColor: "#ECEFF1",
    secondaryColor: "#CFD8DC",
    groundColor: "#455A64",
    difficulty: 3,
    region: "Frozen Expanse",
    description: "An abandoned village beneath endless snowfall.",
    enemies: [
      { name: "LOST SOUL", hp: 24, atk: 12, def: 5, color: "#ECEFF1", spareDialogue: ["Lost Soul remembers.", "Home at last."] },
      { name: "SNOW GOLEM", hp: 38, atk: 10, def: 9, color: "#CFD8DC", spareDialogue: ["Snow Golem melts slightly.", "Warmth felt."] },
      { name: "WINTER WITCH", hp: 28, atk: 15, def: 6, color: "#90CAF9", spareDialogue: ["Winter Witch laughs.", "You're fun."] },
    ],
  },
  {
    id: 14,
    name: "Aurora Prime",
    biome: "Northern Lights",
    primaryColor: "#64FFDA",
    secondaryColor: "#A7FFEB",
    groundColor: "#004D40",
    difficulty: 3,
    region: "Frozen Expanse",
    description: "Brilliant auroras dance across the frozen sky.",
    enemies: [
      { name: "AURORA DANCER", hp: 26, atk: 13, def: 6, color: "#64FFDA", spareDialogue: ["Aurora Dancer glows.", "Dance complete."] },
      { name: "LIGHT WEAVER", hp: 30, atk: 14, def: 5, color: "#A7FFEB", spareDialogue: ["Light Weaver dims.", "Pattern finished."] },
      { name: "POLAR GUARDIAN", hp: 42, atk: 11, def: 11, color: "#B2DFDB", spareDialogue: ["Polar Guardian nods.", "Pass in peace."] },
    ],
  },
  {
    id: 15,
    name: "Glacium",
    biome: "Ice Caves",
    primaryColor: "#81D4FA",
    secondaryColor: "#B3E5FC",
    groundColor: "#01579B",
    difficulty: 3,
    region: "Frozen Expanse",
    description: "Deep ice caves hide ancient frozen secrets.",
    enemies: [
      { name: "CAVE STALKER", hp: 28, atk: 14, def: 6, color: "#81D4FA", spareDialogue: ["Cave Stalker retreats.", "Not worth it."] },
      { name: "FROZEN GIANT", hp: 50, atk: 12, def: 14, color: "#B3E5FC", spareDialogue: ["Frozen Giant sits.", "Rest now."] },
      { name: "ICE SPIDER", hp: 22, atk: 16, def: 4, color: "#E3F2FD", spareDialogue: ["Ice Spider scurries.", "Eight legs, zero interest."] },
    ],
  },
  {
    id: 16,
    name: "Permafrost",
    biome: "Frozen Tundra",
    primaryColor: "#90CAF9",
    secondaryColor: "#BBDEFB",
    groundColor: "#1565C0",
    difficulty: 3,
    region: "Frozen Expanse",
    description: "Nothing grows here. Nothing ever did.",
    enemies: [
      { name: "TUNDRA BEAST", hp: 44, atk: 13, def: 10, color: "#90CAF9", spareDialogue: ["Tundra Beast rests.", "Hunt over."] },
      { name: "FROST PHANTOM", hp: 30, atk: 16, def: 5, color: "#BBDEFB", spareDialogue: ["Frost Phantom fades.", "Finally... peace."] },
      { name: "BLIZZARD ELEMENTAL", hp: 36, atk: 15, def: 8, color: "#64B5F6", spareDialogue: ["Blizzard Elemental calms.", "Storm passes."] },
    ],
  },
  {
    id: 17,
    name: "Icicle Spire",
    biome: "Frozen Citadel",
    primaryColor: "#4FC3F7",
    secondaryColor: "#81D4FA",
    groundColor: "#0288D1",
    difficulty: 3,
    region: "Frozen Expanse",
    description: "A towering fortress of pure ice.",
    enemies: [
      { name: "ICE KNIGHT", hp: 38, atk: 14, def: 12, color: "#4FC3F7", spareDialogue: ["Ice Knight kneels.", "Honor satisfied."] },
      { name: "FROZEN MAGE", hp: 28, atk: 18, def: 6, color: "#81D4FA", spareDialogue: ["Frozen Mage bows.", "Wisdom prevails."] },
      { name: "CRYSTAL SENTINEL", hp: 48, atk: 12, def: 15, color: "#E1F5FE", spareDialogue: ["Crystal Sentinel powers down.", "Protocol satisfied."] },
    ],
  },
  {
    id: 18,
    name: "Whitevoid",
    biome: "Endless White",
    primaryColor: "#FAFAFA",
    secondaryColor: "#F5F5F5",
    groundColor: "#9E9E9E",
    difficulty: 3,
    region: "Frozen Expanse",
    description: "An infinite expanse of pure white nothingness.",
    enemies: [
      { name: "VOID WANDERER", hp: 32, atk: 15, def: 7, color: "#FAFAFA", spareDialogue: ["Void Wanderer stops.", "Direction found."] },
      { name: "ECHO SPIRIT", hp: 26, atk: 17, def: 5, color: "#F5F5F5", spareDialogue: ["Echo Spirit repeats...", "repeats... peace."] },
      { name: "BLANK HORROR", hp: 40, atk: 14, def: 10, color: "#EEEEEE", spareDialogue: ["Blank Horror forms... a smile?", "It's happy."] },
    ],
  },
  {
    id: 19,
    name: "Shatterheim",
    biome: "Broken Ice Fields",
    primaryColor: "#80DEEA",
    secondaryColor: "#B2EBF2",
    groundColor: "#00838F",
    difficulty: 4,
    region: "Frozen Expanse",
    description: "Fractured ice platforms drift in cold void.",
    enemies: [
      { name: "SHARD DANCER", hp: 34, atk: 16, def: 8, color: "#80DEEA", spareDialogue: ["Shard Dancer lands.", "Performance over."] },
      { name: "ICE COLOSSUS", hp: 55, atk: 14, def: 16, color: "#B2EBF2", spareDialogue: ["Ice Colossus crumbles...", "Just dust now."] },
      { name: "FROST WYRM", hp: 45, atk: 18, def: 10, color: "#4DD0E1", spareDialogue: ["Frost Wyrm coils.", "Nap time."] },
    ],
  },
  {
    id: 20,
    name: "Absolute Zero",
    biome: "Core of Cold",
    primaryColor: "#00BCD4",
    secondaryColor: "#4DD0E1",
    groundColor: "#006064",
    difficulty: 4,
    region: "Frozen Expanse",
    description: "The coldest place in the known universe.",
    enemies: [
      { name: "ENTROPY KEEPER", hp: 50, atk: 17, def: 12, color: "#00BCD4", spareDialogue: ["Entropy Keeper slows.", "Heat death... delayed."] },
      { name: "ZERO ELEMENTAL", hp: 42, atk: 20, def: 8, color: "#4DD0E1", spareDialogue: ["Zero Elemental stabilizes.", "Warmth... nice."] },
      { name: "ABSOLUTE GUARDIAN", hp: 60, atk: 15, def: 18, color: "#00ACC1", spareDialogue: ["Absolute Guardian nods.", "Worthy of warmth."] },
    ],
  },

  // REGION 3: INFERNO SECTOR (Planets 21-30) - Medium-Hard
  {
    id: 21,
    name: "Ember Plains",
    biome: "Volcanic Fields",
    primaryColor: "#FF5722",
    secondaryColor: "#FF8A65",
    groundColor: "#BF360C",
    difficulty: 3,
    region: "Inferno Sector",
    description: "Rivers of lava flow through ash-covered plains.",
    enemies: [
      { name: "EMBER SPRITE", hp: 28, atk: 14, def: 5, color: "#FF5722", spareDialogue: ["Ember Sprite cools.", "Warmth shared."] },
      { name: "LAVA HOUND", hp: 36, atk: 16, def: 8, color: "#FF8A65", spareDialogue: ["Lava Hound sits.", "Good boy."] },
      { name: "ASH GIANT", hp: 48, atk: 13, def: 14, color: "#795548", spareDialogue: ["Ash Giant crumbles.", "Rest at last."] },
    ],
  },
  {
    id: 22,
    name: "Magmoria",
    biome: "Lava Lakes",
    primaryColor: "#F44336",
    secondaryColor: "#EF5350",
    groundColor: "#B71C1C",
    difficulty: 3,
    region: "Inferno Sector",
    description: "Vast lakes of molten rock light up the sky.",
    enemies: [
      { name: "MAGMA SWIMMER", hp: 32, atk: 15, def: 7, color: "#F44336", spareDialogue: ["Magma Swimmer surfaces.", "Just passing through."] },
      { name: "FIRE SERPENT", hp: 40, atk: 18, def: 6, color: "#EF5350", spareDialogue: ["Fire Serpent coils.", "Warmth preserved."] },
      { name: "MOLTEN GOLEM", hp: 52, atk: 14, def: 15, color: "#E53935", spareDialogue: ["Molten Golem cools.", "Peace solidified."] },
    ],
  },
  {
    id: 23,
    name: "Cinderfall",
    biome: "Ash Wastes",
    primaryColor: "#9E9E9E",
    secondaryColor: "#BDBDBD",
    groundColor: "#424242",
    difficulty: 3,
    region: "Inferno Sector",
    description: "Constant ash falls like snow from the sky.",
    enemies: [
      { name: "CINDER WRAITH", hp: 30, atk: 17, def: 6, color: "#9E9E9E", spareDialogue: ["Cinder Wraith fades.", "Ashes to ashes."] },
      { name: "ASH WALKER", hp: 35, atk: 15, def: 9, color: "#BDBDBD", spareDialogue: ["Ash Walker stops.", "Journey's end."] },
      { name: "PHOENIX GHOST", hp: 38, atk: 19, def: 5, color: "#FF9800", spareDialogue: ["Phoenix Ghost rises...", "Then rests."] },
    ],
  },
  {
    id: 24,
    name: "Inferno Core",
    biome: "Planet Core",
    primaryColor: "#FF9800",
    secondaryColor: "#FFB74D",
    groundColor: "#E65100",
    difficulty: 4,
    region: "Inferno Sector",
    description: "The exposed molten core of a dying world.",
    enemies: [
      { name: "CORE BEAST", hp: 45, atk: 18, def: 10, color: "#FF9800", spareDialogue: ["Core Beast settles.", "Energy conserved."] },
      { name: "PLASMA ELEMENTAL", hp: 38, atk: 22, def: 5, color: "#FFB74D", spareDialogue: ["Plasma Elemental dims.", "Cooldown complete."] },
      { name: "HEAT TITAN", hp: 60, atk: 16, def: 16, color: "#F57C00", spareDialogue: ["Heat Titan kneels.", "Core protected."] },
    ],
  },
  {
    id: 25,
    name: "Scorchwind",
    biome: "Fire Storms",
    primaryColor: "#FFEB3B",
    secondaryColor: "#FFF176",
    groundColor: "#F57F17",
    difficulty: 4,
    region: "Inferno Sector",
    description: "Eternal fire storms rage across the surface.",
    enemies: [
      { name: "STORM FLARE", hp: 40, atk: 20, def: 7, color: "#FFEB3B", spareDialogue: ["Storm Flare calms.", "Eye of the storm."] },
      { name: "BLAZE HAWK", hp: 35, atk: 22, def: 5, color: "#FFF176", spareDialogue: ["Blaze Hawk lands.", "Wind dies down."] },
      { name: "INFERNO DJINN", hp: 48, atk: 19, def: 11, color: "#FFD54F", spareDialogue: ["Inferno Djinn grants...", "Nothing. But peace."] },
    ],
  },
  {
    id: 26,
    name: "Sulfur Depths",
    biome: "Sulfur Caverns",
    primaryColor: "#CDDC39",
    secondaryColor: "#DCE775",
    groundColor: "#827717",
    difficulty: 4,
    region: "Inferno Sector",
    description: "Toxic sulfur vents fill poisonous caverns.",
    enemies: [
      { name: "SULFUR CRAWLER", hp: 42, atk: 19, def: 9, color: "#CDDC39", spareDialogue: ["Sulfur Crawler burrows.", "Home sweet home."] },
      { name: "TOXIC SHADE", hp: 36, atk: 23, def: 4, color: "#DCE775", spareDialogue: ["Toxic Shade dissipates.", "Air clears."] },
      { name: "VENOM LORD", hp: 55, atk: 18, def: 13, color: "#9E9D24", spareDialogue: ["Venom Lord retreats.", "Toxins neutralized."] },
    ],
  },
  {
    id: 27,
    name: "Furnace",
    biome: "Industrial Hellscape",
    primaryColor: "#FF6F00",
    secondaryColor: "#FFA000",
    groundColor: "#E65100",
    difficulty: 4,
    region: "Inferno Sector",
    description: "Ancient alien forges still burn eternally.",
    enemies: [
      { name: "FORGE AUTOMATON", hp: 50, atk: 17, def: 14, color: "#FF6F00", spareDialogue: ["Forge Automaton deactivates.", "Directive complete."] },
      { name: "SLAG BEAST", hp: 45, atk: 20, def: 10, color: "#FFA000", spareDialogue: ["Slag Beast cools.", "Metal at rest."] },
      { name: "IRON PHOENIX", hp: 52, atk: 21, def: 9, color: "#FFB300", spareDialogue: ["Iron Phoenix lands.", "Cycle complete."] },
    ],
  },
  {
    id: 28,
    name: "Pyreheart",
    biome: "Sacred Flames",
    primaryColor: "#D84315",
    secondaryColor: "#FF7043",
    groundColor: "#BF360C",
    difficulty: 4,
    region: "Inferno Sector",
    description: "Holy flames worshipped by ancient fire cults.",
    enemies: [
      { name: "FLAME PRIEST", hp: 44, atk: 22, def: 8, color: "#D84315", spareDialogue: ["Flame Priest bows.", "Sacred fire preserved."] },
      { name: "PYRE GUARDIAN", hp: 58, atk: 18, def: 15, color: "#FF7043", spareDialogue: ["Pyre Guardian kneels.", "Worthy pilgrim."] },
      { name: "HOLY EMBER", hp: 40, atk: 24, def: 6, color: "#FF5722", spareDialogue: ["Holy Ember glows softly.", "Blessing granted."] },
    ],
  },
  {
    id: 29,
    name: "Obsidian Prime",
    biome: "Glass Desert",
    primaryColor: "#263238",
    secondaryColor: "#37474F",
    groundColor: "#102027",
    difficulty: 5,
    region: "Inferno Sector",
    description: "A desert of volcanic glass, sharp and deadly.",
    enemies: [
      { name: "GLASS STALKER", hp: 46, atk: 24, def: 8, color: "#263238", spareDialogue: ["Glass Stalker shatters...", "Then reforms, peaceful."] },
      { name: "OBSIDIAN KNIGHT", hp: 55, atk: 21, def: 14, color: "#37474F", spareDialogue: ["Obsidian Knight salutes.", "Edge dulled."] },
      { name: "MIRROR HORROR", hp: 48, atk: 26, def: 6, color: "#455A64", spareDialogue: ["Mirror Horror reflects...", "Your kindness."] },
    ],
  },
  {
    id: 30,
    name: "Hellgate",
    biome: "Dimensional Rift",
    primaryColor: "#B71C1C",
    secondaryColor: "#C62828",
    groundColor: "#7F0000",
    difficulty: 5,
    region: "Inferno Sector",
    description: "A tear in reality leading to realms of fire.",
    enemies: [
      { name: "RIFT DEMON", hp: 55, atk: 25, def: 10, color: "#B71C1C", spareDialogue: ["Rift Demon bows.", "Contract void."] },
      { name: "HELL KNIGHT", hp: 62, atk: 22, def: 15, color: "#C62828", spareDialogue: ["Hell Knight kneels.", "Oath fulfilled."] },
      { name: "GATE KEEPER", hp: 70, atk: 20, def: 18, color: "#D32F2F", spareDialogue: ["Gate Keeper opens...", "The way forward."] },
    ],
  },

  // REGION 4: VOID REALM (Planets 31-40) - Hard
  {
    id: 31,
    name: "Voidrift",
    biome: "Spatial Tears",
    primaryColor: "#311B92",
    secondaryColor: "#4527A0",
    groundColor: "#1A0033",
    difficulty: 4,
    region: "Void Realm",
    description: "Reality tears apart at the seams here.",
    enemies: [
      { name: "VOID WALKER", hp: 48, atk: 22, def: 10, color: "#311B92", spareDialogue: ["Void Walker phases.", "Between spaces now."] },
      { name: "RIFT HORROR", hp: 55, atk: 25, def: 8, color: "#4527A0", spareDialogue: ["Rift Horror closes.", "Wound healed."] },
      { name: "SPACE RENDER", hp: 52, atk: 24, def: 11, color: "#512DA8", spareDialogue: ["Space Render stops.", "No more tears."] },
    ],
  },
  {
    id: 32,
    name: "Nullspace",
    biome: "Anti-Matter",
    primaryColor: "#000000",
    secondaryColor: "#212121",
    groundColor: "#1A1A1A",
    difficulty: 4,
    region: "Void Realm",
    description: "Where matter ceases to have meaning.",
    enemies: [
      { name: "NULL ENTITY", hp: 50, atk: 24, def: 9, color: "#000000", spareDialogue: ["Null Entity exists.", "And chooses peace."] },
      { name: "ANTI-BEING", hp: 45, atk: 28, def: 6, color: "#212121", spareDialogue: ["Anti-Being inverts.", "Positive now."] },
      { name: "VOID KEEPER", hp: 60, atk: 22, def: 14, color: "#424242", spareDialogue: ["Void Keeper nods.", "Balance maintained."] },
    ],
  },
  {
    id: 33,
    name: "Dark Nebula",
    biome: "Cosmic Dust",
    primaryColor: "#1A237E",
    secondaryColor: "#283593",
    groundColor: "#0D1259",
    difficulty: 4,
    region: "Void Realm",
    description: "Clouds of cosmic dust block all light.",
    enemies: [
      { name: "NEBULA GHOST", hp: 52, atk: 23, def: 10, color: "#1A237E", spareDialogue: ["Nebula Ghost fades.", "Into stardust."] },
      { name: "COSMIC DRIFTER", hp: 48, atk: 26, def: 7, color: "#283593", spareDialogue: ["Cosmic Drifter floats.", "Journey continues."] },
      { name: "STAR EATER", hp: 65, atk: 24, def: 12, color: "#303F9F", spareDialogue: ["Star Eater rests.", "Full for now."] },
    ],
  },
  {
    id: 34,
    name: "Event Horizon",
    biome: "Black Hole Edge",
    primaryColor: "#4A148C",
    secondaryColor: "#6A1B9A",
    groundColor: "#12002B",
    difficulty: 5,
    region: "Void Realm",
    description: "The edge of a black hole, time bends here.",
    enemies: [
      { name: "HORIZON WALKER", hp: 58, atk: 26, def: 11, color: "#4A148C", spareDialogue: ["Horizon Walker escapes.", "Time resumes."] },
      { name: "GRAVITY PHANTOM", hp: 52, atk: 29, def: 8, color: "#6A1B9A", spareDialogue: ["Gravity Phantom releases.", "Weight lifted."] },
      { name: "TIME BENDER", hp: 55, atk: 27, def: 10, color: "#7B1FA2", spareDialogue: ["Time Bender stops...", "This moment. Perfect."] },
    ],
  },
  {
    id: 35,
    name: "Entropy's End",
    biome: "Heat Death",
    primaryColor: "#37474F",
    secondaryColor: "#455A64",
    groundColor: "#1C2126",
    difficulty: 5,
    region: "Void Realm",
    description: "A glimpse of the universe's final state.",
    enemies: [
      { name: "ENTROPY SHADE", hp: 55, atk: 28, def: 9, color: "#37474F", spareDialogue: ["Entropy Shade pauses.", "Decay delayed."] },
      { name: "FINAL THOUGHT", hp: 50, atk: 30, def: 7, color: "#455A64", spareDialogue: ["Final Thought remains.", "Memory persists."] },
      { name: "END WATCHER", hp: 68, atk: 25, def: 15, color: "#546E7A", spareDialogue: ["End Watcher closes eyes.", "Not yet."] },
    ],
  },
  {
    id: 36,
    name: "Warp Gate",
    biome: "Dimensional Hub",
    primaryColor: "#00838F",
    secondaryColor: "#0097A7",
    groundColor: "#004D51",
    difficulty: 5,
    region: "Void Realm",
    description: "A nexus of portals to infinite dimensions.",
    enemies: [
      { name: "PORTAL GUARDIAN", hp: 62, atk: 26, def: 13, color: "#00838F", spareDialogue: ["Portal Guardian bows.", "Passage granted."] },
      { name: "DIMENSION HOPPER", hp: 48, atk: 30, def: 6, color: "#0097A7", spareDialogue: ["Dimension Hopper lands.", "Home at last."] },
      { name: "GATE MASTER", hp: 70, atk: 24, def: 17, color: "#00ACC1", spareDialogue: ["Gate Master opens.", "Choose your path."] },
    ],
  },
  {
    id: 37,
    name: "Fractured Reality",
    biome: "Broken Space",
    primaryColor: "#880E4F",
    secondaryColor: "#AD1457",
    groundColor: "#560027",
    difficulty: 5,
    region: "Void Realm",
    description: "Reality itself has shattered into pieces.",
    enemies: [
      { name: "REALITY SHARD", hp: 56, atk: 28, def: 10, color: "#880E4F", spareDialogue: ["Reality Shard reforms.", "Whole again."] },
      { name: "BROKEN THING", hp: 60, atk: 27, def: 11, color: "#AD1457", spareDialogue: ["Broken Thing mends.", "Fixed now."] },
      { name: "FRACTURE LORD", hp: 72, atk: 26, def: 14, color: "#C2185B", spareDialogue: ["Fracture Lord heals.", "Unity restored."] },
    ],
  },
  {
    id: 38,
    name: "Silence",
    biome: "Sound Void",
    primaryColor: "#263238",
    secondaryColor: "#37474F",
    groundColor: "#11171A",
    difficulty: 5,
    region: "Void Realm",
    description: "No sound can exist here. Absolute silence.",
    enemies: [
      { name: "MUTE SPECTER", hp: 58, atk: 29, def: 9, color: "#263238", spareDialogue: ["...", "...!"] },
      { name: "SILENT HORROR", hp: 62, atk: 28, def: 11, color: "#37474F", spareDialogue: ["Silent Horror smiles.", "Wordlessly."] },
      { name: "VOICE EATER", hp: 68, atk: 30, def: 10, color: "#455A64", spareDialogue: ["Voice Eater releases.", "Songs return."] },
    ],
  },
  {
    id: 39,
    name: "Liminal Space",
    biome: "Between Places",
    primaryColor: "#FFF8E1",
    secondaryColor: "#FFECB3",
    groundColor: "#FFE082",
    difficulty: 5,
    region: "Void Realm",
    description: "The spaces between spaces. Eerily familiar.",
    enemies: [
      { name: "LIMINAL BEING", hp: 60, atk: 27, def: 12, color: "#FFF8E1", spareDialogue: ["Liminal Being waves.", "See you later."] },
      { name: "BACKROOM CRAWLER", hp: 55, atk: 30, def: 8, color: "#FFECB3", spareDialogue: ["Backroom Crawler leaves.", "Exit found."] },
      { name: "THRESHOLD KEEPER", hp: 70, atk: 28, def: 13, color: "#FFE082", spareDialogue: ["Threshold Keeper opens door.", "Way out."] },
    ],
  },
  {
    id: 40,
    name: "The Abyss",
    biome: "Infinite Dark",
    primaryColor: "#0D0D0D",
    secondaryColor: "#1A1A1A",
    groundColor: "#050505",
    difficulty: 5,
    region: "Void Realm",
    description: "Pure darkness. The end of everything.",
    enemies: [
      { name: "ABYSS WALKER", hp: 65, atk: 30, def: 11, color: "#0D0D0D", spareDialogue: ["Abyss Walker emerges.", "Light found."] },
      { name: "DARK ONE", hp: 70, atk: 32, def: 10, color: "#1A1A1A", spareDialogue: ["Dark One brightens.", "Spark within."] },
      { name: "ABYSS LORD", hp: 80, atk: 28, def: 16, color: "#262626", spareDialogue: ["Abyss Lord bows.", "Deepest respect."] },
    ],
  },

  // REGION 5: CELESTIAL HEIGHTS (Planets 41-50) - Hardest
  {
    id: 41,
    name: "Starfall",
    biome: "Meteor Shower",
    primaryColor: "#FFC107",
    secondaryColor: "#FFCA28",
    groundColor: "#FF8F00",
    difficulty: 4,
    region: "Celestial Heights",
    description: "Stars constantly fall from the sky.",
    enemies: [
      { name: "FALLING STAR", hp: 55, atk: 28, def: 10, color: "#FFC107", spareDialogue: ["Falling Star lands.", "Wish granted."] },
      { name: "METEOR BEAST", hp: 65, atk: 26, def: 13, color: "#FFCA28", spareDialogue: ["Meteor Beast cools.", "Impact absorbed."] },
      { name: "CELESTIAL HUNTER", hp: 60, atk: 30, def: 11, color: "#FFB300", spareDialogue: ["Celestial Hunter bows.", "Hunt complete."] },
    ],
  },
  {
    id: 42,
    name: "Solar Wind",
    biome: "Star Corona",
    primaryColor: "#FF6F00",
    secondaryColor: "#FF8F00",
    groundColor: "#E65100",
    difficulty: 5,
    region: "Celestial Heights",
    description: "Riding the solar winds near a dying star.",
    enemies: [
      { name: "SOLAR SPIRIT", hp: 62, atk: 30, def: 10, color: "#FF6F00", spareDialogue: ["Solar Spirit dims.", "Warmth shared."] },
      { name: "WIND RIDER", hp: 58, atk: 32, def: 8, color: "#FF8F00", spareDialogue: ["Wind Rider descends.", "Current calms."] },
      { name: "CORONA GUARDIAN", hp: 75, atk: 28, def: 15, color: "#FFA000", spareDialogue: ["Corona Guardian cools.", "Star protected."] },
    ],
  },
  {
    id: 43,
    name: "Nebula's Heart",
    biome: "Star Nursery",
    primaryColor: "#E91E63",
    secondaryColor: "#F48FB1",
    groundColor: "#880E4F",
    difficulty: 5,
    region: "Celestial Heights",
    description: "Where new stars are born from cosmic gas.",
    enemies: [
      { name: "NASCENT STAR", hp: 60, atk: 31, def: 9, color: "#E91E63", spareDialogue: ["Nascent Star pulses.", "Life begins."] },
      { name: "GAS TITAN", hp: 72, atk: 28, def: 14, color: "#F48FB1", spareDialogue: ["Gas Titan settles.", "Form achieved."] },
      { name: "BIRTH KEEPER", hp: 68, atk: 32, def: 11, color: "#AD1457", spareDialogue: ["Birth Keeper smiles.", "Creation continues."] },
    ],
  },
  {
    id: 44,
    name: "Constellation",
    biome: "Star Patterns",
    primaryColor: "#3F51B5",
    secondaryColor: "#7986CB",
    groundColor: "#1A237E",
    difficulty: 5,
    region: "Celestial Heights",
    description: "Walk among the patterns of ancient stars.",
    enemies: [
      { name: "STAR SINGER", hp: 64, atk: 30, def: 11, color: "#3F51B5", spareDialogue: ["Star Singer hums.", "Melody ends."] },
      { name: "PATTERN WEAVER", hp: 58, atk: 33, def: 8, color: "#7986CB", spareDialogue: ["Pattern Weaver finishes.", "Design complete."] },
      { name: "ZODIAC GUARDIAN", hp: 78, atk: 29, def: 15, color: "#5C6BC0", spareDialogue: ["Zodiac Guardian aligns.", "Fate accepts."] },
    ],
  },
  {
    id: 45,
    name: "Luminos",
    biome: "Pure Light",
    primaryColor: "#FFFFFF",
    secondaryColor: "#FFFDE7",
    groundColor: "#FFF9C4",
    difficulty: 5,
    region: "Celestial Heights",
    description: "A world of pure, blinding light.",
    enemies: [
      { name: "LIGHT BEARER", hp: 66, atk: 31, def: 12, color: "#FFFFFF", spareDialogue: ["Light Bearer dims.", "Rest earned."] },
      { name: "RADIANT ONE", hp: 70, atk: 34, def: 9, color: "#FFFDE7", spareDialogue: ["Radiant One softens.", "Glow shared."] },
      { name: "LUMINOS AVATAR", hp: 82, atk: 30, def: 16, color: "#FFF59D", spareDialogue: ["Luminos Avatar bows.", "Light eternal."] },
    ],
  },
  {
    id: 46,
    name: "Moonfall",
    biome: "Lunar Graveyard",
    primaryColor: "#B0BEC5",
    secondaryColor: "#CFD8DC",
    groundColor: "#78909C",
    difficulty: 5,
    region: "Celestial Heights",
    description: "Where dead moons come to rest.",
    enemies: [
      { name: "LUNAR GHOST", hp: 68, atk: 32, def: 11, color: "#B0BEC5", spareDialogue: ["Lunar Ghost fades.", "Orbit complete."] },
      { name: "MOON BEAST", hp: 74, atk: 30, def: 14, color: "#CFD8DC", spareDialogue: ["Moon Beast howls.", "Tide settles."] },
      { name: "CRATER KEEPER", hp: 80, atk: 33, def: 12, color: "#90A4AE", spareDialogue: ["Crater Keeper nods.", "Rest in peace."] },
    ],
  },
  {
    id: 47,
    name: "Cosmic Ocean",
    biome: "Space Sea",
    primaryColor: "#006064",
    secondaryColor: "#00838F",
    groundColor: "#004D40",
    difficulty: 5,
    region: "Celestial Heights",
    description: "An ocean that floats in the void of space.",
    enemies: [
      { name: "SPACE WHALE", hp: 85, atk: 28, def: 18, color: "#006064", spareDialogue: ["Space Whale sings.", "Ancient song."] },
      { name: "VOID SWIMMER", hp: 65, atk: 34, def: 10, color: "#00838F", spareDialogue: ["Void Swimmer surfaces.", "Depths call."] },
      { name: "OCEAN ELDER", hp: 78, atk: 32, def: 14, color: "#00695C", spareDialogue: ["Ocean Elder waves.", "Current blessed."] },
    ],
  },
  {
    id: 48,
    name: "Genesis Point",
    biome: "Creation Site",
    primaryColor: "#7C4DFF",
    secondaryColor: "#B388FF",
    groundColor: "#651FFF",
    difficulty: 5,
    region: "Celestial Heights",
    description: "The point where creation began.",
    enemies: [
      { name: "GENESIS SPIRIT", hp: 75, atk: 33, def: 13, color: "#7C4DFF", spareDialogue: ["Genesis Spirit glows.", "Beginning honored."] },
      { name: "ORIGIN KEEPER", hp: 80, atk: 31, def: 15, color: "#B388FF", spareDialogue: ["Origin Keeper bows.", "Source protected."] },
      { name: "CREATION TITAN", hp: 90, atk: 30, def: 18, color: "#6200EA", spareDialogue: ["Creation Titan rests.", "Cycle continues."] },
    ],
  },
  {
    id: 49,
    name: "Omega Point",
    biome: "Universe End",
    primaryColor: "#AA00FF",
    secondaryColor: "#D500F9",
    groundColor: "#7B1FA2",
    difficulty: 5,
    region: "Celestial Heights",
    description: "The final destination of all existence.",
    enemies: [
      { name: "OMEGA SHADE", hp: 78, atk: 34, def: 12, color: "#AA00FF", spareDialogue: ["Omega Shade accepts.", "End embraced."] },
      { name: "FINAL FORM", hp: 85, atk: 32, def: 15, color: "#D500F9", spareDialogue: ["Final Form transcends.", "Beyond now."] },
      { name: "OMEGA GUARDIAN", hp: 95, atk: 30, def: 20, color: "#9C27B0", spareDialogue: ["Omega Guardian opens.", "Gateway to peace."] },
    ],
  },
  {
    id: 50,
    name: "Zeta Prime",
    biome: "The Center",
    primaryColor: "#FFD700",
    secondaryColor: "#FFF176",
    groundColor: "#FFC400",
    difficulty: 5,
    region: "Celestial Heights",
    description: "The heart of the galaxy. Your final destination.",
    enemies: [
      { name: "ZETA GUARDIAN", hp: 80, atk: 35, def: 14, color: "#FFD700", spareDialogue: ["Zeta Guardian salutes.", "Traveler welcomed."] },
      { name: "CORE SENTINEL", hp: 90, atk: 33, def: 17, color: "#FFF176", spareDialogue: ["Core Sentinel deactivates.", "Mission complete."] },
      { name: "PRIME AVATAR", hp: 100, atk: 35, def: 20, color: "#FFC400", spareDialogue: ["Prime Avatar smiles.", "You've arrived. Well done."] },
    ],
    boss: { name: "THE ZETATRON", hp: 200, atk: 40, def: 25, color: "#B8860B", spareDialogue: ["THE ZETATRON powers down.", "The galaxy is at peace.", "Your journey is complete. Thank you, Traveler."], attackPattern: "vortex" },
    secretBoss: { name: "OMEGA ZETATRON", hp: 300, atk: 50, def: 30, color: "#DAA520", spareDialogue: ["OMEGA ZETATRON transcends reality.", "You have mastered the cosmos.", "The true ending awaits..."], attackPattern: "barrage" },
  },
];

export const PLANET_DATA: PlanetTheme[] = ensureBosses(RAW_PLANET_DATA);

export const getRegions = () => {
  const regions = new Map<string, PlanetTheme[]>();
  PLANET_DATA.forEach(planet => {
    const existing = regions.get(planet.region) || [];
    existing.push(planet);
    regions.set(planet.region, existing);
  });
  return regions;
};

export const getPlanetById = (id: number): PlanetTheme | undefined => {
  return PLANET_DATA.find(p => p.id === id);
};

export const getPlanetsByRegion = (region: string): PlanetTheme[] => {
  return PLANET_DATA.filter(p => p.region === region);
};

export const REGIONS = [
  { name: "Verdant Cluster", planets: [1, 10], color: "#2ECC71", description: "Lush, peaceful worlds" },
  { name: "Frozen Expanse", planets: [11, 20], color: "#81D4FA", description: "Ice and cold dominate" },
  { name: "Inferno Sector", planets: [21, 30], color: "#FF5722", description: "Fire and brimstone" },
  { name: "Void Realm", planets: [31, 40], color: "#311B92", description: "Dark and mysterious" },
  { name: "Celestial Heights", planets: [41, 50], color: "#FFD700", description: "The final frontier" },
];
