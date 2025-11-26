import { useEffect, useRef, useState, useMemo } from "react";
import { useRPG } from "../../lib/stores/useRPG";

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
    nebuliShards,
    nebuliTotal,
    travelers,
    recruitTraveler,
    lakineDialogueIndex,
    advanceLakineDialogue,
  } = useRPG();

  const [showDialogue, setShowDialogue] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
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
      x: 7,
      y: 10,
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
      x: 13,
      y: 10,
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
      y: 5,
      color: "#32CD32",
      dialogue: [
        "Oh! A visitor!",
        "I'm MIRA, the mechanic here.",
        "I can fix anything... well, almost anything.",
        "The ship's portal is ready when you are!",
        "* MIRA joined your party! *",
      ],
    },
  ], []);

  const portals = useMemo(() => [
    { id: 1, name: "VERDANTIS", x: 3, y: 2, color: "#00FF00" },
    { id: 2, name: "CRYSTALLUM", x: 17, y: 2, color: "#00FFFF" },
    { id: 3, name: "OBSIDIAN PRIME", x: 10, y: 13, color: "#8B0000" },
  ], []);
  
  const [nearPortal, setNearPortal] = useState<typeof portals[0] | null>(null);

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
    
    for (const portal of portals) {
      if (Math.abs(tileX - portal.x) <= 2 && Math.abs(tileY - portal.y) <= 2) {
        console.log("Found portal:", portal.name);
        travelToPlanet(portal.id);
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
      setShowDialogue(false);
      setCurrentNPC(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [showDialogue, dialogueIndex, currentNPC, isTyping]);

  useEffect(() => {
    const gameLoop = () => {
      if (showDialogue) {
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
      
      const tileX = Math.floor(playerPosition.x / TILE_SIZE);
      const tileY = Math.floor(playerPosition.y / TILE_SIZE);
      let foundPortal = null;
      for (const portal of portals) {
        if (Math.abs(tileX - portal.x) <= 1 && Math.abs(tileY - portal.y) <= 1) {
          foundPortal = portal;
          break;
        }
      }
      setNearPortal(foundPortal);
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerPosition, showDialogue]);

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
        
        {portals.map((portal) => (
          <div
            key={`portal-${portal.id}`}
            className="absolute flex flex-col items-center justify-center animate-pulse"
            style={{
              left: portal.x * TILE_SIZE - TILE_SIZE / 2,
              top: portal.y * TILE_SIZE - TILE_SIZE / 2,
              width: TILE_SIZE * 2,
              height: TILE_SIZE * 2,
              backgroundColor: portal.color,
              opacity: 0.9,
              borderRadius: "50%",
              boxShadow: `0 0 20px ${portal.color}`,
            }}
          >
            <span className="text-sm text-white font-bold">{portal.name}</span>
          </div>
        ))}
        
        {nearPortal && !showDialogue && (
          <div
            className="absolute left-1/2 bottom-4 transform -translate-x-1/2 bg-black border-2 border-white px-4 py-2"
          >
            <p
              className="text-white text-center"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              Press Z/Enter to travel to {nearPortal.name}
            </p>
          </div>
        )}
        
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
          <span className="text-gray-400">HP:</span> {hp}/{maxHp}
        </div>
        <div>
          <span className="text-gray-400">LV:</span> {level}
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
    </div>
  );
}
