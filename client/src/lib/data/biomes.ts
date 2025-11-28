export interface BiomeDecoration {
  type: string;
  emoji: string;
  probability: number;
  animated?: boolean;
  glows?: boolean;
}

export interface BiomeConfig {
  id: string;
  name: string;
  groundColor: string;
  groundColorAlt: string;
  wallColor: string;
  wallColorAlt: string;
  accentColor: string;
  ambientLight: string;
  fogColor: string;
  fogOpacity: number;
  particleType: "none" | "dust" | "snow" | "embers" | "bubbles" | "stars" | "spores" | "void";
  props: string[];
  decorations: BiomeDecoration[];
  tileVariant: "grass" | "stone" | "sand" | "ice" | "metal" | "void" | "lava" | "crystal";
  floorPattern: "solid" | "checkered" | "hexagonal" | "cracked" | "organic" | "circuits" | "crystalline";
  wallStyle: "solid" | "rough" | "smooth" | "jagged" | "glowing" | "translucent";
  ambientAnimation: "none" | "shimmer" | "pulse" | "flow" | "flicker" | "drift";
}

export const BIOME_CATALOG: Record<string, BiomeConfig> = {
  forest: {
    id: "forest",
    name: "Forest",
    groundColor: "#2E7D32",
    groundColorAlt: "#388E3C",
    wallColor: "#1B5E20",
    wallColorAlt: "#2E7D32",
    accentColor: "#4CAF50",
    ambientLight: "#A5D6A7",
    fogColor: "#C8E6C9",
    fogOpacity: 0.1,
    particleType: "spores",
    props: ["tree", "bush", "flowers", "mushroom"],
    decorations: [
      { type: "tree", emoji: "🌲", probability: 0.15 },
      { type: "bush", emoji: "🌿", probability: 0.2, animated: true },
      { type: "flower", emoji: "🌸", probability: 0.1 },
      { type: "mushroom", emoji: "🍄", probability: 0.08 },
    ],
    tileVariant: "grass",
    floorPattern: "organic",
    wallStyle: "rough",
    ambientAnimation: "shimmer",
  },
  cave: {
    id: "cave",
    name: "Cavern",
    groundColor: "#37474F",
    groundColorAlt: "#455A64",
    wallColor: "#263238",
    wallColorAlt: "#37474F",
    accentColor: "#78909C",
    ambientLight: "#455A64",
    fogColor: "#263238",
    fogOpacity: 0.3,
    particleType: "dust",
    props: ["stalactite", "stalagmite", "crystals", "rocks"],
    decorations: [
      { type: "stalactite", emoji: "🪨", probability: 0.12 },
      { type: "crystal", emoji: "💎", probability: 0.08, glows: true },
      { type: "rock", emoji: "🪨", probability: 0.15 },
      { type: "puddle", emoji: "💧", probability: 0.05 },
    ],
    tileVariant: "stone",
    floorPattern: "cracked",
    wallStyle: "jagged",
    ambientAnimation: "none",
  },
  ruins: {
    id: "ruins",
    name: "Ancient Ruins",
    groundColor: "#5D4037",
    groundColorAlt: "#6D4C41",
    wallColor: "#3E2723",
    wallColorAlt: "#4E342E",
    accentColor: "#8D6E63",
    ambientLight: "#A1887F",
    fogColor: "#8D6E63",
    fogOpacity: 0.15,
    particleType: "dust",
    props: ["pillar", "broken_wall", "statue", "debris"],
    decorations: [
      { type: "pillar", emoji: "🏛️", probability: 0.1 },
      { type: "debris", emoji: "🧱", probability: 0.15 },
      { type: "vase", emoji: "🏺", probability: 0.05 },
      { type: "torch", emoji: "🔥", probability: 0.08, animated: true, glows: true },
    ],
    tileVariant: "stone",
    floorPattern: "checkered",
    wallStyle: "rough",
    ambientAnimation: "flicker",
  },
  crystal: {
    id: "crystal",
    name: "Crystal Caverns",
    groundColor: "#4A148C",
    groundColorAlt: "#6A1B9A",
    wallColor: "#311B92",
    wallColorAlt: "#4527A0",
    accentColor: "#CE93D8",
    ambientLight: "#E1BEE7",
    fogColor: "#CE93D8",
    fogOpacity: 0.2,
    particleType: "stars",
    props: ["crystal_cluster", "crystal_pillar", "glowing_pool", "prism"],
    decorations: [
      { type: "crystal", emoji: "💎", probability: 0.2, glows: true },
      { type: "prism", emoji: "🔮", probability: 0.1, glows: true },
      { type: "glow_pool", emoji: "✨", probability: 0.05, animated: true, glows: true },
    ],
    tileVariant: "crystal",
    floorPattern: "crystalline",
    wallStyle: "glowing",
    ambientAnimation: "shimmer",
  },
  desert: {
    id: "desert",
    name: "Desert",
    groundColor: "#E65100",
    groundColorAlt: "#EF6C00",
    wallColor: "#BF360C",
    wallColorAlt: "#D84315",
    accentColor: "#FFB74D",
    ambientLight: "#FFCC80",
    fogColor: "#FFE0B2",
    fogOpacity: 0.15,
    particleType: "dust",
    props: ["cactus", "rock", "skeleton", "oasis"],
    decorations: [
      { type: "cactus", emoji: "🌵", probability: 0.12 },
      { type: "rock", emoji: "🪨", probability: 0.1 },
      { type: "skull", emoji: "💀", probability: 0.03 },
      { type: "dune", emoji: "🏜️", probability: 0.08 },
    ],
    tileVariant: "sand",
    floorPattern: "organic",
    wallStyle: "smooth",
    ambientAnimation: "drift",
  },
  ice: {
    id: "ice",
    name: "Frozen Wastes",
    groundColor: "#0277BD",
    groundColorAlt: "#0288D1",
    wallColor: "#01579B",
    wallColorAlt: "#0277BD",
    accentColor: "#81D4FA",
    ambientLight: "#B3E5FC",
    fogColor: "#E1F5FE",
    fogOpacity: 0.25,
    particleType: "snow",
    props: ["icicle", "ice_pillar", "frozen_statue", "snowdrift"],
    decorations: [
      { type: "icicle", emoji: "🧊", probability: 0.15 },
      { type: "snowman", emoji: "⛄", probability: 0.03 },
      { type: "snowflake", emoji: "❄️", probability: 0.2, animated: true },
      { type: "frost", emoji: "🌨️", probability: 0.1 },
    ],
    tileVariant: "ice",
    floorPattern: "cracked",
    wallStyle: "translucent",
    ambientAnimation: "shimmer",
  },
  volcanic: {
    id: "volcanic",
    name: "Volcanic",
    groundColor: "#B71C1C",
    groundColorAlt: "#C62828",
    wallColor: "#4E342E",
    wallColorAlt: "#5D4037",
    accentColor: "#FF5722",
    ambientLight: "#FF8A65",
    fogColor: "#BF360C",
    fogOpacity: 0.3,
    particleType: "embers",
    props: ["lava_crack", "obsidian", "ember", "charred_tree"],
    decorations: [
      { type: "lava", emoji: "🔥", probability: 0.15, animated: true, glows: true },
      { type: "obsidian", emoji: "🪨", probability: 0.1 },
      { type: "ember", emoji: "🌋", probability: 0.08, glows: true },
      { type: "ash", emoji: "💨", probability: 0.12 },
    ],
    tileVariant: "lava",
    floorPattern: "cracked",
    wallStyle: "jagged",
    ambientAnimation: "flicker",
  },
  void: {
    id: "void",
    name: "The Void",
    groundColor: "#1A1A2E",
    groundColorAlt: "#16213E",
    wallColor: "#0F0F1A",
    wallColorAlt: "#1A1A2E",
    accentColor: "#7B68EE",
    ambientLight: "#483D8B",
    fogColor: "#0F0F1A",
    fogOpacity: 0.4,
    particleType: "void",
    props: ["void_crystal", "floating_debris", "portal_fragment", "echo"],
    decorations: [
      { type: "void_rift", emoji: "🌀", probability: 0.1, animated: true, glows: true },
      { type: "star", emoji: "⭐", probability: 0.15, glows: true },
      { type: "debris", emoji: "🌑", probability: 0.08 },
      { type: "portal", emoji: "🕳️", probability: 0.05, animated: true, glows: true },
    ],
    tileVariant: "void",
    floorPattern: "hexagonal",
    wallStyle: "glowing",
    ambientAnimation: "pulse",
  },
  tech: {
    id: "tech",
    name: "Tech Facility",
    groundColor: "#455A64",
    groundColorAlt: "#546E7A",
    wallColor: "#37474F",
    wallColorAlt: "#455A64",
    accentColor: "#00BCD4",
    ambientLight: "#80DEEA",
    fogColor: "#263238",
    fogOpacity: 0.1,
    particleType: "dust",
    props: ["terminal", "power_conduit", "broken_robot", "crate"],
    decorations: [
      { type: "terminal", emoji: "🖥️", probability: 0.08, glows: true },
      { type: "crate", emoji: "📦", probability: 0.12 },
      { type: "wire", emoji: "⚡", probability: 0.1, animated: true, glows: true },
      { type: "robot", emoji: "🤖", probability: 0.05 },
    ],
    tileVariant: "metal",
    floorPattern: "circuits",
    wallStyle: "smooth",
    ambientAnimation: "pulse",
  },
  garden: {
    id: "garden",
    name: "Sacred Garden",
    groundColor: "#558B2F",
    groundColorAlt: "#689F38",
    wallColor: "#33691E",
    wallColorAlt: "#558B2F",
    accentColor: "#AED581",
    ambientLight: "#DCEDC8",
    fogColor: "#F1F8E9",
    fogOpacity: 0.1,
    particleType: "spores",
    props: ["flower_bed", "fountain", "bench", "gazebo"],
    decorations: [
      { type: "flower", emoji: "🌺", probability: 0.2 },
      { type: "butterfly", emoji: "🦋", probability: 0.08, animated: true },
      { type: "fountain", emoji: "⛲", probability: 0.03, animated: true },
      { type: "rose", emoji: "🌹", probability: 0.1 },
    ],
    tileVariant: "grass",
    floorPattern: "organic",
    wallStyle: "smooth",
    ambientAnimation: "shimmer",
  },
  marsh: {
    id: "marsh",
    name: "Marshlands",
    groundColor: "#00695C",
    groundColorAlt: "#00796B",
    wallColor: "#004D40",
    wallColorAlt: "#00695C",
    accentColor: "#26A69A",
    ambientLight: "#80CBC4",
    fogColor: "#004D40",
    fogOpacity: 0.35,
    particleType: "bubbles",
    props: ["lily_pad", "cattail", "log", "mist"],
    decorations: [
      { type: "lily", emoji: "🪷", probability: 0.15 },
      { type: "frog", emoji: "🐸", probability: 0.05, animated: true },
      { type: "reed", emoji: "🌾", probability: 0.12 },
      { type: "bubble", emoji: "🫧", probability: 0.1, animated: true },
    ],
    tileVariant: "grass",
    floorPattern: "organic",
    wallStyle: "rough",
    ambientAnimation: "flow",
  },
  celestial: {
    id: "celestial",
    name: "Celestial Realm",
    groundColor: "#1A237E",
    groundColorAlt: "#283593",
    wallColor: "#0D1B5E",
    wallColorAlt: "#1A237E",
    accentColor: "#7C4DFF",
    ambientLight: "#B388FF",
    fogColor: "#7C4DFF",
    fogOpacity: 0.2,
    particleType: "stars",
    props: ["star_fragment", "cloud", "pillar_of_light", "constellation"],
    decorations: [
      { type: "star", emoji: "⭐", probability: 0.2, glows: true },
      { type: "moon", emoji: "🌙", probability: 0.05, glows: true },
      { type: "cloud", emoji: "☁️", probability: 0.1, animated: true },
      { type: "comet", emoji: "☄️", probability: 0.03, animated: true, glows: true },
    ],
    tileVariant: "void",
    floorPattern: "hexagonal",
    wallStyle: "glowing",
    ambientAnimation: "shimmer",
  },
};

