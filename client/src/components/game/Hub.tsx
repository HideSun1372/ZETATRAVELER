import { useEffect, useRef, useState, useMemo } from "react";
import { useRPG } from "../../lib/stores/useRPG";
import { GalaxyMap } from "./GalaxyMap";
import { NPCSprite, PlayerSprite, Sprite } from "./Sprite";
import { PauseMenu } from "./PauseMenu";

interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  dialogue: string[];
}

interface Decoration {
  x: number;
  y: number;
  type: "console" | "plant" | "light" | "pillar" | "rug" | "crate";
}

const TILE_SIZE = 48;
const MAP_WIDTH = 16;
const MAP_HEIGHT = 12;
const PLAYER_SPEED = 5;
const SPRITE_SIZE = 56;

export function Hub() {
  const { 
    playerName, 
    playerPosition, 
    setPlayerPosition, 
    travelToPlanet,
    hp,
    maxHp,
    level,
    xp,
    xpToNextLevel,
    atk,
    def,
    gold,
    hope,
    hopeBonus,
    nebuliShards,
    nebuliTotal,
    travelers,
    recruitTraveler,
    lakineDialogueIndex,
    advanceLakineDialogue,
    heal,
    currentRoute,
    totalKills,
    totalSpares,
  } = useRPG();

  const [showDialogue, setShowDialogue] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showGalaxyMap, setShowGalaxyMap] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [playerMoving, setPlayerMoving] = useState(false);
  const [playerFacing, setPlayerFacing] = useState<"left" | "right">("right");
  
  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showGalaxyMap) {
          setShowGalaxyMap(false);
        } else if (showDialogue) {
          setShowDialogue(false);
        } else {
          setShowPauseMenu(prev => !prev);
        }
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showGalaxyMap, showDialogue]);

  const npcs: NPC[] = useMemo(() => [
    {
      id: "lakine",
      name: "LAKINE",
      x: 8,
      y: 5,
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
      x: 4,
      y: 5,
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
      x: 12,
      y: 5,
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
      x: 8,
      y: 9,
      color: "#32CD32",
      dialogue: [
        "Beep boop! Hello, organic lifeform!",
        "I am MIRA, repair unit M-1-R-4!",
        "I can help you fix things! And explore!",
        "Take me with you? Please? PLEASE?",
        "* MIRA joined your party! *",
      ],
    },
    {
      id: "healer",
      name: "HEALING STATION",
      x: 2,
      y: 8,
      color: "#00FF88",
      dialogue: ["Your HP has been fully restored!", "Stay safe out there, traveler."],
    },
    {
      id: "galaxy_portal",
      name: "GALAXY PORTAL",
      x: 14,
      y: 6,
      color: "#9B59B6",
      dialogue: ["Step into the portal to view the Galaxy Map...", "Choose your next destination wisely."],
    },
  ], []);

  const walls = useMemo(() => {
    const w: { x: number; y: number; isCorner?: boolean }[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      w.push({ x, y: 0, isCorner: x === 0 || x === MAP_WIDTH - 1 });
      w.push({ x, y: MAP_HEIGHT - 1, isCorner: x === 0 || x === MAP_WIDTH - 1 });
    }
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
      w.push({ x: 0, y, isCorner: false });
      w.push({ x: MAP_WIDTH - 1, y, isCorner: false });
    }
    return w;
  }, []);

  const decorations: Decoration[] = useMemo(() => [
    { x: 3, y: 2, type: "console" },
    { x: 13, y: 2, type: "console" },
    { x: 1, y: 3, type: "plant" },
    { x: 14, y: 3, type: "plant" },
    { x: 1, y: 9, type: "crate" },
    { x: 14, y: 9, type: "crate" },
    { x: 6, y: 1, type: "light" },
    { x: 10, y: 1, type: "light" },
    { x: 5, y: 6, type: "pillar" },
    { x: 11, y: 6, type: "pillar" },
    { x: 7, y: 7, type: "rug" },
    { x: 8, y: 7, type: "rug" },
    { x: 9, y: 7, type: "rug" },
  ], []);

  const floorPattern = useMemo(() => {
    const pattern: { x: number; y: number; variant: number }[] = [];
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        pattern.push({ x, y, variant: (x + y) % 4 });
      }
    }
    return pattern;
  }, []);

  const checkCollision = (newX: number, newY: number): boolean => {
    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);
    
    if (tileX <= 0 || tileX >= MAP_WIDTH - 1 || tileY <= 0 || tileY >= MAP_HEIGHT - 1) {
      return true;
    }

    for (const dec of decorations) {
      if (dec.type === "pillar" || dec.type === "crate" || dec.type === "console") {
        if (Math.abs(newX - dec.x * TILE_SIZE) < TILE_SIZE * 0.7 && 
            Math.abs(newY - dec.y * TILE_SIZE) < TILE_SIZE * 0.7) {
          return true;
        }
      }
    }
    
    return false;
  };

  const checkInteraction = () => {
    for (const npc of npcs) {
      const npcPixelX = npc.x * TILE_SIZE;
      const npcPixelY = npc.y * TILE_SIZE;
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - npcPixelX, 2) + 
        Math.pow(playerPosition.y - npcPixelY, 2)
      );
      
      if (distance < TILE_SIZE * 1.2) {
        if (npc.id === "galaxy_portal") {
          setShowGalaxyMap(true);
          return;
        }
        
        if (npc.id === "healer") {
          heal(maxHp + hopeBonus.hp);
        }
        
        if (["zara", "korin", "mira"].includes(npc.id)) {
          const traveler = travelers.find(t => t.id === npc.id);
          if (traveler && !traveler.recruited) {
            recruitTraveler(npc.id);
          }
        }
        
        if (npc.id === "lakine") {
          advanceLakineDialogue();
        }
        
        setCurrentNPC(npc);
        setDialogueIndex(0);
        setShowDialogue(true);
        setDisplayedText("");
        return;
      }
    }
  };

  const advanceDialogue = () => {
    if (!currentNPC) return;
    
    if (isTyping) {
      setDisplayedText(currentNPC.dialogue[dialogueIndex]);
      setIsTyping(false);
      return;
    }
    
    if (dialogueIndex < currentNPC.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
      setDisplayedText("");
    } else {
      setShowDialogue(false);
      setCurrentNPC(null);
      setDialogueIndex(0);
    }
  };

  useEffect(() => {
    if (showDialogue && currentNPC) {
      const fullText = currentNPC.dialogue[dialogueIndex];
      let charIndex = 0;
      setIsTyping(true);
      
      const typeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, 30);
      
      return () => clearInterval(typeInterval);
    }
  }, [showDialogue, currentNPC, dialogueIndex]);

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
      if (showDialogue || showGalaxyMap || showPauseMenu) {
        setPlayerMoving(false);
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      let dx = 0;
      let dy = 0;
      
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) dy -= PLAYER_SPEED;
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) dy += PLAYER_SPEED;
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) {
        dx -= PLAYER_SPEED;
        setPlayerFacing("left");
      }
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) {
        dx += PLAYER_SPEED;
        setPlayerFacing("right");
      }
      
      const isMoving = dx !== 0 || dy !== 0;
      setPlayerMoving(isMoving);
      
      if (isMoving) {
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
  }, [playerPosition, showDialogue, showGalaxyMap, showPauseMenu]);

  useEffect(() => {
    if (playerPosition.x === 0 && playerPosition.y === 0) {
      setPlayerPosition({ x: 8 * TILE_SIZE, y: 7 * TILE_SIZE });
    }
  }, []);

  const getDecorationStyle = (dec: Decoration) => {
    const base = {
      position: "absolute" as const,
      left: dec.x * TILE_SIZE,
      top: dec.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    switch (dec.type) {
      case "console":
        return { ...base, fontSize: TILE_SIZE * 0.6 };
      case "plant":
        return { ...base, fontSize: TILE_SIZE * 0.7 };
      case "light":
        return { ...base, fontSize: TILE_SIZE * 0.4 };
      case "pillar":
        return { ...base, fontSize: TILE_SIZE * 0.8 };
      case "rug":
        return { ...base };
      case "crate":
        return { ...base, fontSize: TILE_SIZE * 0.6 };
      default:
        return base;
    }
  };

  const renderDecoration = (dec: Decoration) => {
    switch (dec.type) {
      case "console":
        return (
          <div 
            className="bg-gray-800 border-2 border-cyan-500 rounded flex items-center justify-center"
            style={{ width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.6 }}
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1" />
          </div>
        );
      case "plant":
        return (
          <div className="text-green-500 animate-sprite-idle" style={{ fontSize: TILE_SIZE * 0.7 }}>
            🌿
          </div>
        );
      case "light":
        return (
          <div 
            className="rounded-full animate-pulse"
            style={{ 
              width: TILE_SIZE * 0.3, 
              height: TILE_SIZE * 0.3,
              backgroundColor: "#FFD700",
              boxShadow: "0 0 20px #FFD700, 0 0 40px #FFA500"
            }}
          />
        );
      case "pillar":
        return (
          <div 
            className="bg-gradient-to-b from-gray-600 to-gray-800 rounded-t"
            style={{ width: TILE_SIZE * 0.4, height: TILE_SIZE * 0.9 }}
          />
        );
      case "rug":
        return (
          <div 
            className="bg-purple-900/50 rounded"
            style={{ width: TILE_SIZE, height: TILE_SIZE }}
          />
        );
      case "crate":
        return (
          <div 
            className="bg-amber-800 border-2 border-amber-600 rounded"
            style={{ width: TILE_SIZE * 0.7, height: TILE_SIZE * 0.7 }}
          >
            <div className="w-full h-1 bg-amber-600 mt-2" />
            <div className="w-full h-1 bg-amber-600 mt-2" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      <h2 
        className="text-white text-xl mb-2"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {playerName ? `${playerName}'s Hub` : "SPACE STATION HUB"}
      </h2>

      <div 
        className="relative overflow-hidden"
        style={{ 
          width: MAP_WIDTH * TILE_SIZE, 
          height: MAP_HEIGHT * TILE_SIZE,
          borderRadius: 8,
          boxShadow: "0 0 30px rgba(100, 100, 255, 0.3), inset 0 0 60px rgba(0, 0, 50, 0.5)"
        }}
      >
        {floorPattern.map((tile) => (
          <div
            key={`floor-${tile.x}-${tile.y}`}
            className="absolute"
            style={{
              left: tile.x * TILE_SIZE,
              top: tile.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: tile.variant === 0 ? "#1a1a2e" : 
                              tile.variant === 1 ? "#16162a" : 
                              tile.variant === 2 ? "#1e1e35" : "#141428",
              borderRight: tile.variant % 2 === 0 ? "1px solid #252540" : "none",
              borderBottom: tile.variant % 2 === 1 ? "1px solid #252540" : "none",
            }}
          />
        ))}

        {walls.map((wall, i) => (
          <div
            key={`wall-${i}`}
            className="absolute"
            style={{
              left: wall.x * TILE_SIZE,
              top: wall.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              background: wall.isCorner 
                ? "linear-gradient(135deg, #4a4a6a 0%, #2a2a4a 100%)"
                : wall.y === 0 
                  ? "linear-gradient(to bottom, #5a5a8a 0%, #3a3a5a 100%)"
                  : wall.y === MAP_HEIGHT - 1
                    ? "linear-gradient(to top, #3a3a5a 0%, #4a4a6a 100%)"
                    : "linear-gradient(to right, #3a3a5a 0%, #4a4a6a 50%, #3a3a5a 100%)",
              borderTop: wall.y === 0 ? "3px solid #6a6a9a" : "none",
              borderBottom: wall.y === MAP_HEIGHT - 1 ? "3px solid #2a2a4a" : "none",
              borderLeft: wall.x === 0 ? "3px solid #6a6a9a" : "none",
              borderRight: wall.x === MAP_WIDTH - 1 ? "3px solid #2a2a4a" : "none",
            }}
          />
        ))}

        {decorations.map((dec, i) => (
          <div key={`dec-${i}`} style={getDecorationStyle(dec)}>
            {renderDecoration(dec)}
          </div>
        ))}
        
        {npcs.map((npc) => (
          <div
            key={npc.id}
            className="absolute"
            style={{
              left: npc.x * TILE_SIZE + (TILE_SIZE - SPRITE_SIZE) / 2,
              top: npc.y * TILE_SIZE + (TILE_SIZE - SPRITE_SIZE) / 2,
              width: SPRITE_SIZE,
              height: SPRITE_SIZE,
              zIndex: npc.y,
            }}
          >
            <NPCSprite 
              npcId={npc.id} 
              size={SPRITE_SIZE}
            />
          </div>
        ))}
        
        <div
          className="absolute"
          style={{
            left: playerPosition.x + (TILE_SIZE - SPRITE_SIZE) / 2,
            top: playerPosition.y + (TILE_SIZE - SPRITE_SIZE) / 2,
            width: SPRITE_SIZE,
            height: SPRITE_SIZE,
            transition: "left 0.05s, top 0.05s",
            zIndex: Math.floor(playerPosition.y / TILE_SIZE) + 1,
          }}
        >
          <PlayerSprite 
            size={SPRITE_SIZE} 
            isMoving={playerMoving}
            flipX={playerFacing === "left"}
          />
        </div>
        
        {showDialogue && currentNPC && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/95 border-t-4 border-white p-4"
            style={{ height: "110px", zIndex: 100 }}
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
        className="mt-3 flex flex-wrap gap-4 text-white text-sm"
        style={{ fontFamily: "'Courier New', monospace", maxWidth: MAP_WIDTH * TILE_SIZE }}
      >
        <div className="flex gap-3">
          <div>
            <span className="text-gray-400">HP:</span> {hp}/{maxHp + hopeBonus.hp}
          </div>
          <div>
            <span className="text-gray-400">LV:</span> {level}
            {level < 100 && (
              <span className="text-gray-500 text-xs ml-1">({xp}/{xpToNextLevel})</span>
            )}
          </div>
          <div>
            <span className="text-red-400">ATK:</span> {atk}
          </div>
          <div>
            <span className="text-blue-400">DEF:</span> {def + hopeBonus.def}
          </div>
        </div>
        <div className="flex gap-3">
          <div>
            <span className="text-yellow-400">GOLD:</span> {gold}
          </div>
          <div>
            <span className="text-cyan-400">HOPE:</span> {hope}
          </div>
          <div>
            <span className="text-purple-400">NEBULI:</span> {nebuliShards}/{nebuliTotal * 2} cores
          </div>
        </div>
        <div>
          <span className={`${
            currentRoute === 'pacifist' ? 'text-green-400' : 
            currentRoute === 'genocide' ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            ROUTE: {currentRoute.toUpperCase()}
          </span>
          <span className="text-gray-500 text-xs ml-2">
            (K:{totalKills} S:{totalSpares})
          </span>
        </div>
      </div>
      
      <div 
        className="mt-2 text-gray-500 text-xs"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        WASD: Move | Z: Interact | ESC: Pause
      </div>
      
      <div 
        className="mt-1 flex gap-3 text-xs"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {travelers.map((t) => (
          <span 
            key={t.id}
            className={t.recruited ? "text-green-400" : "text-gray-600"}
          >
            {t.name}: {t.recruited ? "✓" : "..."}
          </span>
        ))}
      </div>

      {showGalaxyMap && (
        <GalaxyMap
          onClose={() => setShowGalaxyMap(false)}
          onSelectPlanet={handlePlanetSelect}
        />
      )}

      {showPauseMenu && (
        <PauseMenu onClose={() => setShowPauseMenu(false)} />
      )}
    </div>
  );
}
