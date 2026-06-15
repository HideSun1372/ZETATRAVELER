import { BiomeId, BIOME_CATALOG, getBiomeForPlanet } from "./biomes";
import { PuzzleType, AttackPattern, PlanetEnemy } from "./planets";

export type RouteType = "main" | "branch" | "secret";

export interface AreaConnection {
  targetAreaId: string;
  direction: "north" | "south" | "east" | "west";
  type: "door" | "portal" | "path" | "gate" | "cave" | "stairs";
  routeType: RouteType;
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

export type RoomArchetype = 
  | "entrance" 
  | "corridor" 
  | "combat_arena" 
  | "puzzle_chamber" 
  | "story_hub" 
  | "rest_area" 
  | "treasure_vault" 
  | "traversal" 
  | "crossroads"
  | "boss_lair" 
  | "secret_room"
  | "observation"
  | "memorial";

export interface PlanetArea {
  id: string;
  name: string;
  biome: BiomeId;
  description: string;
  archetype: RoomArchetype;
  width: number;
  height: number;
  connections: AreaConnection[];
  content: AreaContent;
  isBossLair?: boolean;
  isPuzzleChamber?: boolean;
  isEntrance?: boolean;
  isCoreRoom?: boolean;
  isSecretRoom?: boolean;
  isMainPath: boolean;
  mainPathOrder: number;
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

const ARCHETYPE_NAMES: Record<RoomArchetype, Record<BiomeId, string[]>> = {
  entrance: {
    forest: ["Forest Edge", "Woodland Gate", "Canopy Entrance", "Trail Head"],
    cave: ["Cave Mouth", "Rocky Entrance", "Cavern Gate", "Underground Access"],
    ice: ["Frozen Pass", "Ice Gate", "Glacier Entry", "Snow Path"],
    volcanic: ["Ash Gate", "Lava Edge", "Volcanic Path", "Ember Entrance"],
    void: ["Rift Entrance", "Void Gate", "Reality Edge", "Null Entry"],
    celestial: ["Star Gate", "Celestial Entry", "Light Path", "Heaven's Gate"],
    garden: ["Garden Gate", "Paradise Entry", "Floral Arch", "Eden's Door"],
    ruins: ["Ruined Gate", "Ancient Entry", "Fallen Arch", "Time's Threshold"],
    tech: ["Airlock", "Access Port", "Entry Terminal", "Docking Bay"],
    marsh: ["Wetland Edge", "Marsh Gate", "Bog Entry", "Mire Path"],
    desert: ["Sand Gate", "Dune Entry", "Desert Edge", "Oasis Path"],
    crystal: ["Crystal Gate", "Prism Entry", "Faceted Arch", "Light Threshold"],
  },
  corridor: {
    forest: ["Winding Trail", "Forest Path", "Leafy Corridor", "Root Passage", "Overgrown Way"],
    cave: ["Narrow Tunnel", "Stone Corridor", "Dark Passage", "Rocky Way", "Dim Hallway"],
    ice: ["Frozen Corridor", "Ice Tunnel", "Glacial Path", "Frost Passage", "Snow Way"],
    volcanic: ["Ash Corridor", "Lava Tube", "Obsidian Path", "Ember Passage", "Heated Way"],
    void: ["Null Corridor", "Void Path", "Reality Gap", "Echo Passage", "Empty Way"],
    celestial: ["Star Path", "Light Corridor", "Cosmic Way", "Stellar Passage", "Radiant Hall"],
    garden: ["Flower Walk", "Hedge Path", "Petal Corridor", "Bloom Way", "Garden Path"],
    ruins: ["Crumbling Hall", "Ancient Corridor", "Stone Way", "Fallen Path", "Dusty Passage"],
    tech: ["Access Corridor", "Maintenance Tunnel", "Service Way", "Tech Passage", "Data Lane"],
    marsh: ["Boardwalk", "Murky Path", "Wet Corridor", "Bog Walk", "Mist Way"],
    desert: ["Sand Path", "Dune Corridor", "Rocky Way", "Desert Trail", "Arid Passage"],
    crystal: ["Prism Corridor", "Crystal Path", "Faceted Way", "Light Tunnel", "Gem Passage"],
  },
  combat_arena: {
    forest: ["Battle Glade", "Warrior's Grove", "Fighting Ground", "Arena Clearing"],
    cave: ["Battle Cavern", "Fight Chamber", "Arena Cave", "Combat Hollow"],
    ice: ["Frozen Arena", "Ice Battle Field", "Frost Ring", "Combat Glacier"],
    volcanic: ["Lava Arena", "Fire Pit", "Volcanic Ring", "Ember Stage"],
    void: ["Void Arena", "Null Ring", "Reality Stage", "Echo Chamber"],
    celestial: ["Star Arena", "Celestial Ring", "Light Stage", "Cosmic Court"],
    garden: ["Duel Garden", "Battle Bloom", "Fighting Grounds", "Arena Meadow"],
    ruins: ["Fallen Arena", "Ancient Ring", "Battle Ruins", "Combat Hall"],
    tech: ["Combat Bay", "Training Arena", "Battle Station", "Fight Deck"],
    marsh: ["Murky Arena", "Bog Ring", "Swamp Stage", "Wet Battleground"],
    desert: ["Sand Arena", "Dune Ring", "Desert Stage", "Oasis Battle"],
    crystal: ["Prism Arena", "Crystal Ring", "Faceted Stage", "Gem Battleground"],
  },
  puzzle_chamber: {
    forest: ["Mystic Grove", "Puzzle Glade", "Riddle Woods", "Mystery Clearing"],
    cave: ["Puzzle Cavern", "Riddle Chamber", "Mystery Cave", "Enigma Hollow"],
    ice: ["Frozen Puzzle", "Ice Riddle", "Frost Mystery", "Glacial Enigma"],
    volcanic: ["Fire Puzzle", "Lava Riddle", "Ember Mystery", "Volcanic Enigma"],
    void: ["Void Puzzle", "Null Riddle", "Reality Mystery", "Echo Enigma"],
    celestial: ["Star Puzzle", "Celestial Riddle", "Light Mystery", "Cosmic Enigma"],
    garden: ["Garden Maze", "Floral Puzzle", "Bloom Riddle", "Eden's Mystery"],
    ruins: ["Ancient Puzzle", "Ruin Riddle", "Time's Mystery", "Lost Enigma"],
    tech: ["Logic Core", "Data Puzzle", "Circuit Riddle", "System Mystery"],
    marsh: ["Murky Puzzle", "Bog Riddle", "Swamp Mystery", "Mist Enigma"],
    desert: ["Sand Puzzle", "Dune Riddle", "Desert Mystery", "Oasis Enigma"],
    crystal: ["Prism Puzzle", "Crystal Riddle", "Light Mystery", "Gem Enigma"],
  },
  story_hub: {
    forest: ["Ancient Tree", "Sacred Grove", "Story Circle", "Memory Wood"],
    cave: ["Echo Chamber", "Memory Cavern", "Story Stone", "Ancient Hollow"],
    ice: ["Frozen Memory", "Ice Archive", "Frost Chronicle", "Glacial Record"],
    volcanic: ["Flame Archive", "Fire Memory", "Ember Chronicle", "Lava Record"],
    void: ["Memory Fragment", "Void Archive", "Echo Record", "Null Chronicle"],
    celestial: ["Star Archive", "Celestial Memory", "Light Chronicle", "Cosmic Record"],
    garden: ["Memory Garden", "Story Bloom", "Chronicle Meadow", "Eden's Record"],
    ruins: ["Ancient Library", "Lost Archive", "Time's Chronicle", "Forgotten Record"],
    tech: ["Data Archive", "Memory Core", "Info Hub", "Record Terminal"],
    marsh: ["Murky Memory", "Bog Archive", "Swamp Chronicle", "Mist Record"],
    desert: ["Sand Archive", "Dune Memory", "Desert Chronicle", "Oasis Record"],
    crystal: ["Prism Archive", "Crystal Memory", "Light Chronicle", "Gem Record"],
  },
  rest_area: {
    forest: ["Peaceful Glade", "Safe Haven", "Quiet Grove", "Rest Clearing", "Serene Wood"],
    cave: ["Safe Chamber", "Rest Hollow", "Quiet Cavern", "Peaceful Cave", "Sanctuary"],
    ice: ["Warm Nook", "Ice Shelter", "Frost Haven", "Glacial Rest", "Snow Refuge"],
    volcanic: ["Cool Chamber", "Safe Ledge", "Rest Ridge", "Ember Haven", "Ash Shelter"],
    void: ["Stable Space", "Calm Void", "Rest Pocket", "Peaceful Null", "Echo Haven"],
    celestial: ["Star Rest", "Celestial Haven", "Light Shelter", "Cosmic Refuge", "Radiant Nook"],
    garden: ["Rest Garden", "Peaceful Meadow", "Calm Grove", "Serene Bloom", "Eden's Rest"],
    ruins: ["Intact Chamber", "Safe Room", "Rest Hall", "Preserved Nook", "Ancient Refuge"],
    tech: ["Charging Bay", "Rest Pod", "Safe Room", "Recovery Station", "Calm Terminal"],
    marsh: ["Dry Ground", "Safe Island", "Rest Mound", "Peaceful Hollow", "Calm Bog"],
    desert: ["Shaded Oasis", "Cool Cave", "Rest Dune", "Peaceful Shade", "Sand Haven"],
    crystal: ["Calm Prism", "Crystal Rest", "Serene Facet", "Peaceful Gem", "Light Haven"],
  },
  treasure_vault: {
    forest: ["Hidden Hollow", "Secret Glade", "Treasure Grove", "Buried Cache"],
    cave: ["Treasure Cave", "Hidden Chamber", "Gem Hollow", "Secret Vault"],
    ice: ["Frozen Vault", "Ice Treasury", "Glacial Cache", "Frost Hoard"],
    volcanic: ["Obsidian Vault", "Fire Treasury", "Lava Cache", "Ember Hoard"],
    void: ["Lost Vault", "Void Treasury", "Null Cache", "Echo Hoard"],
    celestial: ["Star Vault", "Celestial Treasury", "Light Cache", "Cosmic Hoard"],
    garden: ["Secret Garden", "Hidden Bloom", "Treasure Meadow", "Eden's Cache"],
    ruins: ["Ancient Vault", "Lost Treasury", "Ruin Cache", "Forgotten Hoard"],
    tech: ["Secure Storage", "Data Vault", "Tech Cache", "Locked Bay"],
    marsh: ["Sunken Chest", "Bog Vault", "Hidden Cache", "Murky Hoard"],
    desert: ["Buried Vault", "Sand Treasury", "Hidden Tomb", "Desert Cache"],
    crystal: ["Gem Vault", "Crystal Treasury", "Prism Cache", "Faceted Hoard"],
  },
  traversal: {
    forest: ["Vine Bridge", "Tree Crossing", "Root Maze", "Canopy Walk"],
    cave: ["Chasm Bridge", "Rock Climb", "Gap Crossing", "Ledge Walk"],
    ice: ["Ice Bridge", "Glacier Crossing", "Frozen Climb", "Snow Walk"],
    volcanic: ["Lava Bridge", "Fire Crossing", "Obsidian Walk", "Ember Path"],
    void: ["Reality Bridge", "Void Crossing", "Null Walk", "Echo Path"],
    celestial: ["Star Bridge", "Light Crossing", "Cosmic Walk", "Celestial Path"],
    garden: ["Flower Bridge", "Hedge Maze", "Petal Walk", "Bloom Crossing"],
    ruins: ["Fallen Bridge", "Ruin Climb", "Ancient Crossing", "Stone Walk"],
    tech: ["Conveyor", "Lift Shaft", "Platform Crossing", "Tech Bridge"],
    marsh: ["Lily Path", "Bog Bridge", "Mist Crossing", "Swamp Walk"],
    desert: ["Dune Climb", "Sand Bridge", "Rock Crossing", "Desert Walk"],
    crystal: ["Prism Bridge", "Crystal Crossing", "Faceted Walk", "Gem Path"],
  },
  crossroads: {
    forest: ["Four Paths", "Forest Crossroads", "Trail Junction", "Meeting Grove"],
    cave: ["Cavern Junction", "Tunnel Crossroads", "Cave Meeting", "Stone Hub"],
    ice: ["Ice Junction", "Glacier Hub", "Frozen Crossroads", "Snow Meeting"],
    volcanic: ["Lava Junction", "Fire Crossroads", "Ember Hub", "Ash Meeting"],
    void: ["Void Junction", "Reality Crossroads", "Null Hub", "Echo Meeting"],
    celestial: ["Star Junction", "Celestial Hub", "Light Crossroads", "Cosmic Meeting"],
    garden: ["Garden Junction", "Flower Hub", "Bloom Crossroads", "Path Meeting"],
    ruins: ["Ruin Junction", "Ancient Hub", "Stone Crossroads", "Hall Meeting"],
    tech: ["System Hub", "Tech Junction", "Data Crossroads", "Terminal Meeting"],
    marsh: ["Bog Junction", "Marsh Hub", "Swamp Crossroads", "Mire Meeting"],
    desert: ["Dune Junction", "Sand Hub", "Desert Crossroads", "Oasis Meeting"],
    crystal: ["Crystal Junction", "Prism Hub", "Gem Crossroads", "Facet Meeting"],
  },
  boss_lair: {
    forest: ["Heart of the Forest", "The Great Tree", "Ancient Core", "Primal Grove"],
    cave: ["The Depths", "Heart Chamber", "Core Cavern", "Primal Cave"],
    ice: ["Frozen Heart", "Eternal Glacier", "Core Ice", "Primal Cold"],
    volcanic: ["The Caldera", "Magma Heart", "Core Fire", "Primal Flame"],
    void: ["The Singularity", "Void Heart", "Core Null", "Primal Nothing"],
    celestial: ["Heaven's Throne", "Star Heart", "Core Light", "Primal Radiance"],
    garden: ["Heart of Eden", "Eternal Bloom", "Core Garden", "Primal Life"],
    ruins: ["The Throne Room", "Ancient Heart", "Core Chamber", "Primal Hall"],
    tech: ["Central Core", "Main Terminal", "Prime Hub", "Control Room"],
    marsh: ["The Deep Fen", "Marsh Heart", "Core Bog", "Primal Swamp"],
    desert: ["The Scorched Heart", "Eternal Dune", "Core Sand", "Primal Heat"],
    crystal: ["The Heart Crystal", "Prism Core", "Eternal Gem", "Primal Light"],
  },
  secret_room: {
    forest: ["Hidden Grove", "Secret Hollow", "Mystery Wood", "Lost Path"],
    cave: ["Hidden Cave", "Secret Tunnel", "Mystery Chamber", "Lost Hollow"],
    ice: ["Hidden Glacier", "Secret Ice", "Mystery Frost", "Lost Cold"],
    volcanic: ["Hidden Vent", "Secret Magma", "Mystery Fire", "Lost Ember"],
    void: ["Hidden Rift", "Secret Null", "Mystery Echo", "Lost Void"],
    celestial: ["Hidden Star", "Secret Light", "Mystery Radiance", "Lost Heaven"],
    garden: ["Hidden Bloom", "Secret Meadow", "Mystery Flower", "Lost Paradise"],
    ruins: ["Hidden Chamber", "Secret Hall", "Mystery Room", "Lost Archive"],
    tech: ["Hidden Lab", "Secret Bay", "Mystery Terminal", "Lost Data"],
    marsh: ["Hidden Island", "Secret Bog", "Mystery Swamp", "Lost Mire"],
    desert: ["Hidden Oasis", "Secret Dune", "Mystery Sand", "Lost Cave"],
    crystal: ["Hidden Facet", "Secret Prism", "Mystery Gem", "Lost Crystal"],
  },
  observation: {
    forest: ["Canopy View", "High Branch", "Forest Overlook", "Treetop Vista"],
    cave: ["Crystal View", "High Ledge", "Cave Overlook", "Deep Vista"],
    ice: ["Glacier View", "Ice Peak", "Frozen Overlook", "Snow Vista"],
    volcanic: ["Caldera View", "Lava Overlook", "Fire Peak", "Ash Vista"],
    void: ["Reality View", "Void Overlook", "Null Peak", "Echo Vista"],
    celestial: ["Star View", "Celestial Overlook", "Light Peak", "Cosmic Vista"],
    garden: ["Garden View", "Bloom Overlook", "Flower Peak", "Eden Vista"],
    ruins: ["Tower Top", "Ruin Overlook", "Ancient Peak", "Lost Vista"],
    tech: ["Observation Deck", "Scan Bay", "View Terminal", "Data Vista"],
    marsh: ["Mist View", "Bog Overlook", "Swamp Peak", "Murky Vista"],
    desert: ["Dune View", "Sand Overlook", "Desert Peak", "Oasis Vista"],
    crystal: ["Prism View", "Crystal Overlook", "Gem Peak", "Light Vista"],
  },
  memorial: {
    forest: ["Memory Glade", "Fallen Tree", "Quiet Memorial", "Forest Shrine"],
    cave: ["Silent Chamber", "Stone Memorial", "Echo Shrine", "Quiet Depths"],
    ice: ["Frozen Memorial", "Ice Shrine", "Cold Memory", "Eternal Frost"],
    volcanic: ["Ash Memorial", "Fire Shrine", "Ember Memory", "Eternal Flame"],
    void: ["Lost Memorial", "Void Shrine", "Echo Memory", "Eternal Null"],
    celestial: ["Star Memorial", "Light Shrine", "Celestial Memory", "Eternal Radiance"],
    garden: ["Memorial Garden", "Quiet Bloom", "Flower Shrine", "Eternal Paradise"],
    ruins: ["Fallen Statue", "Ancient Memorial", "Lost Shrine", "Eternal Stone"],
    tech: ["Data Memorial", "Lost Terminal", "Echo Core", "Eternal Record"],
    marsh: ["Sunken Memorial", "Bog Shrine", "Murky Memory", "Eternal Mist"],
    desert: ["Sand Memorial", "Buried Shrine", "Desert Memory", "Eternal Dune"],
    crystal: ["Crystal Memorial", "Prism Shrine", "Gem Memory", "Eternal Facet"],
  },
};

const ARCHETYPE_DESCRIPTIONS: Record<RoomArchetype, string[]> = {
  entrance: [
    "The journey begins here, with untold mysteries ahead.",
    "A threshold between worlds, neither here nor there.",
    "First steps into the unknown beckon you forward.",
    "The boundary between safety and adventure.",
  ],
  corridor: [
    "A simple passage connecting greater places.",
    "The path winds onward, its destination unclear.",
    "Footsteps echo in the empty space.",
    "A quiet stretch between moments of discovery.",
    "The way forward is clear, if unremarkable.",
  ],
  combat_arena: [
    "Something lurks here, ready for confrontation.",
    "The air crackles with tension and danger.",
    "This place has seen many battles.",
    "Prepare yourself. You are not alone.",
  ],
  puzzle_chamber: [
    "A riddle waits to be solved.",
    "The room itself seems to test your wit.",
    "Patterns and secrets hide in plain sight.",
    "Think carefully. The answer is here.",
  ],
  story_hub: [
    "Ancient knowledge lingers in these walls.",
    "Stories of the past echo softly.",
    "Wisdom waits for those who seek it.",
    "The history of this place unfolds before you.",
  ],
  rest_area: [
    "A moment of peace in the chaos.",
    "Safety, however brief, is a precious gift.",
    "Rest now. The journey continues soon.",
    "A quiet sanctuary from the dangers beyond.",
    "Even heroes need to catch their breath.",
  ],
  treasure_vault: [
    "Wealth and wonder await the bold.",
    "Riches gathered from across the cosmos.",
    "Fortune favors those who explore.",
    "Precious things hide in unexpected places.",
  ],
  traversal: [
    "The path requires skill and courage.",
    "Not all journeys are simple walks.",
    "Test your agility and determination.",
    "The way forward demands effort.",
  ],
  crossroads: [
    "Many paths diverge from this point.",
    "Choose your direction carefully.",
    "All roads lead somewhere. But where?",
    "A nexus of possibilities awaits.",
  ],
  boss_lair: [
    "Power radiates from every surface.",
    "The heart of this world beats here.",
    "Something ancient and mighty calls this home.",
    "The final challenge awaits.",
  ],
  secret_room: [
    "Few have found this hidden place.",
    "Secrets hide in the spaces between.",
    "The curious are rewarded here.",
    "Not all paths are meant to be found.",
  ],
  observation: [
    "From here, the world stretches endlessly.",
    "A vantage point reveals hidden truths.",
    "See beyond the immediate horizon.",
    "Perspective changes everything.",
  ],
  memorial: [
    "Something important happened here.",
    "Memory lingers in this solemn place.",
    "Honor the past. Learn from it.",
    "The echoes of history speak softly.",
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

function shuffleArray<T>(array: T[], rand: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface RoomNode {
  id: string;
  archetype: RoomArchetype;
  depth: number;
  connections: string[];
  isMainPath: boolean;
  isBranch: boolean;
}

function generateWorldGraph(
  planetId: number,
  difficulty: number,
  rand: () => number
): RoomNode[] {
  const baseRoomCount = 8 + difficulty * 3;
  const roomCount = baseRoomCount + Math.floor(rand() * 4);
  
  const mainPathLength = Math.floor(roomCount * 0.5);
  const branchCount = Math.floor(roomCount * 0.3);
  const secretRoomCount = Math.max(1, Math.floor(difficulty / 2));
  
  const nodes: RoomNode[] = [];
  
  const mainPathArchetypes: RoomArchetype[] = [
    "entrance",
    ...shuffleArray<RoomArchetype>(["corridor", "story_hub", "crossroads", "traversal", "observation"], rand).slice(0, 2),
    "combat_arena",
    ...shuffleArray<RoomArchetype>(["corridor", "rest_area", "puzzle_chamber", "memorial"], rand).slice(0, 2),
    "combat_arena",
    ...shuffleArray<RoomArchetype>(["crossroads", "story_hub", "traversal"], rand).slice(0, 1),
    "boss_lair",
  ];
  
  while (mainPathArchetypes.length < mainPathLength) {
    const fillers: RoomArchetype[] = ["corridor", "rest_area", "observation", "memorial", "traversal"];
    mainPathArchetypes.splice(
      mainPathArchetypes.length - 1,
      0,
      fillers[Math.floor(rand() * fillers.length)]
    );
  }
  
  for (let i = 0; i < mainPathArchetypes.length; i++) {
    const node: RoomNode = {
      id: `${planetId}-area-${i}`,
      archetype: mainPathArchetypes[i],
      depth: i,
      connections: [],
      isMainPath: true,
      isBranch: false,
    };
    
    if (i > 0) {
      node.connections.push(`${planetId}-area-${i - 1}`);
      nodes[i - 1].connections.push(node.id);
    }
    
    nodes.push(node);
  }
  
  const branchArchetypes: RoomArchetype[] = [
    "treasure_vault", "rest_area", "story_hub", "combat_arena",
    "observation", "memorial", "corridor", "puzzle_chamber"
  ];
  
  let branchIndex = mainPathArchetypes.length;
  for (let b = 0; b < branchCount; b++) {
    const attachPoint = 1 + Math.floor(rand() * (nodes.length - 2));
    const attachNode = nodes[attachPoint];
    
    if (attachNode.connections.length >= 4) continue;
    
    const branchLength = 1 + Math.floor(rand() * 3);
    let prevId = attachNode.id;
    
    for (let j = 0; j < branchLength; j++) {
      const archetype = branchArchetypes[Math.floor(rand() * branchArchetypes.length)];
      const branchNode: RoomNode = {
        id: `${planetId}-area-${branchIndex}`,
        archetype,
        depth: attachNode.depth + j + 1,
        connections: [prevId],
        isMainPath: false,
        isBranch: true,
      };
      
      const prevNode = nodes.find(n => n.id === prevId);
      if (prevNode) prevNode.connections.push(branchNode.id);
      
      nodes.push(branchNode);
      prevId = branchNode.id;
      branchIndex++;
    }
  }
  
  for (let s = 0; s < secretRoomCount; s++) {
    const attachPoint = 2 + Math.floor(rand() * (nodes.length - 3));
    const attachNode = nodes[attachPoint];
    
    if (attachNode.connections.length >= 4) continue;
    
    const secretNode: RoomNode = {
      id: `${planetId}-area-${branchIndex}`,
      archetype: "secret_room",
      depth: attachNode.depth + 1,
      connections: [attachNode.id],
      isMainPath: false,
      isBranch: true,
    };
    
    attachNode.connections.push(secretNode.id);
    nodes.push(secretNode);
    branchIndex++;
  }
  
  return nodes;
}

function getDirectionBetweenRooms(
  fromIndex: number,
  toIndex: number,
  totalRooms: number,
  rand: () => number
): "north" | "south" | "east" | "west" {
  if (toIndex > fromIndex) {
    return rand() > 0.3 ? "north" : (rand() > 0.5 ? "east" : "west");
  } else {
    return rand() > 0.3 ? "south" : (rand() > 0.5 ? "west" : "east");
  }
}

function getOppositeDirection(dir: "north" | "south" | "east" | "west"): "north" | "south" | "east" | "west" {
  switch (dir) {
    case "north": return "south";
    case "south": return "north";
    case "east": return "west";
    case "west": return "east";
  }
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
  
  const storyArcs = STORY_TEMPLATES[region] || STORY_TEMPLATES["Verdant Cluster"];
  const loreTemplates = LORE_TEMPLATES[region] || LORE_TEMPLATES["Verdant Cluster"];
  const storyArc = storyArcs[planetId % storyArcs.length];
  
  const worldGraph = generateWorldGraph(planetId, difficulty, rand);
  const numAreas = worldGraph.length;
  
  const mainPathNodes = worldGraph.filter(n => n.isMainPath);
  const mainPathCount = mainPathNodes.length;
  
  const combatRooms = worldGraph.filter(n => 
    n.archetype === "combat_arena" || n.archetype === "boss_lair"
  );
  const treasureRooms = worldGraph.filter(n => 
    n.archetype === "treasure_vault" || n.archetype === "secret_room"
  );
  const storyRooms = worldGraph.filter(n => 
    n.archetype === "story_hub" || n.archetype === "memorial"
  );
  
  const enemiesPerCombatRoom = Math.max(1, Math.floor(minEnemies / Math.max(1, combatRooms.length)));
  let remainingEnemies = minEnemies;
  
  const shardsPerTreasure = Math.max(1, Math.floor(totalShards / Math.max(1, treasureRooms.length + 2)));
  let remainingShards = totalShards;
  
  let keysPlaced = 0;
  
  const areas: PlanetArea[] = [];
  const usedDirections: Map<string, Set<string>> = new Map();
  const connectionDirections: Map<string, "north" | "south" | "east" | "west"> = new Map();
  
  for (const node of worldGraph) {
    for (const connId of node.connections) {
      const pairKey = [node.id, connId].sort().join("-");
      if (connectionDirections.has(pairKey)) continue;
      
      const connNode = worldGraph.find(n => n.id === connId);
      if (!connNode) continue;
      
      const nodeDirections = usedDirections.get(node.id) || new Set<string>();
      const connDirections = usedDirections.get(connId) || new Set<string>();
      
      const availableDirections: ("north" | "south" | "east" | "west")[] = 
        (["north", "south", "east", "west"] as const).filter(d => 
          !nodeDirections.has(d) && !connDirections.has(getOppositeDirection(d))
        );
      
      if (availableDirections.length === 0) continue;
      
      let direction: "north" | "south" | "east" | "west";
      if (connNode.depth > node.depth) {
        direction = availableDirections.includes("north") ? "north" : availableDirections[0];
      } else if (connNode.depth < node.depth) {
        direction = availableDirections.includes("south") ? "south" : availableDirections[0];
      } else {
        direction = availableDirections[Math.floor(rand() * availableDirections.length)];
      }
      
      nodeDirections.add(direction);
      connDirections.add(getOppositeDirection(direction));
      usedDirections.set(node.id, nodeDirections);
      usedDirections.set(connId, connDirections);
      
      connectionDirections.set(`${node.id}->${connId}`, direction);
      connectionDirections.set(`${connId}->${node.id}`, getOppositeDirection(direction));
    }
  }
  
  for (const node of worldGraph) {
    const nameOptions = ARCHETYPE_NAMES[node.archetype]?.[baseBiomeId] || 
                        ARCHETYPE_NAMES[node.archetype]?.forest || 
                        ["Unknown Area"];
    const name = nameOptions[Math.floor(rand() * nameOptions.length)];
    
    const descOptions = ARCHETYPE_DESCRIPTIONS[node.archetype] || ["A mysterious place."];
    const description = descOptions[Math.floor(rand() * descOptions.length)];
    
    const connections: AreaConnection[] = [];
    
    for (const connId of node.connections) {
      const connNode = worldGraph.find(n => n.id === connId);
      if (!connNode) continue;
      
      const direction = connectionDirections.get(`${node.id}->${connId}`);
      if (!direction) continue;
      
      const needsKey = keysPlaced < keysRequired && 
                       node.archetype === "crossroads" && 
                       connNode.isMainPath && 
                       connNode.depth > node.depth;
      
      const routeType: RouteType = 
        (node.archetype === "secret_room" || connNode.archetype === "secret_room") ? "secret" :
        (node.isMainPath && connNode.isMainPath) ? "main" : "branch";
      
      connections.push({
        targetAreaId: connId,
        direction,
        type: node.archetype === "secret_room" || connNode?.archetype === "secret_room" 
          ? "cave" 
          : node.archetype === "boss_lair" || connNode?.archetype === "boss_lair"
            ? "gate"
            : routeType === "main" ? "path" : "door",
        routeType,
        x: 10,
        y: direction === "north" ? 2 : direction === "south" ? 14 : 8,
        locked: needsKey,
        keyRequired: needsKey,
      });
      
      if (needsKey) keysPlaced++;
    }
    
    const loreNodes: LoreNode[] = [];
    if ((node.archetype === "story_hub" || node.archetype === "memorial" || 
         (node.archetype === "secret_room" && rand() > 0.5)) && 
        loreTemplates.length > 0) {
      const loreContent = loreTemplates[Math.floor(rand() * loreTemplates.length)];
      loreNodes.push({
        id: `${node.id}-lore`,
        type: ["tablet", "terminal", "memory", "inscription", "echo", "artifact"][Math.floor(rand() * 6)] as LoreNode["type"],
        title: `${planetName} Codex Entry`,
        content: loreContent,
        x: 5 + Math.floor(rand() * 10),
        y: 4 + Math.floor(rand() * 8),
      });
    }
    
    let enemyCount = 0;
    if (node.archetype === "combat_arena") {
      enemyCount = Math.min(remainingEnemies, enemiesPerCombatRoom + Math.floor(rand() * 2));
      remainingEnemies -= enemyCount;
    } else if (node.archetype === "boss_lair") {
      enemyCount = Math.min(remainingEnemies, 3 + Math.floor(difficulty / 2));
      remainingEnemies -= enemyCount;
    }
    
    let shardCount = 0;
    if (node.archetype === "treasure_vault" || node.archetype === "secret_room") {
      shardCount = Math.min(remainingShards, shardsPerTreasure);
      remainingShards -= shardCount;
    } else if (node.archetype === "rest_area" && rand() > 0.7) {
      shardCount = Math.min(remainingShards, 1);
      remainingShards -= shardCount;
    }
    
    let hasKey = false;
    if (keysPlaced < keysRequired && 
        (node.archetype === "treasure_vault" || 
         (node.archetype === "combat_arena" && rand() > 0.5))) {
      hasKey = true;
      keysPlaced++;
    }
    
    const mainPathOrder = node.isMainPath 
      ? mainPathNodes.findIndex(n => n.id === node.id) + 1 
      : 0;
    
    areas.push({
      id: node.id,
      name,
      biome: baseBiomeId,
      description,
      archetype: node.archetype,
      width: 20,
      height: 16,
      connections,
      content: {
        enemyCount,
        shardCount,
        hasKey,
        loreNodes,
      },
      isEntrance: node.archetype === "entrance",
      isBossLair: node.archetype === "boss_lair",
      isCoreRoom: node.archetype === "boss_lair",
      isPuzzleChamber: node.archetype === "puzzle_chamber",
      isSecretRoom: node.archetype === "secret_room",
      isMainPath: node.isMainPath,
      mainPathOrder,
      layoutSeed: Math.floor(rand() * 100000),
    });
  }
  
  while (remainingShards > 0) {
    const validAreas = areas.filter(a => 
      !a.isBossLair && a.archetype !== "corridor" && a.content.shardCount < 3
    );
    if (validAreas.length === 0) break;
    const target = validAreas[Math.floor(rand() * validAreas.length)];
    target.content.shardCount++;
    remainingShards--;
  }
  
  while (keysPlaced < keysRequired) {
    const validAreas = areas.filter(a => !a.isBossLair && !a.content.hasKey && !a.isEntrance);
    if (validAreas.length === 0) break;
    const target = validAreas[Math.floor(rand() * validAreas.length)];
    target.content.hasKey = true;
    keysPlaced++;
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
