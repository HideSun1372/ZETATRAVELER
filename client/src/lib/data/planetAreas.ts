import { BiomeId, BIOME_CATALOG, getBiomeForPlanet } from "./biomes";
import { PuzzleType, AttackPattern, PlanetEnemy } from "./planets";

export interface AreaConnection {
  targetAreaId: string;
  direction: "north" | "south" | "east" | "west";
  type: "door" | "portal" | "path" | "gate" | "cave" | "stairs";
  x: number;
  y: number;
  locked?: boolean;
  keyRequired?: boolean;
}

export interface LoreNode {
  id: string;
  type: "tablet" | "terminal" | "memory" | "inscription" | "echo" | "artifact";
  title: string;
  content: string[];
  x: number;
  y: number;
  discovered?: boolean;
}

export interface AreaContent {
  enemyCount: number;
  shardCount: number;
  hasKey: boolean;
  loreNodes: LoreNode[];
}

export interface PlanetArea {
  id: string;
  name: string;
  biome: BiomeId;
  description: string;
  width: number;
  height: number;
  connections: AreaConnection[];
  content: AreaContent;
  isBossLair?: boolean;
  isPuzzleChamber?: boolean;
  isEntrance?: boolean;
  isCoreRoom?: boolean;
  layoutSeed: number;
}

export interface PlanetStoryArc {
  premise: string;
  midpoint: string;
  resolution: string;
  theme: string;
}

export interface PlanetLore {
  planetId: number;
  storyArc: PlanetStoryArc;
  areas: PlanetArea[];
  totalShards: number;
  totalEnemies: number;
  totalKeys: number;
}

