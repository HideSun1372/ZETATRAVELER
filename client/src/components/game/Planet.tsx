import { useEffect, useRef, useState, useMemo } from "react";
import { useRPG, Enemy } from "../../lib/stores/useRPG";

interface Shard {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface EnemySpawn {
  id: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  atk: number;
  def: number;
  defeated: boolean;
}

const TILE_SIZE = 32;
const MAP_WIDTH = 25;
const MAP_HEIGHT = 18;
const PLAYER_SPEED = 4;

const ENEMY_TYPES = [
  { name: "STARLING", hp: 15, atk: 5, def: 2, color: "#FF6B6B" },
  { name: "VOIDLING", hp: 20, atk: 8, def: 3, color: "#9B59B6" },
  { name: "NEBULITE", hp: 25, atk: 10, def: 5, color: "#3498DB" },
];

export function Planet() {
  const {
    currentPlanetId,
    planets,
    playerPosition,
    setPlayerPosition,
    collectShard,
    startBattle,
    returnToHub,
    hp,
    maxHp,
    level,
    nebuliShards,
    defeatedEnemyIds,
  } = useRPG();

  const currentPlanet = planets.find((p) => p.id === currentPlanetId);
  
  const [shards, setShards] = useState<Shard[]>([]);
  const [enemies, setEnemies] = useState<EnemySpawn[]>([]);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [showSealPrompt, setShowSealPrompt] = useState(false);
  const [planetSealed, setPlanetSealed] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  
  const CORE_POSITION = { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) };
  
  const allEnemiesDefeated = enemies.length > 0 && enemies.every(e => defeatedEnemyIds.includes(e.id));
  const allShardsCollected = shards.length > 0 && shards.every(s => s.collected);

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
    w.push({ x: 12, y: 5 });
    w.push({ x: 13, y: 5 });
    w.push({ x: 12, y: 6 });
    w.push({ x: 8, y: 10 });
    w.push({ x: 9, y: 10 });
    w.push({ x: 16, y: 12 });
    w.push({ x: 17, y: 12 });
    