export type BiomeId = keyof typeof BIOME_CATALOG;

export const getBiomeForPlanet = (biome: string): BiomeConfig => {
  const biomeMap: Record<string, BiomeId> = {
    "Lush Forest": "forest",
    "Flower Fields": "garden",
    "Mushroom Caverns": "cave",
    "Rainy Wetlands": "marsh",
    "Ancient Jungle": "forest",
    "Bamboo Forest": "forest",
    "Sacred Garden": "garden",
    "Weeping Marshes": "marsh",
    "Briar Thicket": "forest",
    "Paradise Meadow": "garden",
    "Eternal Winter": "ice",
    "Crystal Mountains": "crystal",
    "Snowy Village": "ice",
    "Northern Lights": "ice",
    "Ice Caves": "cave",
    "Frozen Tundra": "ice",
    "Frozen Citadel": "ice",
    "Endless White": "ice",
    "Broken Ice Fields": "ice",
    "Core of Cold": "crystal",
    "Volcanic Fields": "volcanic",
    "Lava Lakes": "volcanic",
    "Ash Wastes": "desert",
    "Planet Core": "volcanic",
    "Fire Storms": "volcanic",
    "Obsidian Peaks": "volcanic",
    "Sulfur Pits": "volcanic",
    "Burning Sands": "desert",
    "Hellscape": "volcanic",
    "Supernova Remnant": "volcanic",
    "Shadow Realm": "void",
    "Dark Nebula": "void",
    "Null Zone": "void",
    "Event Horizon": "void",
    "Antimatter Rift": "void",
    "Silent Void": "void",
    "Phantom Dimension": "void",
    "Entropy Field": "void",
    "Reality Tear": "void",
    "Oblivion Gate": "void",
    "Starlight Peaks": "celestial",
    "Aurora Fields": "celestial",
    "Solar Temple": "celestial",
    "Cosmic Garden": "garden",
    "Nebula Core": "celestial",
    "Gravity Wells": "void",
    "Light Bridge": "celestial",
    "Astral Ocean": "celestial",
    "Stellar Forge": "tech",
    "Heaven's Gate": "celestial",
  };

  const biomeId = biomeMap[biome] || "forest";
  return BIOME_CATALOG[biomeId];
};