const AREA_TEMPLATES: Record<string, { name: string; description: string; biomeOverride?: BiomeId }[]> = {
  forest: [
    { name: "Forest Entrance", description: "The canopy opens to reveal a sunlit path." },
    { name: "Ancient Grove", description: "Massive trees tower overhead, their roots forming natural pathways." },
    { name: "Hidden Glade", description: "A peaceful clearing where light filters through the leaves." },
    { name: "Overgrown Ruins", description: "Nature has reclaimed these stone structures.", biomeOverride: "ruins" },
    { name: "Sacred Spring", description: "Crystal clear water flows from an ancient fountain." },
    { name: "The Heart Tree", description: "An impossibly large tree dominates the area." },
  ],
  cave: [
    { name: "Cave Mouth", description: "Darkness beckons from within the rocky entrance." },
    { name: "Stalactite Chamber", description: "Massive stone formations drip with ancient water." },
    { name: "Underground Lake", description: "An eerily still body of water reflects distant lights." },
    { name: "Crystal Cavern", description: "Glowing crystals illuminate the narrow passages.", biomeOverride: "crystal" },
    { name: "The Depths", description: "The air grows thick and warm deeper within." },
    { name: "Forgotten Shrine", description: "Someone once worshipped here, long ago.", biomeOverride: "ruins" },
  ],
  ice: [
    { name: "Frozen Pass", description: "Wind howls through ice-covered cliffs." },
    { name: "Glacier Fields", description: "Endless ice stretches toward the horizon." },
    { name: "Ice Cavern", description: "Blue light filters through the frozen walls.", biomeOverride: "cave" },
    { name: "Frozen Temple", description: "An ancient structure preserved perfectly in ice.", biomeOverride: "ruins" },
    { name: "Aurora Valley", description: "Lights dance in the sky above the snow." },
    { name: "The Frozen Heart", description: "The coldest place on the planet." },
  ],
  volcanic: [
    { name: "Lava Fields", description: "Molten rock flows in rivers of fire." },
    { name: "Obsidian Cliffs", description: "Black glass formations tower overhead." },
    { name: "Ash Wastes", description: "Everything is covered in gray volcanic ash." },
    { name: "Magma Chamber", description: "The heat here is almost unbearable." },
    { name: "Ruined Forge", description: "An ancient civilization built their forges here.", biomeOverride: "tech" },
    { name: "The Caldera", description: "The heart of the volcano itself." },
  ],
  void: [
    { name: "Rift Entrance", description: "Reality itself seems to bend and warp." },
    { name: "Null Space", description: "Nothing should exist here, yet something does." },
    { name: "Memory Fragment", description: "Echoes of the past materialize around you." },
    { name: "The Paradox", description: "Time and space hold no meaning here." },
    { name: "Echo Chamber", description: "Every sound returns distorted and wrong." },
    { name: "The Singularity", description: "The center of nothing. The end of everything." },
  ],
  celestial: [
    { name: "Starlight Landing", description: "Platforms of solidified starlight form the ground." },
    { name: "Constellation Path", description: "Stars form a pathway through the cosmos." },
    { name: "Solar Terrace", description: "Warm light bathes everything in gold." },
    { name: "Nebula Gardens", description: "Cosmic clouds form impossible flora.", biomeOverride: "garden" },
    { name: "The Observatory", description: "Ancient instruments point toward infinity.", biomeOverride: "tech" },
    { name: "Heaven's Throne", description: "The highest point among the stars." },
  ],
  garden: [
    { name: "Garden Gate", description: "Ornate gates open to a paradise within." },
    { name: "Flower Meadow", description: "Countless flowers bloom in impossible colors." },
    { name: "Reflection Pool", description: "Still waters mirror the beauty above." },
    { name: "The Arbor", description: "Climbing plants form natural archways." },
    { name: "Secret Grove", description: "Hidden away from the world, beauty thrives." },
    { name: "Heart of Eden", description: "The most beautiful place in existence." },
  ],
  ruins: [
    { name: "Ruined Gates", description: "Once-mighty gates now crumble to dust." },
    { name: "Collapsed Hall", description: "Grand architecture lies in ruin." },
    { name: "Forgotten Library", description: "Ancient knowledge waits to be discovered.", biomeOverride: "tech" },
    { name: "Throne Room", description: "Empty thrones await rulers long dead." },
    { name: "Catacombs", description: "The dead rest uneasily here.", biomeOverride: "cave" },
    { name: "Sacred Chamber", description: "The heart of the ancient civilization." },
  ],
  tech: [
    { name: "Landing Bay", description: "Abandoned vessels gather dust." },
    { name: "Power Core", description: "Faint energy still hums through the walls." },
    { name: "Control Center", description: "Terminals flicker with residual data." },
    { name: "Research Lab", description: "Experiments left unfinished remain." },
    { name: "Server Room", description: "Ancient data waits to be accessed." },
    { name: "Central Hub", description: "All paths lead here." },
  ],
  marsh: [
    { name: "Marsh Edge", description: "The ground becomes soft and wet." },
    { name: "Lily Pond", description: "Giant lily pads provide a path across the water." },
    { name: "Foggy Hollow", description: "Thick mist obscures everything beyond a few feet." },
    { name: "Willow Grove", description: "Weeping willows trail their branches in the water." },
    { name: "Sunken Ruins", description: "Ancient structures slowly sink into the marsh.", biomeOverride: "ruins" },
    { name: "The Deep Fen", description: "The heart of the wetlands pulses with life." },
  ],
  desert: [
    { name: "Desert Edge", description: "Sand stretches endlessly before you." },
    { name: "Oasis", description: "A miracle of life in the barren wastes." },
    { name: "Canyon Pass", description: "Towering rock walls provide shelter from the sun." },
    { name: "Ancient Tomb", description: "A structure half-buried in the sand.", biomeOverride: "ruins" },
    { name: "Sand Sea", description: "Dunes rise and fall like frozen waves." },
    { name: "The Scorched Heart", description: "The hottest place in the desert." },
  ],
  crystal: [
    { name: "Crystal Entrance", description: "Light refracts through prismatic formations." },
    { name: "Prism Hall", description: "Rainbow light dances across every surface." },
    { name: "Resonance Chamber", description: "The crystals here sing with energy." },
    { name: "Growth Cavern", description: "New crystals slowly form from the walls." },
    { name: "The Matrix", description: "A geometric perfection of crystalline structures." },
    { name: "Heart Crystal", description: "The largest crystal formation in existence." },
  ],
};

