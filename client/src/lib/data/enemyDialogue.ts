export interface TalkOption {
  id: string;
  text: string;
  response: string;
  effect: "progress" | "setback" | "neutral" | "instant_spare";
  progressAmount?: number;
}

export interface EnemyDialogue {
  greetings: string[];
  talkOptions: TalkOption[];
  spareThreshold: number;
  spareMessage: string;
  flirtResponse: string;
  checkDescription: string;
}

const DEFAULT_TALK_OPTIONS: TalkOption[] = [
  { id: "compliment", text: "Compliment", response: "* It seems flattered.", effect: "progress", progressAmount: 20 },
  { id: "reason", text: "Reason", response: "* It considers your words.", effect: "progress", progressAmount: 15 },
  { id: "joke", text: "Tell Joke", response: "* It doesn't get the joke.", effect: "neutral" },
  { id: "threaten", text: "Threaten", response: "* It seems offended!", effect: "setback", progressAmount: -10 },
];

const DIALOGUE_TEMPLATES: Record<string, Partial<EnemyDialogue>> = {
  forest: {
    greetings: [
      "* A rustling presence approaches.",
      "* The creature watches you curiously.",
      "* It sways gently in the alien breeze.",
    ],
    talkOptions: [
      { id: "admire", text: "Admire Nature", response: "* It appreciates your connection to nature.", effect: "progress", progressAmount: 25 },
      { id: "hum", text: "Hum Softly", response: "* It seems soothed by the melody.", effect: "progress", progressAmount: 20 },
      { id: "pluck", text: "Pluck Leaf", response: "* It looks hurt by your action!", effect: "setback", progressAmount: -15 },
      { id: "dance", text: "Dance", response: "* It sways along with you!", effect: "progress", progressAmount: 30 },
    ],
    flirtResponse: "* It rustles its leaves shyly.",
  },
  crystal: {
    greetings: [
      "* A crystalline form glitters before you.",
      "* Light refracts through its geometric body.",
      "* It chimes softly, waiting.",
    ],
    talkOptions: [
      { id: "admire", text: "Admire Light", response: "* It glows brighter!", effect: "progress", progressAmount: 25 },
      { id: "sing", text: "Sing Note", response: "* It resonates harmoniously!", effect: "progress", progressAmount: 30 },
      { id: "touch", text: "Touch Crystal", response: "* It vibrates uncomfortably.", effect: "setback", progressAmount: -10 },
      { id: "mirror", text: "Hold Mirror", response: "* It sees its own beauty!", effect: "progress", progressAmount: 20 },
    ],
    flirtResponse: "* It sparkles... was that a blush?",
  },
  void: {
    greetings: [
      "* Darkness coalesces into form.",
      "* The void stares back at you.",
      "* An absence of light blocks your path.",
    ],
    talkOptions: [
      { id: "accept", text: "Accept Darkness", response: "* It seems... understood.", effect: "progress", progressAmount: 30 },
      { id: "light", text: "Offer Light", response: "* It recoils but... appreciates the gesture.", effect: "progress", progressAmount: 15 },
      { id: "fear", text: "Show Fear", response: "* It feeds on your fear!", effect: "setback", progressAmount: -20 },
      { id: "embrace", text: "Embrace Void", response: "* You become one with the darkness briefly. It respects this.", effect: "progress", progressAmount: 35 },
    ],
    flirtResponse: "* The void does not understand romance. But it tries.",
  },
  ice: {
    greetings: [
      "* A frigid presence materializes.",
      "* Frost crackles in the air around it.",
      "* Its cold gaze meets yours.",
    ],
    talkOptions: [
      { id: "warm", text: "Offer Warmth", response: "* It moves closer, curious.", effect: "progress", progressAmount: 25 },
      { id: "cold", text: "Endure Cold", response: "* It respects your resilience.", effect: "progress", progressAmount: 20 },
      { id: "melt", text: "Try to Melt", response: "* It's offended by your aggression!", effect: "setback", progressAmount: -15 },
      { id: "snowflake", text: "Catch Snowflake", response: "* It creates a beautiful one just for you.", effect: "progress", progressAmount: 30 },
    ],
    flirtResponse: "* Its icy heart... melts slightly.",
  },
  fire: {
    greetings: [
      "* Heat radiates from the flickering form.",
      "* Embers dance around its body.",
      "* It crackles with burning intensity.",
    ],
    talkOptions: [
      { id: "fuel", text: "Offer Fuel", response: "* It burns brighter, grateful!", effect: "progress", progressAmount: 30 },
      { id: "respect", text: "Respect Power", response: "* It dims slightly, calming.", effect: "progress", progressAmount: 20 },
      { id: "water", text: "Splash Water", response: "* It hisses with rage!", effect: "setback", progressAmount: -25 },
      { id: "dance", text: "Fire Dance", response: "* It performs alongside you!", effect: "progress", progressAmount: 35 },
    ],
    flirtResponse: "* It blushes... wait, it was already red.",
  },
  cosmic: {
    greetings: [
      "* Stars seem to orbit around this being.",
      "* The cosmos itself has taken form.",
      "* Ancient light emanates from within.",
    ],
    talkOptions: [
      { id: "gaze", text: "Gaze at Stars", response: "* It shares the beauty of the universe with you.", effect: "progress", progressAmount: 25 },
      { id: "wish", text: "Make Wish", response: "* It grants you a small cosmic blessing.", effect: "progress", progressAmount: 30 },
      { id: "demand", text: "Demand Power", response: "* The cosmos does not bow to demands.", effect: "setback", progressAmount: -20 },
      { id: "humble", text: "Show Humility", response: "* It appreciates your reverence.", effect: "progress", progressAmount: 35 },
    ],
    flirtResponse: "* Somewhere, a star is born in response to your charm.",
  },
  mechanical: {
    greetings: [
      "* Gears whir as the machine awakens.",
      "* Binary beeps emit from the construct.",
      "* It scans you with cold precision.",
    ],
    talkOptions: [
      { id: "logic", text: "Use Logic", response: "* It processes your argument. VALID.", effect: "progress", progressAmount: 30 },
      { id: "oil", text: "Offer Oil", response: "* Its joints move more smoothly. GRATEFUL.", effect: "progress", progressAmount: 25 },
      { id: "smash", text: "Threaten Smash", response: "* THREAT DETECTED. HOSTILITY INCREASED.", effect: "setback", progressAmount: -20 },
      { id: "beep", text: "Beep Back", response: "* COMMUNICATION ATTEMPT... ACKNOWLEDGED.", effect: "progress", progressAmount: 20 },
    ],
    flirtResponse: "* ERROR: EMOTION.EXE NOT FOUND... but it tries to smile.",
  },
};