export function getFloorPatternStyle(pattern: BiomeConfig["floorPattern"], x: number, y: number, seed: number): React.CSSProperties {
  const variant = ((x + y + seed) % 4);
  
  switch (pattern) {
    case "checkered":
      return {
        opacity: (x + y) % 2 === 0 ? 0.9 : 0.7,
      };
    case "hexagonal":
      return {
        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        opacity: 0.8 + (variant * 0.05),
      };
    case "cracked":
      return {
        borderRight: variant % 2 === 0 ? "1px solid rgba(0,0,0,0.3)" : "none",
        borderBottom: variant % 3 === 0 ? "1px solid rgba(0,0,0,0.3)" : "none",
        opacity: 0.85 + (variant * 0.05),
      };
    case "organic":
      return {
        borderRadius: variant % 2 === 0 ? "2px" : "0",
        opacity: 0.8 + Math.sin(x * 0.5 + y * 0.3) * 0.1,
      };
    case "circuits":
      return {
        borderRight: (x + seed) % 3 === 0 ? "2px solid rgba(0,255,255,0.3)" : "none",
        borderBottom: (y + seed) % 3 === 0 ? "2px solid rgba(0,255,255,0.3)" : "none",
        opacity: 0.9,
      };
    case "crystalline":
      return {
        clipPath: variant % 2 === 0 
          ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
          : "none",
        opacity: 0.7 + (variant * 0.1),
      };
    default:
      return {
        opacity: 0.85 + (variant * 0.05),
      };
  }
}