const STORY_TEMPLATES: Record<string, PlanetStoryArc[]> = {
  "Verdant Cluster": [
    { premise: "This world was once a paradise, but something has corrupted its heart.", midpoint: "The corruption stems from an ancient entity awakened by careless explorers.", resolution: "By showing mercy, you heal the land's wound.", theme: "nature's resilience" },
    { premise: "The creatures here guard something precious - a seed of cosmic origin.", midpoint: "The seed contains the memories of a dead world, seeking new soil.", resolution: "Your choice determines whether new life blooms or old grief remains.", theme: "renewal and loss" },
    { premise: "Travelers speak of a garden where wishes come true.", midpoint: "The garden grants wishes but takes something in return.", resolution: "True wishes require no sacrifice but genuine desire.", theme: "desire and sacrifice" },
  ],
  "Frozen Expanse": [
    { premise: "This world wasn't always frozen - something catastrophic changed it.", midpoint: "An ancient machine was built to restore warmth, but it remains incomplete.", resolution: "The ice holds memories of those who didn't survive - will you honor them?", theme: "memory and preservation" },
    { premise: "Beneath the ice, a civilization sleeps in stasis.", midpoint: "They froze themselves to escape something worse than death.", resolution: "Some things should remain sleeping.", theme: "consequences of fear" },
    { premise: "The aurora here isn't natural - it's a signal.", midpoint: "Someone has been calling for help for millennia.", resolution: "Whether you answer changes everything.", theme: "isolation and hope" },
  ],
  "Inferno Sector": [
    { premise: "Fire forged this world, and fire will unmake it.", midpoint: "The core is dying - soon, nothing will remain but ash.", resolution: "Even dying worlds can give birth to new ones.", theme: "endings and beginnings" },
    { premise: "Creatures of flame wage an eternal war here.", midpoint: "The war began over a misunderstanding, now forgotten.", resolution: "Peace requires someone to remember why it matters.", theme: "forgotten conflicts" },
    { premise: "This world burns, but its inhabitants call it home.", midpoint: "They've adapted to survive, but at what cost?", resolution: "Survival isn't the same as living.", theme: "adaptation and identity" },
  ],
  "Void Realm": [
    { premise: "This place shouldn't exist. Reality itself rejects it.", midpoint: "It's a scar in space-time, caused by the same event you're trying to prevent.", resolution: "The void remembers what was lost.", theme: "consequences of cosmic events" },
    { premise: "Echoes of other dimensions bleed through here.", midpoint: "Some echoes are warnings. Some are threats.", resolution: "Every reality has the same choice to make.", theme: "parallel possibilities" },
    { premise: "Nothing here is real, yet everything has meaning.", midpoint: "Meaning is what we give to emptiness.", resolution: "The void reflects your own heart.", theme: "meaning in emptiness" },
  ],
  "Celestial Heights": [
    { premise: "The stars here are alive, and they're watching.", midpoint: "They've watched civilizations rise and fall, always neutral.", resolution: "Your actions will be remembered in starlight.", theme: "cosmic witness" },
    { premise: "This is where souls go when bodies fail.", midpoint: "Some souls refuse to move on. Some cannot.", resolution: "Peace comes from letting go.", theme: "acceptance and release" },
    { premise: "At the height of existence, perspective changes everything.", midpoint: "From here, you can see how small and how vast everything is.", resolution: "Size doesn't determine significance.", theme: "perspective and significance" },
  ],
};

const LORE_TEMPLATES: Record<string, string[][]> = {
  "Verdant Cluster": [
    ["In the beginning, there was only the seed.", "From the seed, all green things grew.", "We are children of that first bloom."],
    ["The forest remembers. Every footstep, every cut branch.", "It forgives, but it never forgets."],
    ["They came from the stars seeking paradise.", "They found it, but could not leave it unchanged.", "We are what remains of their touch."],
    ["The roots connect us all.", "What happens to one tree happens to the forest.", "We are one organism wearing many faces."],
  ],
  "Frozen Expanse": [
    ["Before the ice, this was a world of rivers.", "The rivers still flow beneath our feet.", "Someday they will flow again."],
    ["We did not choose the cold. It chose us.", "In time, we learned to love what trapped us.", "The ice is our home now."],
    ["The aurora speaks to those who listen.", "It tells of worlds beyond the ice.", "It promises nothing, but we still hope."],
    ["Preservation through freezing.", "Our ancestors sleep, waiting.", "When they wake, will they recognize us?"],
  ],
  "Inferno Sector": [
    ["Fire cleanses. Fire renews.", "We were born from the ashes of the old world.", "We will be the ashes of the next."],
    ["The core's heat is not destruction.", "It is the heartbeat of creation.", "New worlds are forged in this crucible."],
    ["They say nothing can survive here.", "We are the proof that they were wrong.", "Life finds a way. Life always finds a way."],
    ["The volcano gave us everything.", "It took everything too.", "Balance is paid in ash."],
  ],
  "Void Realm": [
    ["In the void, identity becomes fluid.", "Who you were matters less than who you choose to be.", "Choose wisely. The void remembers."],
    ["Nothing exists here.", "Yet here we are, existing.", "Perhaps existence is a choice."],
    ["The fracture between worlds began here.", "It will end here too.", "Unless something changes."],
    ["Echoes of other realities bleed through.", "We are not alone in our struggle.", "Every version of us faces the same choice."],
  ],
  "Celestial Heights": [
    ["The stars watch, but they do not judge.", "They have seen too much to judge.", "They only witness."],
    ["At this height, gravity is suggestion.", "At this height, time is poetry.", "At this height, we are truly free."],
    ["The light here comes from within.", "It has traveled across the universe to reach us.", "We are all made of starlight."],
    ["Heaven is not a place. It is a perspective.", "From here, everything is beautiful.", "Even the pain. Especially the pain."],
  ],
};

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

