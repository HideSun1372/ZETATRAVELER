import { useEffect, useRef, useState, useMemo } from "react";
import { useRPG } from "../../lib/stores/useRPG";
import { GalaxyMap } from "./GalaxyMap";

interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  dialogue: string[];
}

const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const PLAYER_SPEED = 4;

export function Hub() {
  const { 
    playerName, 
    playerPosition, 
    setPlayerPosition, 
    travelToPlanet,
    hp,
    maxHp,
    level,
    hope,
    hopeBonus,
    nebuliShards,
    nebuliTotal,
    travelers,
    recruitTraveler,
    lakineDialogueIndex,
    advanceLakineDialogue,
    heal,
  } = useRPG();

  const [showDialogue, setShowDialogue] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showGalaxyMap, setShowGalaxyMap] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();

  const npcs: NPC[] = useMemo(() => [
    {
      id: "lakine",
      name: "LAKINE",
      x: 10,
      y: 7,
      color: "#FFD700",
      dialogue: [
        "Welcome, ZETATRAVELER.",
        "You have been chosen to seal the galactic fracture.",
        "Collect NEBULI from 50 planets to complete your mission.",
        "Use WASD or Arrow Keys to move.",
        "Press Z or Enter to interact.",
        "Be careful... your choices matter.",
        "Will you show MERCY, or will you FIGHT?",
        "The galaxy watches your every move.",
      ],
    },
    {
      id: "zara",
      name: "ZARA",
      x: 5,
      y: 7,
      color: "#FF69B4",
      dialogue: [
        "Hey there! I'm ZARA.",
        "I've been waiting for someone like you.",
        "Mind if I tag along on your journey?",
        "I promise I won't slow you down!",
        "* ZARA joined your party! *",
      ],
    },
    {
      id: "korin",
      name: "KORIN",
      x: 15,
      y: 7,
      color: "#4169E1",
      dialogue: [
        "...",
        "You're the one they call ZETATRAVELER?",
        "I've seen the fracture. It's worse than they say.",
        "I'll come with you. You'll need all the help you can get.",
        "* KORIN joined your party! *",
      ],
    },
    {
      id: "mira",
      name: "MIRA",
      x: 10,
      y: 10,
      color: "#32CD32",
      dialogue: [
        "Oh! A visitor!",
        "I'm MIRA, the mechanic here.",
        "I can fix anything... well, almost anything.",
        "The ship's portal is ready when you are!",
        "* MIRA joined your party! *",
      ],
    },
    {
      id: "healer",
      name: "HEALING STATION",
      x: 2,
      y: 7,
      color: "#00FF88",
      dialogue: [
        "* You rest at the healing station... *",
        "* HP fully restored! *",
      ],
    },
    {
      id: "galaxy_portal",
      name: "GALAXY PORTAL",
      x: 10,
      y: 3,
      color: "#9B59B6",
      dialogue: [
        "* The Galaxy Portal hums with energy... *",
        "* 50 planets await across 5 regions... *",
        "* Opening Galaxy Map... *",
      ],
    },
  ], []);

  const walls = useMemo(() => {
    const w: { x: number; y: number }[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      w.push({ x, y: 0 });
      w.push({ x, y: MAP_HEIGHT - 1 });
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      w.push({ x: 0, y });
      w.push({ x: MAP_WIDTH - 1, y });
    }
    return w;
  }, []);

  const checkCollision = (x: number, y: number): boolean => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (walls.some(w => w.x === tileX && w.y === tileY)) return true;
    
    for (const npc of npcs) {
      if (Math.abs(tileX - npc.x) < 1 && Math.abs(tileY - npc.y) < 1) return true;
    }
    
    return false;
  };

  const playerPosRef = useRef(playerPosition);
  playerPosRef.current = playerPosition;

  const checkInteraction = () => {
    const pos = playerPosRef.current;
    const tileX = Math.floor(pos.x / TILE_SIZE);
    const tileY = Math.floor(pos.y / TILE_SIZE);
    
    console.log("Checking interaction at tile:", tileX, tileY);
    
    for (const npc of npcs) {
      if (Math.abs(tileX - npc.x) <= 1 && Math.abs(tileY - npc.y) <= 1) {
        console.log("Found NPC:", npc.name);
        setCurrentNPC(npc);
        setShowDialogue(true);
        setDialogueIndex(0);
        setDisplayedText("");
        setIsTyping(true);
        return;
      }
    }
    
    console.log("No interaction found");
  };

  useEffect(() => {
    if (!showDialogue || !currentNPC || !isTyping) return;
    
    const fullText = currentNPC.dialogue[dialogueIndex];
    if (displayedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, currentNPC, dialogueIndex, showDialogue, isTyping]);

  const advanceDialogue = () => {
    if (isTyping) {
      if (currentNPC) {
        setDisplayedText(currentNPC.dialogue[dialogueIndex]);
        setIsTyping(false);
      }
      return;
    }
    
    if (currentNPC && dialogueIndex < currentNPC.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
      setDisplayedText("");
      setIsTyping(true);
    } else {
      if (currentNPC && ["zara", "korin", "mira"].includes(currentNPC.id)) {
        const traveler = travelers.find(t => t.id === currentNPC.id);
        if (traveler && !traveler.recruited) {
          recruitTraveler(currentNPC.id);
        }
      }
      if (currentNPC?.id === "lakine") {
        advanceLakineDialogue();
      }
      if (currentNPC?.id === "healer") {
        heal(maxHp);
      }
      if (currentNPC?.id === "galaxy_portal") {
        setShowGalaxyMap(true);
      }
      setShowDialogue(false);
      setCurrentNPC(null);
    }
  };

  const handlePlanetSelect = (planetId: number) => {
    setShowGalaxyMap(false);
    travelToPlanet(planetId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGalaxyMap) return;
      
      if (showDialogue) {
        if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          advanceDialogue();
        }
        return;
      }
      
      keysPressed.current.add(e.key.toLowerCase());
      
      if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
        checkInteraction();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showDialogue, showGalaxyMap, dialogueIndex, currentNPC, isTyping]);

  useEffect(() => {
    const gameLoop = () => {
      if (showDialogue || showGalaxyMap) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      let dx = 0;
      let dy = 0;
      
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) dy -= PLAYER_SPEED;
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) dy += PLAYER_SPEED;
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) dx -= PLAYER_SPEED;
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) dx += PLAYER_SPEED;
      
      if (dx !== 0 || dy !== 0) {
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;
        
        const boundedX = Math.max(TILE_SIZE, Math.min((MAP_WIDTH - 2) * TILE_SIZE, newX));
        const boundedY = Math.max(TILE_SIZE, Math.min((MAP_HEIGHT - 2) * TILE_SIZE, newY));
        
        if (!checkCollision(boundedX, boundedY)) {
          setPlayerPosition({ x: boundedX, y: boundedY });
        }
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerPosition, showDialogue, showGalaxyMap]);

  useEffect(() => {
    if (playerPosition.x === 0 && playerPosition.y === 0) {
      setPlayerPosition({ x: 10 * TILE_SIZE, y: 9 * TILE_SIZE });
    }
  }, []);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      <div 
        className="relative border-4 border-white"
        style={{ 
          width: MAP_WIDTH * TILE_SIZE, 
          height: MAP_HEIGHT * TILE_SIZE,
          backgroundColor: "#1a1a2e"
        }}
      >
        {walls.map((wall, i) => (
          <div
            key={`wall-${i}`}
            className="absolute"
            style={{
              left: wall.x * TILE_SIZE,
              top: wall.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: "#333366",
            }}
          />
        ))}
        
        {npcs.map((npc) => (
          <div
            key={npc.id}
            className="absolute flex items-center justify-center"
            style={{
              left: npc.x * TILE_SIZE,
              top: npc.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: npc.color,
            }}
          >
            <span className="text-xs text-black font-bold">{npc.name[0]}</span>
          </div>
        ))}
        
        <div
          className="absolute"
          style={{
            left: playerPosition.x,
            top: playerPosition.y,
            width: TILE_SIZE - 4,
            height: TILE_SIZE - 4,
            backgroundColor: "#FF0000",
            border: "2px solid #FF6666",
            transition: "left 0.05s, top 0.05s",
          }}
        />
        
        {showDialogue && currentNPC && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black border-t-4 border-white p-4"
            style={{ height: "100px" }}
          >
            <p 
              className="text-yellow-400 text-sm mb-1"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {currentNPC.name}
            </p>
            <p 
              className="text-white text-lg"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>
        )}
      </div>
      
      <div 
        className="mt-4 flex gap-8 text-white"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        <div>
          <span className="text-gray-400">HP:</span> {hp}/{maxHp + hopeBonus.hp}
        </div>
        <div>
          <span className="text-gray-400">LV:</span> {level}
        </div>
        <div>
          <span className="text-cyan-400">HOPE:</span> {hope}
        </div>
        <div>
          <span className="text-purple-400">NEBULI:</span> {nebuliShards} shards | {nebuliTotal} cores
        </div>
      </div>
      
      <div 
        className="mt-2 text-gray-500 text-sm"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        WASD/Arrows: Move | Z/Enter: Interact | Approach portals to travel
      </div>
      
      <div 
        className="mt-2 flex gap-4"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {travelers.map((t) => (
          <span 
            key={t.id}
            className={t.recruited ? "text-green-400" : "text-gray-600"}
          >
            {t.name}: {t.recruited ? "JOINED" : "..."}
          </span>
        ))}
      </div>

      {showGalaxyMap && (
        <GalaxyMap
          onClose={() => setShowGalaxyMap(false)}
          onSelectPlanet={handlePlanetSelect}
        />
      )}
    </div>
  );
}