export function getWallStyleGradient(
  style: BiomeConfig["wallStyle"], 
  wallColor: string, 
  wallColorAlt: string, 
  accentColor: string,
  position: "top" | "bottom" | "left" | "right" | "corner"
): string {
  switch (style) {
    case "rough":
      return position === "corner"
        ? `linear-gradient(135deg, ${wallColor} 0%, ${wallColorAlt} 50%, ${wallColor} 100%)`
        : `linear-gradient(to ${position === "top" ? "bottom" : position === "bottom" ? "top" : position}, ${wallColor} 0%, ${wallColorAlt} 100%)`;
    case "jagged":
      return `repeating-linear-gradient(45deg, ${wallColor}, ${wallColor} 5px, ${wallColorAlt} 5px, ${wallColorAlt} 10px)`;
    case "glowing":
      return `linear-gradient(to bottom, ${accentColor}44 0%, ${wallColor} 30%, ${wallColor} 70%, ${accentColor}44 100%)`;
    case "translucent":
      return `linear-gradient(to bottom, ${wallColor}CC 0%, ${wallColor}88 50%, ${wallColor}CC 100%)`;
    case "smooth":
      return `linear-gradient(to bottom, ${wallColorAlt} 0%, ${wallColor} 100%)`;
    default:
      return wallColor;
  }
}