export function generatePlanetAreas(
  planetId: number,
  planetName: string,
  biome: string,
  region: string,
  difficulty: number,
  totalShards: number,
  minEnemies: number,
  keysRequired: number
): PlanetLore {
  const rand = seededRandom(planetId * 1000 + 42);
  const baseBiome = getBiomeForPlanet(biome);
  const baseBiomeId = baseBiome.id as BiomeId;
  
  const templates = AREA_TEMPLATES[baseBiomeId] || AREA_TEMPLATES.forest;
  const storyArcs = STORY_TEMPLATES[region] || STORY_TEMPLATES["Verdant Cluster"];
  const loreTemplates = LORE_TEMPLATES[region] || LORE_TEMPLATES["Verdant Cluster"];
  
  const numAreas = Math.min(3 + Math.floor(difficulty * 0.8), 6);
  const storyArc = storyArcs[planetId % storyArcs.length];
  
  const shardsPerArea = Math.floor(totalShards / numAreas);
  const extraShards = totalShards % numAreas;
  
  const enemiesPerArea = Math.floor(minEnemies / (numAreas - 1));
  const extraEnemies = minEnemies % (numAreas - 1);
  
  const areas: PlanetArea[] = [];
  let keysPlaced = 0;
  
  for (let i = 0; i < numAreas; i++) {
    const template = templates[i % templates.length];
    const areaId = `${planetId}-area-${i}`;
    
    const connections: AreaConnection[] = [];
    if (i > 0) {
      connections.push({
        targetAreaId: `${planetId}-area-${i - 1}`,
        direction: "south",
        type: i === 1 ? "path" : rand() > 0.5 ? "door" : "cave",
        x: 10,
        y: 1,
        locked: false,
      });
    }
    if (i < numAreas - 1) {
      const needsKey = keysPlaced < keysRequired && i === keysRequired;
      connections.push({
        targetAreaId: `${planetId}-area-${i + 1}`,
        direction: "north",
        type: i === numAreas - 2 ? "gate" : rand() > 0.5 ? "door" : "path",
        x: 10,
        y: 14,
        locked: needsKey,
        keyRequired: needsKey,
      });
    }
    
    const loreNodes: LoreNode[] = [];
    if (rand() > 0.4 && i < numAreas - 1) {
      const loreContent = loreTemplates[Math.floor(rand() * loreTemplates.length)];
      loreNodes.push({
        id: `${areaId}-lore`,
        type: ["tablet", "terminal", "memory", "inscription", "echo", "artifact"][Math.floor(rand() * 6)] as LoreNode["type"],
        title: `${planetName} Codex Entry ${i + 1}`,
        content: loreContent,
        x: 3 + Math.floor(rand() * 14),
        y: 3 + Math.floor(rand() * 10),
      });
    }
    
    const isLastArea = i === numAreas - 1;
    const hasKey = !isLastArea && keysPlaced < keysRequired && rand() > 0.3;
    if (hasKey) keysPlaced++;
    
    const areaShards = shardsPerArea + (i < extraShards ? 1 : 0);
    const areaEnemies = isLastArea ? 0 : enemiesPerArea + (i < extraEnemies ? 1 : 0);
    
    areas.push({
      id: areaId,
      name: template.name,
      biome: template.biomeOverride || baseBiomeId,
      description: template.description,
      width: 20,
      height: 16,
      connections,
      content: {
        enemyCount: areaEnemies,
        shardCount: areaShards,
        hasKey,
        loreNodes,
      },
      isEntrance: i === 0,
      isBossLair: i === numAreas - 1,
      isCoreRoom: i === numAreas - 1,
      isPuzzleChamber: i === numAreas - 1,
      layoutSeed: Math.floor(rand() * 100000),
    });
  }
  
  while (keysPlaced < keysRequired) {
    const validAreas = areas.filter(a => !a.isBossLair && !a.content.hasKey);
    if (validAreas.length > 0) {
      const targetArea = validAreas[Math.floor(rand() * validAreas.length)];
      targetArea.content.hasKey = true;
      keysPlaced++;
    } else {
      break;
    }
  }
  
  return {
    planetId,
    storyArc,
    areas,
    totalShards,
    totalEnemies: minEnemies,
    totalKeys: keysRequired,
  };
}

export function getAreaBiomeConfig(area: PlanetArea): typeof BIOME_CATALOG[BiomeId] {
  return BIOME_CATALOG[area.biome] || BIOME_CATALOG.forest;
}