    return w;
  }, []);

  useEffect(() => {
    const seed = currentPlanetId * 12345;
    const random = (n: number) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    const newShards: Shard[] = [];
    for (let i = 0; i < 5; i++) {
      newShards.push({
        id: i,
        x: Math.floor(random(i * 2) * (MAP_WIDTH - 4)) + 2,
        y: Math.floor(random(i * 2 + 1) * (MAP_HEIGHT - 4)) + 2,
        collected: false,
      });
    }
    setShards(newShards);

    const newEnemies: EnemySpawn[] = [];
    for (let i = 0; i < 3; i++) {
      const enemyType = ENEMY_TYPES[i % ENEMY_TYPES.length];
      newEnemies.push({
        id: `enemy-${currentPlanetId}-${i}`,
        name: enemyType.name,
        x: Math.floor(random(i * 3 + 100) * (MAP_WIDTH - 4)) + 2,
        y: Math.floor(random(i * 3 + 101) * (MAP_HEIGHT - 4)) + 2,
        hp: enemyType.hp,
        atk: enemyType.atk,
        def: enemyType.def,
        defeated: false,
      });
    }
    setEnemies(newEnemies);

    setPlayerPosition({ x: 2 * TILE_SIZE, y: (MAP_HEIGHT / 2) * TILE_SIZE });
  }, [currentPlanetId]);

  const checkCollision = (x: number, y: number): boolean => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    return walls.some((w) => w.x === tileX && w.y === tileY);
  };

  const checkInteractions = (x: number, y: number) => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    for (const shard of shards) {
      if (!shard.collected && Math.abs(tileX - shard.x) < 1 && Math.abs(tileY - shard.y) < 1) {
        setShards((prev) =>
          prev.map((s) => (s.id === shard.id ? { ...s, collected: true } : s))
        );
        collectShard();
      }
    }

    for (const enemy of enemies) {
      const isDefeated = defeatedEnemyIds.includes(enemy.id);
      if (!isDefeated && Math.abs(tileX - enemy.x) < 1 && Math.abs(tileY - enemy.y) < 1) {
        const battleEnemy: Enemy = {
          id: enemy.id,
          name: enemy.name,
          hp: enemy.hp,
          maxHp: enemy.hp,
          atk: enemy.atk,
          def: enemy.def,
          spared: false,
          killed: false,
          talkProgress: 0,
          canSpare: false,
        };
        startBattle(battleEnemy);
        return;
      }
    }

    if (tileX <= 1) {
      setShowExitPrompt(true);
    }
    
    if (allEnemiesDefeated && !planetSealed &&
        Math.abs(tileX - CORE_POSITION.x) < 1 && Math.abs(tileY - CORE_POSITION.y) < 1) {
      setShowSealPrompt(true);
    }
  };
  
  const sealPlanetCore = () => {
    setPlanetSealed(true);
    setShowSealPrompt(false);
    setShowVictory(true);
    
    setTimeout(() => {
      setShowVictory(false);
      returnToHub();
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showVictory) return;
      
      if (showSealPrompt) {
        if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          sealPlanetCore();
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
          setShowSealPrompt(false);
        }
        return;
      }
      
      if (showExitPrompt) {
        if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          returnToHub();
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
          setShowExitPrompt(false);
        }
        return;
      }
      
      keysPressed.current.add(e.key.toLowerCase());
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
  }, [showExitPrompt, showSealPrompt, showVictory]);

  useEffect(() => {
    const gameLoop = () => {
      if (showExitPrompt) {
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
          checkInteractions(boundedX, boundedY);
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
  }, [playerPosition, showExitPrompt]);

  const getPlanetColor = () => {
    const colors = ["#1a472a", "#2d1b4e", "#4a1c1c", "#1c3d4a", "#3d3d1c"];
    return colors[(currentPlanetId - 1) % colors.length];
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      <div
        className="text-white text-xl mb-2"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        PLANET {currentPlanetId}: {currentPlanet?.name || "UNKNOWN"}
      </div>

      <div
        className="relative border-4 border-white"
        style={{
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
          backgroundColor: getPlanetColor(),
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
              backgroundColor: "#222",
            }}
          />
        ))}

        <div
          className="absolute"
          style={{
            left: 0,
            top: (MAP_HEIGHT / 2 - 1) * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE * 2,
            backgroundColor: "#4444FF",
            opacity: 0.7,
          }}
        />

        {shards.map((shard) =>
          !shard.collected ? (
            <div
              key={`shard-${shard.id}`}
              className="absolute animate-pulse"
              style={{
                left: shard.x * TILE_SIZE + 8,
                top: shard.y * TILE_SIZE + 8,
                width: TILE_SIZE - 16,
                height: TILE_SIZE - 16,
                backgroundColor: "#AA00FF",
                borderRadius: "50%",
                boxShadow: "0 0 10px #AA00FF",
              }}
            />
          ) : null
        )}

        {enemies.map((enemy) => {
          const isDefeated = defeatedEnemyIds.includes(enemy.id);
          return !isDefeated ? (
            <div
              key={enemy.id}
              className="absolute flex items-center justify-center"
              style={{
                left: enemy.x * TILE_SIZE,
                top: enemy.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: ENEMY_TYPES.find((e) => e.name === enemy.name)?.color || "#FF0000",
              }}
            >
              <span className="text-xs text-white font-bold">!</span>
            </div>
          ) : null;
        })}

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

        {allEnemiesDefeated && !planetSealed && (
          <div
            className="absolute animate-pulse"
            style={{
              left: CORE_POSITION.x * TILE_SIZE,
              top: CORE_POSITION.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: "#FFD700",
              borderRadius: "50%",
              boxShadow: "0 0 20px #FFD700, 0 0 40px #FF8C00",
            }}
          />
        )}

        {showExitPrompt && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <div className="bg-black border-4 border-white p-6 text-center">
              <p
                className="text-white text-xl mb-4"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Return to Hub?
              </p>
              <p
                className="text-gray-400"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Z/Enter: Yes | X/Shift: No
              </p>
            </div>
          </div>
        )}
        
        {showSealPrompt && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <div className="bg-black border-4 border-yellow-400 p-6 text-center">
              <p
                className="text-yellow-400 text-xl mb-2"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                PLANETARY CORE
              </p>
              <p
                className="text-white text-lg mb-4"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Seal this planet's core?
              </p>
              <p
                className="text-gray-400"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Z/Enter: Yes | X/Shift: No
              </p>
            </div>
          </div>
        )}
        
        {showVictory && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          >
            <div className="text-center">
              <p
                className="text-yellow-400 text-3xl mb-4 animate-pulse"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                PLANET SEALED!
              </p>
              <p
                className="text-white text-xl mb-2"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {currentPlanet?.name} is now safe.
              </p>
              <p
                className="text-green-400"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                +{shards.filter(s => s.collected).length} Nebuli Shards
              </p>
            </div>
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
          <span className="text-purple-400">SHARDS:</span>{" "}
          {shards.filter((s) => s.collected).length}/{shards.length}
        </div>
        <div>
          <span className="text-red-400">ENEMIES:</span>{" "}
          {enemies.filter((e) => defeatedEnemyIds.includes(e.id)).length}/{enemies.length}
        </div>
      </div>

      <div
        className="mt-2 text-gray-500 text-sm"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {allEnemiesDefeated && !planetSealed 
          ? "All enemies defeated! Find the golden CORE to seal this planet!"
          : "Collect shards | Defeat or spare all enemies | Left edge to exit"
        }
      </div>
    </div>
  );
}