export function getEnemyDialogue(enemyName: string, biome?: string): EnemyDialogue {
  const nameLower = enemyName.toLowerCase();
  
  let template: Partial<EnemyDialogue> = {};
  if (nameLower.includes("crystal") || nameLower.includes("gem") || nameLower.includes("shard")) {
    template = DIALOGUE_TEMPLATES.crystal;
  } else if (nameLower.includes("void") || nameLower.includes("shadow") || nameLower.includes("dark")) {
    template = DIALOGUE_TEMPLATES.void;
  } else if (nameLower.includes("ice") || nameLower.includes("frost") || nameLower.includes("snow")) {
    template = DIALOGUE_TEMPLATES.ice;
  } else if (nameLower.includes("fire") || nameLower.includes("flame") || nameLower.includes("ember")) {
    template = DIALOGUE_TEMPLATES.fire;
  } else if (nameLower.includes("star") || nameLower.includes("cosmic") || nameLower.includes("celestial")) {
    template = DIALOGUE_TEMPLATES.cosmic;
  } else if (nameLower.includes("robot") || nameLower.includes("mech") || nameLower.includes("droid")) {
    template = DIALOGUE_TEMPLATES.mechanical;
  } else if (biome === "forest" || nameLower.includes("leaf") || nameLower.includes("flora")) {
    template = DIALOGUE_TEMPLATES.forest;
  } else {
    template = DIALOGUE_TEMPLATES.forest;
  }

  return {
    greetings: template.greetings || ["* A strange creature blocks your path."],
    talkOptions: template.talkOptions || DEFAULT_TALK_OPTIONS,
    spareThreshold: 100,
    spareMessage: `* ${enemyName} no longer wants to fight.`,
    flirtResponse: template.flirtResponse || `* ${enemyName} doesn't know how to react.`,
    checkDescription: `${enemyName} - A mysterious creature from this planet.`,
  };
}

export function getBossDialogue(bossName: string): EnemyDialogue {
  return {
    greetings: [
      `* ${bossName.toUpperCase()} towers before you.`,
      "* The air grows heavy with power.",
      "* This is a battle you cannot avoid easily.",
    ],
    talkOptions: [
      { id: "reason", text: "Reason", response: "* It considers your words... but remains hostile.", effect: "progress", progressAmount: 10 },
      { id: "beg", text: "Beg", response: "* It pauses, perhaps feeling a twinge of mercy.", effect: "progress", progressAmount: 15 },
      { id: "challenge", text: "Challenge", response: "* It respects your courage!", effect: "progress", progressAmount: 20 },
      { id: "understand", text: "Understand", response: "* You try to see things from its perspective. It... notices.", effect: "progress", progressAmount: 25 },
    ],
    spareThreshold: 100,
    spareMessage: `* ${bossName} finally lowers its guard. The battle is over.`,
    flirtResponse: `* ${bossName} is far too powerful to be swayed by charm... but it smirks.`,
    checkDescription: `${bossName} - The guardian of this planet's core. Immensely powerful.`,
  };
}
