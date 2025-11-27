import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRPG, Enemy } from "../../lib/stores/useRPG";
import { getPlanetById, PlanetTheme } from "../../lib/data/planets";
import { generatePlanetAreas, PlanetArea, PlanetLore, LoreNode, getAreaBiomeConfig } from "../../lib/data/planetAreas";
import { Sprite, getEnemySpriteType } from "./Sprite";

interface Shard {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Key {
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
  color: string;
  spareDialogue: string[];
  isBoss?: boolean;
  isSecretBoss?: boolean;
  isChasing?: boolean;
  lastMoveTime?: number;
}

interface Door {
  id: string;
  x: number;
  y: number;
  targetAreaId: string;
  direction: string;
  type: string;
  routeType: "main" | "branch" | "secret";
  locked: boolean;
  keyRequired: boolean;
}

interface LoreObject {
  id: string;
  x: number;
  y: number;
  type: string;
  title: string;
  content: string[];
  discovered: boolean;
}

const TILE_SIZE = 32;
const MAP_WIDTH = 25;
const MAP_HEIGHT = 18;
const PLAYER_SPEED = 4;
const ENEMY_SPEED = 2.4;
const ENEMY_DETECTION_RANGE = 6 * TILE_SIZE;
const ENEMY_MOVE_INTERVAL = 16;

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
    sealCore,
    collectKey,
    defeatBoss,
    defeatSecretBoss,
    canSealCore,
    changeArea,
    discoverLore,
  } = useRPG();

  const currentPlanet = planets.find((p) => p.id === currentPlanetId);
  const planetTheme = getPlanetById(currentPlanetId);
  
  const totalShards = currentPlanet?.totalShards || 2;
  const minEnemiesRequired = currentPlanet?.minEnemiesRequired || 5;
  const keysRequired = currentPlanet?.keysRequired || 1;
  
  const [shards, setShards] = useState<Shard[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [enemies, setEnemies] = useState<EnemySpawn[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [loreObjects, setLoreObjects] = useState<LoreObject[]>([]);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [showSealPrompt, setShowSealPrompt] = useState(false);
  const [showDoorPrompt, setShowDoorPrompt] = useState<Door | null>(null);
  const [showLoreDialog, setShowLoreDialog] = useState<LoreObject | null>(null);
  const [showAreaTransition, setShowAreaTransition] = useState(false);
  const [planetSealed, setPlanetSealed] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [bossSpawned, setBossSpawned] = useState(false);
  const [secretBossSpawned, setSecretBossSpawned] = useState(false);
  
  const planetLore = useMemo(() => {
    if (!planetTheme) return null;
    return generatePlanetAreas(
      currentPlanetId,
      planetTheme.name,
      planetTheme.biome,
      planetTheme.region,
      planetTheme.difficulty,
      totalShards,
      minEnemiesRequired,
      keysRequired
    );
  }, [currentPlanetId, planetTheme, totalShards, minEnemiesRequired, keysRequired]);
  
  const currentAreaId = currentPlanet?.currentAreaId || `${currentPlanetId}-area-0`;
  const currentArea = planetLore?.areas.find(a => a.id === currentAreaId);
  const areaBiome = currentArea ? getAreaBiomeConfig(currentArea) : null;
  
  const [puzzleActive, setPuzzleActive] = useState(false);
  const [puzzleSequence, setPuzzleSequence] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [puzzlePhase, setPuzzlePhase] = useState<"showing" | "input" | "success" | "fail">("showing");
  const [puzzleShowIndex, setPuzzleShowIndex] = useState(0);
  const [spottedAlerts, setSpottedAlerts] = useState<{id: string, enemyId: string, timestamp: number}[]>([]);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const entryDirection = useRef<string | null>(null);
  const spottedEnemiesRef = useRef<Set<string>>(new Set());
  
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
    if (!currentArea || !planetTheme) return;
    
    const seed = currentPlanetId * 12345 + parseInt(currentAreaId.split('-').pop() || '0') * 1000;
    const random = (n: number) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    const shardCount = currentArea.content.shardCount;
    const newShards: Shard[] = [];
    for (let i = 0; i < shardCount; i++) {
      newShards.push({
        id: i,
        x: Math.floor(random(i * 2) * (MAP_WIDTH - 6)) + 3,
        y: Math.floor(random(i * 2 + 1) * (MAP_HEIGHT - 6)) + 3,
        collected: false,
      });
    }
    setShards(newShards);

    const newKeys: Key[] = [];
    if (currentArea.content.hasKey) {
      newKeys.push({
        id: 0,
        x: Math.floor(random(500) * (MAP_WIDTH - 6)) + 3,
        y: Math.floor(random(501) * (MAP_HEIGHT - 6)) + 3,
        collected: false,
      });
    }
    setKeys(newKeys);

    const enemyCount = currentArea.content.enemyCount;
    const newEnemies: EnemySpawn[] = [];
    const planetEnemies = planetTheme?.enemies || [];
    for (let i = 0; i < enemyCount; i++) {
      const enemyData = planetEnemies[i % planetEnemies.length];
      if (enemyData) {
        newEnemies.push({
          id: `enemy-${currentAreaId}-${i}`,
          name: enemyData.name,
          x: Math.floor(random(i * 3 + 100) * (MAP_WIDTH - 6)) + 3,
          y: Math.floor(random(i * 3 + 101) * (MAP_HEIGHT - 6)) + 3,
          hp: enemyData.hp,
          atk: enemyData.atk,
          def: enemyData.def,
          defeated: false,
          color: enemyData.color,
          spareDialogue: enemyData.spareDialogue,
        });
      }
    }
    setEnemies(newEnemies);

    const newDoors: Door[] = currentArea.connections.map((conn, i) => ({
      id: `door-${currentAreaId}-${i}`,
      x: conn.direction === "north" ? Math.floor(MAP_WIDTH / 2) : 
         conn.direction === "south" ? Math.floor(MAP_WIDTH / 2) :
         conn.direction === "east" ? MAP_WIDTH - 2 : 1,
      y: conn.direction === "north" ? 2 :
         conn.direction === "south" ? MAP_HEIGHT - 4 :
         Math.floor(MAP_HEIGHT / 2),
      targetAreaId: conn.targetAreaId,
      direction: conn.direction,
      type: conn.type,
      routeType: conn.routeType,
      locked: conn.locked || false,
      keyRequired: conn.keyRequired || false,
    }));
    setDoors(newDoors);

    const newLoreObjects: LoreObject[] = currentArea.content.loreNodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      type: node.type,
      title: node.title,
      content: node.content,
      discovered: currentPlanet?.loreDiscovered.includes(node.id) || false,
    }));
    setLoreObjects(newLoreObjects);

    setBossSpawned(false);
    setSecretBossSpawned(false);
    spottedEnemiesRef.current.clear();
    setSpottedAlerts([]);

    if (currentArea.isEntrance && !entryDirection.current) {
      setPlayerPosition({ x: 2 * TILE_SIZE, y: (MAP_HEIGHT / 2) * TILE_SIZE });
    } else if (entryDirection.current) {
      const dir = entryDirection.current;
      let spawnX: number, spawnY: number;
      
      if (dir === "north") {
        spawnX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
        spawnY = (MAP_HEIGHT - 5) * TILE_SIZE;
      } else if (dir === "south") {
        spawnX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
        spawnY = 3 * TILE_SIZE;
      } else if (dir === "east") {
        spawnX = 2 * TILE_SIZE;
        spawnY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;
      } else {
        spawnX = (MAP_WIDTH - 3) * TILE_SIZE;
        spawnY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;
      }
      
      setPlayerPosition({ x: spawnX, y: spawnY });
      entryDirection.current = null;
    }
  }, [currentAreaId, currentArea, planetTheme, currentPlanetId]);

  const checkCollision = (x: number, y: number): boolean => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    return walls.some((w) => w.x === tileX && w.y === tileY);
  };

  const hasLineOfSight = (fromX: number, fromY: number, toX: number, toY: number): boolean => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / (TILE_SIZE * 0.5));
    
    if (steps === 0) return true;
    
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    for (let i = 1; i < steps; i++) {
      const checkX = fromX + stepX * i;
      const checkY = fromY + stepY * i;
      const tileX = Math.floor(checkX / TILE_SIZE);
      const tileY = Math.floor(checkY / TILE_SIZE);
      
      if (walls.some(w => w.x === tileX && w.y === tileY)) {
        return false;
      }
    }
    
    return true;
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
        return;
      }
    }

    for (const key of keys) {
      if (!key.collected && Math.abs(tileX - key.x) < 1 && Math.abs(tileY - key.y) < 1) {
        setKeys((prev) =>
          prev.map((k) => (k.id === key.id ? { ...k, collected: true } : k))
        );
        collectKey();
        return;
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
        if (enemy.isBoss) {
          startBattle(battleEnemy);
          return;
        } else if (enemy.isSecretBoss) {
          startBattle(battleEnemy);
          return;
        } else {
          startBattle(battleEnemy);
          return;
        }
      }
    }

    for (const door of doors) {
      if (Math.abs(tileX - door.x) < 1 && Math.abs(tileY - door.y) < 1) {
        if (door.locked && door.keyRequired) {
          if (currentPlanet && currentPlanet.keysFound >= currentPlanet.keysRequired) {
            setShowDoorPrompt(door);
          }
        } else {
          setShowDoorPrompt(door);
        }
        return;
      }
    }

    for (const lore of loreObjects) {
      if (!lore.discovered && Math.abs(tileX - lore.x) < 1.5 && Math.abs(tileY - lore.y) < 1.5) {
        setShowLoreDialog(lore);
        setLoreObjects(prev => prev.map(l => l.id === lore.id ? { ...l, discovered: true } : l));
        discoverLore(lore.id);
        return;
      }
    }

    if (tileX <= 1 && currentArea?.isEntrance) {
      setShowExitPrompt(true);
    }
    
    if (canSealCore() && !planetSealed &&
        Math.abs(tileX - CORE_POSITION.x) < 1 && Math.abs(tileY - CORE_POSITION.y) < 1) {
      setShowSealPrompt(true);
    }
  };

  const regularEnemiesDefeated = enemies.filter(e => !e.isBoss && !e.isSecretBoss).every(e => defeatedEnemyIds.includes(e.id));
  const allKeysCollected = keys.every(k => k.collected);
  const isInBossLair = currentArea?.isBossLair === true;
  const canSpawnBoss = regularEnemiesDefeated && allKeysCollected && !bossSpawned && !currentPlanet?.bossDefeated && isInBossLair;

  useEffect(() => {
    if (canSpawnBoss && planetTheme?.boss) {
      const boss = planetTheme.boss;
      const newBoss: EnemySpawn = {
        id: `boss-${currentPlanetId}`,
        name: boss.name,
        x: CORE_POSITION.x + 2,
        y: CORE_POSITION.y,
        hp: boss.hp,
        atk: boss.atk,
        def: boss.def,
        defeated: false,
        color: boss.color,
        spareDialogue: boss.spareDialogue,
        isBoss: true,
      };
      setEnemies(prev => [...prev, newBoss]);
      setBossSpawned(true);
    }
  }, [canSpawnBoss, planetTheme, currentPlanetId]);

  useEffect(() => {
    const bossId = `boss-${currentPlanetId}`;
    const bossEnemy = enemies.find(e => e.id === bossId);
    if (bossEnemy && defeatedEnemyIds.includes(bossId) && !currentPlanet?.bossDefeated) {
      defeatBoss();
    }
  }, [defeatedEnemyIds, enemies, currentPlanetId, currentPlanet?.bossDefeated]);

  useEffect(() => {
    const secretBossId = `secretboss-${currentPlanetId}`;
    const secretBoss = enemies.find(e => e.id === secretBossId);
    if (secretBoss && defeatedEnemyIds.includes(secretBossId) && !currentPlanet?.secretBossDefeated) {
      defeatSecretBoss();
    }
  }, [defeatedEnemyIds, enemies, currentPlanetId, currentPlanet?.secretBossDefeated]);

  const allShardsAndKeysCollected = shards.every(s => s.collected) && keys.every(k => k.collected);
  const canSpawnSecretBoss = currentPlanet?.bossDefeated && allShardsAndKeysCollected && 
    !secretBossSpawned && !currentPlanet?.secretBossDefeated && planetTheme?.secretBoss && isInBossLair;

  useEffect(() => {
    if (canSpawnSecretBoss && planetTheme?.secretBoss) {
      const secretBoss = planetTheme.secretBoss;
      const secretX = Math.floor(MAP_WIDTH * 0.8);
      const secretY = Math.floor(MAP_HEIGHT * 0.2);
      const newSecretBoss: EnemySpawn = {
        id: `secretboss-${currentPlanetId}`,
        name: secretBoss.name,
        x: secretX,
        y: secretY,
        hp: secretBoss.hp,
        atk: secretBoss.atk,
        def: secretBoss.def,
        defeated: false,
        color: secretBoss.color,
        spareDialogue: secretBoss.spareDialogue,
        isSecretBoss: true,
      };
      setEnemies(prev => [...prev, newSecretBoss]);
      setSecretBossSpawned(true);
    }
  }, [canSpawnSecretBoss, planetTheme, currentPlanetId]);

  const puzzleType = planetTheme?.puzzleType || "simon";
  const [puzzleStrikes, setPuzzleStrikes] = useState(0);
  const [rhythmBeat, setRhythmBeat] = useState(0);
  const [rhythmTargetBeat, setRhythmTargetBeat] = useState(0);
  const [misdirectionDecoy, setMisdirectionDecoy] = useState<string[]>([]);
  
  const generatePuzzleSequence = () => {
    const directions = ["up", "down", "left", "right"];
    const baseLength = 3;
    const scaleFactor = Math.floor(currentPlanetId / 8);
    const length = Math.min(baseLength + scaleFactor, 8);
    const sequence: string[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(directions[Math.floor(Math.random() * directions.length)]);
    }
    
    if (puzzleType === "misdirection") {
      const decoys: string[] = [];
      for (let i = 0; i < length; i++) {
        const wrongDir = directions.filter(d => d !== sequence[i]);
        decoys.push(wrongDir[Math.floor(Math.random() * wrongDir.length)]);
      }
      setMisdirectionDecoy(decoys);
    }
    
    return sequence;
  };

  const startPuzzle = () => {
    setShowSealPrompt(false);
    setPuzzleActive(true);
    setPuzzleStrikes(0);
    setRhythmBeat(0);
    setRhythmTargetBeat(0);
    const sequence = generatePuzzleSequence();
    setPuzzleSequence(sequence);
    setPlayerInput([]);
    setPuzzlePhase("showing");
    setPuzzleShowIndex(0);
  };

  const completeSeal = () => {
    setPuzzleActive(false);
    setPlanetSealed(true);
    setShowVictory(true);
    
    const state = useRPG.getState();
    useRPG.setState({
      planets: state.planets.map((p) =>
        p.id === currentPlanetId 
          ? { ...p, allEnemiesCleared: true }
          : p
      ),
    });
    
    sealCore();
    
    setTimeout(() => {
      setShowVictory(false);
      returnToHub();
    }, 3000);
  };

  const handlePuzzleInput = (direction: string) => {
    if (puzzlePhase !== "input") return;
    
    if (puzzleType === "rhythm") {
      const isOnBeat = rhythmBeat >= 6 || rhythmBeat <= 1;
      const currentTargetIndex = playerInput.length;
      const isCorrectDir = direction === puzzleSequence[currentTargetIndex];
      
      if (!isOnBeat) {
        setPuzzlePhase("fail");
        setTimeout(() => {
          setPlayerInput([]);
          setRhythmBeat(0);
          setRhythmTargetBeat(0);
          setPuzzlePhase("showing");
          setPuzzleShowIndex(0);
        }, 1000);
        return;
      }
      
      if (!isCorrectDir) {
        setPuzzlePhase("fail");
        setTimeout(() => {
          setPlayerInput([]);
          setRhythmBeat(0);
          setRhythmTargetBeat(0);
          setPuzzlePhase("showing");
          setPuzzleShowIndex(0);
        }, 1000);
        return;
      }
      
      const newInput = [...playerInput, direction];
      setPlayerInput(newInput);
      
      if (newInput.length === puzzleSequence.length) {
        setPuzzlePhase("success");
        setTimeout(() => {
          completeSeal();
        }, 1000);
      }
      return;
    }
    
    const newInput = [...playerInput, direction];
    setPlayerInput(newInput);
    
    const isCorrect = newInput[newInput.length - 1] === puzzleSequence[newInput.length - 1];
    
    if (!isCorrect) {
      if (puzzleType === "simon") {
        const newStrikes = puzzleStrikes + 1;
        setPuzzleStrikes(newStrikes);
        if (newStrikes >= 3) {
          setPuzzlePhase("fail");
          setTimeout(() => {
            setPlayerInput([]);
            setPuzzleStrikes(0);
            setPuzzlePhase("showing");
            setPuzzleShowIndex(0);
          }, 1500);
        } else {
          setPlayerInput(playerInput);
        }
        return;
      } else {
        setPuzzlePhase("fail");
        setTimeout(() => {
          setPlayerInput([]);
          setPuzzlePhase("showing");
          setPuzzleShowIndex(0);
        }, 1000);
        return;
      }
    }
    
    if (newInput.length === puzzleSequence.length) {
      setPuzzlePhase("success");
      setTimeout(() => {
        completeSeal();
      }, 1000);
    }
  };
  
  useEffect(() => {
    if (puzzleType === "rhythm" && puzzlePhase === "input") {
      const beatInterval = setInterval(() => {
        setRhythmBeat(prev => {
          const newBeat = (prev + 1) % 8;
          if (newBeat === 0) {
            setRhythmTargetBeat(t => (t + 1) % puzzleSequence.length);
          }
          return newBeat;
        });
      }, 300);
      return () => clearInterval(beatInterval);
    }
  }, [puzzleType, puzzlePhase, puzzleSequence.length]);

  useEffect(() => {
    if (puzzlePhase === "showing" && puzzleActive) {
      if (puzzleShowIndex < puzzleSequence.length) {
        const timer = setTimeout(() => {
          setPuzzleShowIndex(puzzleShowIndex + 1);
        }, 700);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPuzzlePhase("input");
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [puzzlePhase, puzzleShowIndex, puzzleSequence.length, puzzleActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showVictory) return;
      
      if (puzzleActive && puzzlePhase === "input") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          handlePuzzleInput("up");
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          handlePuzzleInput("down");
        } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          handlePuzzleInput("left");
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          handlePuzzleInput("right");
        }
        return;
      }
      
      if (puzzleActive) return;
      
      if (showSealPrompt) {
        if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          startPuzzle();
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
      
      if (showDoorPrompt) {
        if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          entryDirection.current = showDoorPrompt.direction;
          setShowAreaTransition(true);
          setTimeout(() => {
            changeArea(showDoorPrompt.targetAreaId);
            setShowDoorPrompt(null);
            setShowAreaTransition(false);
          }, 500);
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
          setShowDoorPrompt(null);
        }
        return;
      }
      
      if (showLoreDialog) {
        if (e.key === "z" || e.key === "Z" || e.key === "Enter" || e.key === "x" || e.key === "X" || e.key === "Shift") {
          setShowLoreDialog(null);
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
  }, [showExitPrompt, showSealPrompt, showVictory, puzzleActive, puzzlePhase, playerInput, puzzleSequence, showDoorPrompt, showLoreDialog, changeArea]);

  useEffect(() => {
    const gameLoop = () => {
      if (showExitPrompt || showDoorPrompt || showLoreDialog || showAreaTransition) {
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

      const now = Date.now();
      const newAlerts: {id: string, enemyId: string, timestamp: number}[] = [];
      
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          if (defeatedEnemyIds.includes(enemy.id)) {
            spottedEnemiesRef.current.delete(enemy.id);
            return enemy;
          }
          
          const enemyPixelX = enemy.x * TILE_SIZE;
          const enemyPixelY = enemy.y * TILE_SIZE;
          const distToPlayer = Math.sqrt(
            Math.pow(playerPosition.x - enemyPixelX, 2) + 
            Math.pow(playerPosition.y - enemyPixelY, 2)
          );
          
          if (distToPlayer > ENEMY_DETECTION_RANGE) {
            spottedEnemiesRef.current.delete(enemy.id);
            return { ...enemy, isChasing: false };
          }
          
          const canSee = hasLineOfSight(enemyPixelX, enemyPixelY, playerPosition.x, playerPosition.y);
          
          if (!canSee) {
            spottedEnemiesRef.current.delete(enemy.id);
            return { ...enemy, isChasing: false };
          }
          
          const wasNotChasing = !enemy.isChasing && !spottedEnemiesRef.current.has(enemy.id);
          if (wasNotChasing) {
            spottedEnemiesRef.current.add(enemy.id);
            newAlerts.push({
              id: `alert-${enemy.id}-${now}`,
              enemyId: enemy.id,
              timestamp: now
            });
          }
          
          if (!enemy.lastMoveTime || now - enemy.lastMoveTime > ENEMY_MOVE_INTERVAL) {
            const dirX = playerPosition.x - enemyPixelX;
            const dirY = playerPosition.y - enemyPixelY;
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            
            if (length > TILE_SIZE * 0.5) {
              const normalizedX = dirX / length;
              const normalizedY = dirY / length;
              
              const moveX = normalizedX * ENEMY_SPEED;
              const moveY = normalizedY * ENEMY_SPEED;
              
              const newEnemyX = enemy.x + moveX / TILE_SIZE;
              const newEnemyY = enemy.y + moveY / TILE_SIZE;
              
              const boundedEnemyX = Math.max(1.5, Math.min(MAP_WIDTH - 2.5, newEnemyX));
              const boundedEnemyY = Math.max(1.5, Math.min(MAP_HEIGHT - 2.5, newEnemyY));
              
              const tileX = Math.floor(boundedEnemyX);
              const tileY = Math.floor(boundedEnemyY);
              const isWall = walls.some(w => w.x === tileX && w.y === tileY);
              
              if (!isWall) {
                return {
                  ...enemy,
                  x: boundedEnemyX,
                  y: boundedEnemyY,
                  isChasing: true,
                  lastMoveTime: now,
                };
              }
            }
            
            return { ...enemy, isChasing: true, lastMoveTime: now };
          }
          
          return { ...enemy, isChasing: true };
        });
      });
      
      if (newAlerts.length > 0) {
        setSpottedAlerts(prev => [...prev, ...newAlerts]);
      }
      
      setSpottedAlerts(prev => prev.filter(alert => now - alert.timestamp < 1000));

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerPosition, showExitPrompt, showDoorPrompt, showLoreDialog, showAreaTransition, defeatedEnemyIds, walls]);

  const getPlanetColor = () => {
    return planetTheme?.groundColor || "#1a1a2e";
  };
  
  const getWallColor = () => {
    return planetTheme?.secondaryColor || "#333366";
  };

  const isGamePaused = showExitPrompt || !!showDoorPrompt || !!showLoreDialog || showSealPrompt || showAreaTransition || puzzleActive || showVictory;

  return (
    <div className="w-full h-full bg-black flex flex-col items-center select-none overflow-hidden py-2">
      <div className="text-center mb-2 flex-shrink-0">
        <div
          className="text-xl"
          style={{ 
            fontFamily: "'Courier New', monospace",
            color: planetTheme?.primaryColor || "#FFFFFF"
          }}
        >
          {currentPlanet?.name || "UNKNOWN"}
        </div>
        <div
          className="text-lg text-white"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {currentArea?.name || "Entrance"}
        </div>
        <div
          className="text-xs text-gray-500 italic max-w-md"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {currentArea?.description || ""}
        </div>
        <div
          className="text-sm text-gray-400 mt-1"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {planetTheme?.biome || "Unknown Biome"} | {"★".repeat(planetTheme?.difficulty || 1)} | 
          {currentArea?.isMainPath 
            ? ` Main Path ${currentArea.mainPathOrder}/${planetLore?.areas.filter(a => a.isMainPath).length || 1}`
            : " Side Area"
          }
          {currentArea?.archetype && (
            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
              currentArea.archetype === "combat_arena" ? "bg-red-900/50 text-red-300" :
              currentArea.archetype === "boss_lair" ? "bg-purple-900/50 text-purple-300" :
              currentArea.archetype === "rest_area" ? "bg-green-900/50 text-green-300" :
              currentArea.archetype === "treasure_vault" ? "bg-yellow-900/50 text-yellow-300" :
              currentArea.archetype === "puzzle_chamber" ? "bg-blue-900/50 text-blue-300" :
              currentArea.archetype === "story_hub" ? "bg-cyan-900/50 text-cyan-300" :
              currentArea.archetype === "secret_room" ? "bg-pink-900/50 text-pink-300" :
              currentArea.archetype === "crossroads" ? "bg-orange-900/50 text-orange-300" :
              "bg-gray-800/50 text-gray-300"
            }`}>
              {currentArea.archetype.replace("_", " ").toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div
        className="relative border-4 flex-shrink-0"
        style={{
          width: MAP_WIDTH * TILE_SIZE,
          height: MAP_HEIGHT * TILE_SIZE,
          backgroundColor: getPlanetColor(),
          borderColor: planetTheme?.primaryColor || "#FFFFFF",
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
              backgroundColor: getWallColor(),
              border: `1px solid ${planetTheme?.primaryColor || "#444"}`,
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

        {!isGamePaused && shards.map((shard) =>
          !shard.collected ? (
            <div
              key={`shard-${shard.id}`}
              className="absolute animate-sprite-float"
              style={{
                left: shard.x * TILE_SIZE,
                top: shard.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              <Sprite type="shard" size={TILE_SIZE} glow glowColor="#AA00FF" />
            </div>
          ) : null
        )}

        {!isGamePaused && keys.map((key) =>
          !key.collected ? (
            <div
              key={`key-${key.id}`}
              className="absolute animate-bounce"
              style={{
                left: key.x * TILE_SIZE,
                top: key.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              <Sprite type="key" size={TILE_SIZE} glow glowColor="#FFD700" />
            </div>
          ) : null
        )}

        {!isGamePaused && doors.map((door) => {
          const isLocked = door.locked && door.keyRequired && currentPlanet && currentPlanet.keysFound < currentPlanet.keysRequired;
          const isMainPath = door.routeType === "main";
          const isSecret = door.routeType === "secret";
          
          const glowColor = isLocked ? "#FF0000"
            : isMainPath ? "#00FF00"
            : isSecret ? "#FF00FF"
            : "#7B68EE";
          
          return (
            <div
              key={door.id}
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: door.x * TILE_SIZE,
                top: door.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              <Sprite 
                type="door" 
                size={TILE_SIZE}
                glow={!isLocked}
                glowColor={glowColor}
                style={{ opacity: isLocked ? 0.5 : 1 }}
              />
              <span className="absolute text-white text-lg font-bold" style={{ textShadow: "0 0 4px black" }}>
                {door.direction === "north" ? "↑" : door.direction === "south" ? "↓" : door.direction === "east" ? "→" : "←"}
              </span>
              {isMainPath && (
                <span className="absolute -bottom-1 text-[8px] text-green-300 font-bold">MAIN</span>
              )}
              {isLocked && (
                <span className="absolute text-red-500 text-lg">🔒</span>
              )}
            </div>
          );
        })}

        {!isGamePaused && loreObjects.map((lore) => (
          <div
            key={lore.id}
            className={`absolute flex items-center justify-center ${lore.discovered ? 'opacity-50' : 'animate-pulse'}`}
            style={{
              left: lore.x * TILE_SIZE,
              top: lore.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: lore.discovered ? "#444" : "#00CED1",
              border: `2px solid ${lore.discovered ? "#666" : "#00FFFF"}`,
              boxShadow: lore.discovered ? "none" : "0 0 12px #00FFFF",
              borderRadius: lore.type === "memory" || lore.type === "echo" ? "50%" : "4px",
            }}
          >
            <span className="text-xs">
              {lore.type === "tablet" ? "📜" : lore.type === "terminal" ? "💻" : lore.type === "memory" ? "💫" : lore.type === "inscription" ? "🔮" : lore.type === "echo" ? "👁" : "🗿"}
            </span>
          </div>
        ))}

        {!isGamePaused && enemies.map((enemy) => {
          const isDefeated = defeatedEnemyIds.includes(enemy.id);
          const isBossEnemy = enemy.isBoss || enemy.isSecretBoss;
          const isChasing = enemy.isChasing && !isBossEnemy;
          const spriteSize = isBossEnemy ? TILE_SIZE * 2 : TILE_SIZE;
          return !isDefeated ? (
            <div
              key={enemy.id}
              className={`absolute flex items-center justify-center transition-all duration-75 ${isBossEnemy ? 'animate-pulse' : ''}`}
              style={{
                left: enemy.x * TILE_SIZE - (isBossEnemy ? TILE_SIZE/2 : 0),
                top: enemy.y * TILE_SIZE - (isBossEnemy ? TILE_SIZE/2 : 0),
                width: spriteSize,
                height: spriteSize,
                zIndex: isBossEnemy ? 10 : 1,
              }}
            >
              <Sprite 
                type={isBossEnemy ? "boss" : getEnemySpriteType(enemy.name)} 
                size={spriteSize}
                glow={isChasing || isBossEnemy}
                glowColor={isChasing ? "#FF0000" : isBossEnemy ? "#FFD700" : enemy.color || "#FF0000"}
              />
              {isChasing && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-lg animate-bounce">!</div>
              )}
            </div>
          ) : null;
        })}

        {spottedAlerts.map((alert) => {
          const enemy = enemies.find(e => e.id === alert.enemyId);
          if (!enemy || defeatedEnemyIds.includes(enemy.id)) return null;
          
          const age = Date.now() - alert.timestamp;
          const opacity = Math.max(0, 1 - age / 1000);
          const scale = 1 + (age / 1000) * 0.5;
          const yOffset = -(age / 1000) * 20;
          
          return (
            <div
              key={alert.id}
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: enemy.x * TILE_SIZE - 8,
                top: enemy.y * TILE_SIZE - TILE_SIZE + yOffset,
                width: 48,
                height: 32,
                opacity,
                transform: `scale(${scale})`,
                zIndex: 100,
              }}
            >
              <div
                className="px-2 py-1 rounded font-bold text-sm"
                style={{
                  backgroundColor: "rgba(255, 0, 0, 0.9)",
                  color: "#FFFF00",
                  border: "2px solid #FFFF00",
                  boxShadow: "0 0 12px #FF0000",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                !!
              </div>
            </div>
          );
        })}

        <div
          className="absolute"
          style={{
            left: playerPosition.x,
            top: playerPosition.y,
            width: TILE_SIZE,
            height: TILE_SIZE,
            transition: "left 0.05s, top 0.05s",
          }}
        >
          <Sprite type="player" size={TILE_SIZE} />
        </div>

        {!isGamePaused && allEnemiesDefeated && !planetSealed && (
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
                Begin core alignment sequence?
              </p>
              <p
                className="text-gray-400"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Z/Enter: Begin | X/Shift: Cancel
              </p>
            </div>
          </div>
        )}

        {showDoorPrompt && (() => {
          const targetArea = planetLore?.areas.find(a => a.id === showDoorPrompt.targetAreaId);
          const isMainRoute = showDoorPrompt.routeType === "main";
          const isSecretRoute = showDoorPrompt.routeType === "secret";
          
          return (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
            >
              <div className={`bg-black border-4 p-6 text-center ${
                isMainRoute ? "border-green-400" : isSecretRoute ? "border-pink-400" : "border-yellow-400"
              }`}>
                <p
                  className={`text-xl mb-2 ${
                    isMainRoute ? "text-green-400" : isSecretRoute ? "text-pink-400" : "text-yellow-400"
                  }`}
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {isMainRoute ? "→ MAIN PATH →" : isSecretRoute ? "??? SECRET ???" : "~ SIDE PATH ~"}
                </p>
                <p
                  className="text-white text-lg mb-2"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {targetArea?.name || "Unknown Area"}
                </p>
                <p
                  className="text-gray-500 text-sm mb-4 italic"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {targetArea?.isMainPath 
                    ? `Main Path ${targetArea.mainPathOrder}/${planetLore?.areas.filter(a => a.isMainPath).length || 1}`
                    : "Optional exploration"
                  }
                </p>
                <p
                  className="text-gray-400"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  Z/Enter: Yes | X/Shift: No
                </p>
              </div>
            </div>
          );
        })()}

        {showLoreDialog && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          >
            <div className="bg-black border-4 border-cyan-400 p-6 text-center max-w-[500px]">
              <p
                className="text-cyan-400 text-lg mb-4"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {showLoreDialog.title}
              </p>
              {showLoreDialog.content.map((line, i) => (
                <p
                  key={i}
                  className="text-white text-sm mb-2"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {line}
                </p>
              ))}
              <p
                className="text-gray-400 mt-4"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Press any key to close
              </p>
            </div>
          </div>
        )}

        {showAreaTransition && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black"
            style={{ zIndex: 100 }}
          >
            <p
              className="text-white text-2xl animate-pulse"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              ...
            </p>
          </div>
        )}

        {puzzleActive && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
          >
            <div className="bg-black border-4 border-cyan-400 p-8 text-center min-w-[400px]">
              <p
                className="text-cyan-400 text-2xl mb-2"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                CORE ALIGNMENT
              </p>
              <p
                className="text-gray-500 text-sm mb-4"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {puzzleType === "simon" ? "SIMON MODE - 3 Strikes Allowed" : 
                 puzzleType === "rhythm" ? "RHYTHM MODE - Time Your Inputs" :
                 "MISDIRECTION MODE - Ignore The Decoys"}
              </p>
              
              {puzzleType === "simon" && puzzlePhase === "input" && (
                <div className="flex justify-center gap-2 mb-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${i < puzzleStrikes ? 'bg-red-500' : 'bg-gray-600'}`}
                    />
                  ))}
                  <span className="text-red-400 ml-2 text-sm" style={{ fontFamily: "'Courier New', monospace" }}>
                    {3 - puzzleStrikes} strikes left
                  </span>
                </div>
              )}
              
              {puzzlePhase === "showing" && (
                <div>
                  <p
                    className="text-white text-lg mb-6"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    {puzzleType === "misdirection" ? "Remember the GLOWING directions..." : "Memorize the sequence..."}
                  </p>
                  <div className="flex justify-center gap-4 mb-4">
                    {puzzleSequence.map((dir, i) => {
                      const isCurrentlyShowing = i === puzzleShowIndex - 1;
                      const isRevealed = i < puzzleShowIndex;
                      const decoyDir = misdirectionDecoy[i];
                      return (
                        <div key={i} className="relative">
                          {puzzleType === "misdirection" && isCurrentlyShowing && decoyDir && (
                            <div
                              className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 text-xl opacity-60 animate-pulse"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              {decoyDir === "up" ? "↑" : decoyDir === "down" ? "↓" : decoyDir === "left" ? "←" : "→"}
                            </div>
                          )}
                          <div
                            className={`w-16 h-16 border-4 flex items-center justify-center text-3xl transition-all duration-300 ${
                              isCurrentlyShowing 
                                ? "border-yellow-400 bg-yellow-900 text-yellow-300 scale-125 shadow-lg shadow-yellow-400/50" 
                                : isRevealed
                                  ? "border-cyan-400 bg-cyan-900 text-cyan-300" 
                                  : "border-gray-700 text-gray-700 bg-gray-900"
                            }`}
                            style={{ 
                              fontFamily: "'Courier New', monospace",
                              transform: isCurrentlyShowing ? 'scale(1.25)' : 'scale(1)',
                            }}
                          >
                            {isRevealed ? (
                              dir === "up" ? "↑" : dir === "down" ? "↓" : dir === "left" ? "←" : "→"
                            ) : "?"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p
                    className="text-cyan-400 text-sm mt-2"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Step {puzzleShowIndex} of {puzzleSequence.length}
                  </p>
                </div>
              )}
              
              {puzzlePhase === "input" && (
                <div>
                  <p
                    className="text-yellow-400 text-lg mb-4"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Enter the sequence!
                  </p>
                  
                  {puzzleType === "rhythm" && (
                    <div className="mb-4">
                      <div className="flex justify-center gap-1 mb-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded ${
                              i === rhythmBeat 
                                ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' 
                                : i < rhythmBeat ? 'bg-cyan-600' : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-cyan-400 text-xs" style={{ fontFamily: "'Courier New', monospace" }}>
                        Input on beat {rhythmTargetBeat + 1}: {puzzleSequence[rhythmTargetBeat]}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4 mb-4">
                    {puzzleSequence.map((dir, i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 border-2 flex items-center justify-center text-2xl ${
                          i < playerInput.length 
                            ? playerInput[i] === puzzleSequence[i]
                              ? "border-green-400 bg-green-900 text-green-300" 
                              : "border-red-400 bg-red-900 text-red-300"
                            : puzzleType === "rhythm" && i === rhythmTargetBeat
                              ? "border-yellow-400 bg-yellow-900/50 text-yellow-300 animate-pulse"
                              : "border-gray-600 text-gray-600"
                        }`}
                        style={{ fontFamily: "'Courier New', monospace" }}
                      >
                        {i < playerInput.length ? (
                          playerInput[i] === "up" ? "↑" : playerInput[i] === "down" ? "↓" : playerInput[i] === "left" ? "←" : "→"
                        ) : "?"}
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-gray-400 mt-4"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Use Arrow Keys or WASD
                  </p>
                </div>
              )}
              
              {puzzlePhase === "success" && (
                <div>
                  <p
                    className="text-green-400 text-2xl animate-pulse"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    ALIGNMENT COMPLETE!
                  </p>
                </div>
              )}
              
              {puzzlePhase === "fail" && (
                <div>
                  <p
                    className="text-red-400 text-2xl"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    MISALIGNMENT! Try again...
                  </p>
                </div>
              )}
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
                className="text-green-400 mb-1"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                +1 Core Sealed
              </p>
              <p
                className="text-purple-400"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {shards.filter(s => s.collected).length} Nebuli Shards Collected
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-2 flex flex-wrap gap-6 text-white justify-center flex-shrink-0"
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
          <span className="text-yellow-400">KEYS:</span>{" "}
          {keys.filter((k) => k.collected).length}/{keys.length}
        </div>
        <div>
          <span className="text-red-400">ENEMIES:</span>{" "}
          {enemies.filter((e) => !e.isBoss && !e.isSecretBoss && defeatedEnemyIds.includes(e.id)).length}/
          {enemies.filter((e) => !e.isBoss && !e.isSecretBoss).length}
        </div>
        <div>
          <span className="text-orange-400">BOSS:</span>{" "}
          {currentPlanet?.bossDefeated ? "✓" : bossSpawned ? "ACTIVE" : "LOCKED"}
        </div>
      </div>

      <div
        className="mt-1 text-gray-500 text-xs text-center max-w-lg flex-shrink-0"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {currentPlanet?.bossDefeated && !planetSealed 
          ? "Boss defeated! Find the golden CORE to seal this planet!"
          : bossSpawned
            ? "The BOSS has appeared! Defeat it to unlock the core!"
            : regularEnemiesDefeated && allKeysCollected
              ? "All enemies cleared and keys collected! The BOSS approaches..."
              : `Collect ${keys.length} keys | Defeat ${enemies.filter(e => !e.isBoss).length} enemies | Find the boss`
        }
      </div>
    </div>
  );
}
