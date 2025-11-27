import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRPG } from "../../lib/stores/useRPG";
import { getEnemyDialogue, getBossDialogue, TalkOption } from "../../lib/data/enemyDialogue";
import { Sprite, getEnemySpriteType } from "./Sprite";

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const ARENA_WIDTH = 400;
const ARENA_HEIGHT = 300;
const SOUL_SIZE = 16;
const BULLET_SIZE = 10;
const SOUL_SPEED = 5;

export function Battle() {
  const {
    currentEnemy,
    battlePhase,
    setBattlePhase,
    hp,
    maxHp,
    level,
    atk,
    def,
    hopeBonus,
    inventory,
    damageEnemy,
    progressTalk,
    spareEnemy,
    takeDamage,
    useItem,
    endBattle,
  } = useRPG();
  
  const effectiveMaxHp = maxHp + hopeBonus.hp;
  const effectiveDef = def + hopeBonus.def;

  const [menuIndex, setMenuIndex] = useState(0);
  const [actIndex, setActIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [talkIndex, setTalkIndex] = useState(0);
  const [soulPosition, setSoulPosition] = useState({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [battleMessage, setBattleMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [attackTimer, setAttackTimer] = useState(0);
  const [enemyTurnActive, setEnemyTurnActive] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [spareProgress, setSpareProgress] = useState(0);
  const [showTalkMenu, setShowTalkMenu] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const bulletIdRef = useRef(0);

  const menuOptions = ["FIGHT", "ACT", "ITEM", "DEFEND", "MERCY"];
  const actOptions = ["Check", "Talk", "Flirt"];
  const healingItems = inventory.filter((i) => i.type === "healing");

  const isBoss = currentEnemy && currentEnemy.maxHp >= 80;
  
  const enemyDialogue = useMemo(() => {
    if (!currentEnemy) return null;
    return isBoss ? getBossDialogue(currentEnemy.name) : getEnemyDialogue(currentEnemy.name);
  }, [currentEnemy, isBoss]);
  
  const talkOptions = enemyDialogue?.talkOptions || [];
  const isSecretBoss = currentEnemy && currentEnemy.maxHp >= 120;
  const bossPhase = currentEnemy ? (currentEnemy.hp <= currentEnemy.maxHp * 0.5 ? 2 : 1) : 1;

  const getEnemyPattern = useCallback((): string => {
    if (!currentEnemy) return "rain";
    const name = currentEnemy.name.toUpperCase();
    
    if (name.includes("LEAF") || name.includes("PETAL") || name.includes("BLOOM") || name.includes("FLORA") || name.includes("GRASS") || name.includes("FERN")) return "scatter";
    if (name.includes("MOSS") || name.includes("SPORE") || name.includes("FUNGAL") || name.includes("MYCO") || name.includes("SHROOM") || name.includes("MOLD")) return "pulse";
    if (name.includes("THORN") || name.includes("SPINE") || name.includes("CACTUS") || name.includes("NEEDLE") || name.includes("SPIKE") || name.includes("BARB")) return "burst";
    if (name.includes("RAIN") || name.includes("DEW") || name.includes("MIST") || name.includes("PUDDLE") || name.includes("WATER") || name.includes("DRIP") || name.includes("DROP")) return "rain";
    if (name.includes("WIND") || name.includes("BREEZE") || name.includes("GUST") || name.includes("STORM") || name.includes("AIR") || name.includes("ZEPHYR")) return "sweep";
    if (name.includes("VINE") || name.includes("SNAKE") || name.includes("TENDRIL") || name.includes("WORM") || name.includes("SERPENT") || name.includes("CRAWLER")) return "zigzag";
    if (name.includes("BEE") || name.includes("WASP") || name.includes("INSECT") || name.includes("BUG") || name.includes("FLY") || name.includes("MOTH") || name.includes("NECTAR")) return "chase";
    if (name.includes("SPIRIT") || name.includes("GHOST") || name.includes("WISP") || name.includes("SOUL") || name.includes("SPECTER") || name.includes("PHANTOM") || name.includes("SHADE")) return "orbit";
    if (name.includes("KNIGHT") || name.includes("WARRIOR") || name.includes("GUARD") || name.includes("SOLDIER") || name.includes("CHAMPION") || name.includes("PALADIN") || name.includes("REED")) return "cross";
    if (name.includes("CRYSTAL") || name.includes("GEM") || name.includes("SHARD") || name.includes("PRISM") || name.includes("GLASS") || name.includes("DIAMOND")) return "split";
    if (name.includes("ICE") || name.includes("FROST") || name.includes("SNOW") || name.includes("FREEZE") || name.includes("COLD") || name.includes("GLACIAL") || name.includes("CHILL")) return "wave";
    if (name.includes("FIRE") || name.includes("FLAME") || name.includes("BLAZE") || name.includes("EMBER")) return "barrage";
    if (name.includes("LAVA") || name.includes("MAGMA") || name.includes("MOLTEN") || name.includes("VOLCANIC")) return "vortex";
    if (name.includes("VOID") || name.includes("SHADOW") || name.includes("DARK") || name.includes("ABYSS")) return "aimed";
    if (name.includes("STAR") || name.includes("CELESTIAL") || name.includes("COSMIC") || name.includes("ASTRAL")) return "spiral";
    if (name.includes("ANCIENT") || name.includes("ELDER") || name.includes("TITAN") || name.includes("COLOSSUS") || name.includes("GOLEM")) return "corners";
    if (name.includes("BEAST") || name.includes("CREATURE") || name.includes("MONSTER") || name.includes("BRUTE") || name.includes("HULK")) return "bounce";
    if (name.includes("STONE") || name.includes("ROCK") || name.includes("TOTEM") || name.includes("BOULDER") || name.includes("GRANITE")) return "sides";
    if (name.includes("FOG") || name.includes("HAZE") || name.includes("CLOUD") || name.includes("VAPOR") || name.includes("STEAM")) return "scatter";
    if (name.includes("SLIME") || name.includes("OOZE") || name.includes("BLOB") || name.includes("JELLY") || name.includes("GOO")) return "pulse";
    if (name.includes("DANCER") || name.includes("JUMPER") || name.includes("HOPPER") || name.includes("LEAPER")) return "zigzag";
    if (name.includes("APE") || name.includes("GORILLA") || name.includes("MONKEY") || name.includes("PRIMATE")) return "barrage";
    if (name.includes("CRAB") || name.includes("LOBSTER") || name.includes("SHELL") || name.includes("CLAM")) return "sides";
    if (name.includes("FISH") || name.includes("SHARK") || name.includes("EEL") || name.includes("PIRANHA") || name.includes("AQUA")) return "wave";
    if (name.includes("BIRD") || name.includes("HAWK") || name.includes("EAGLE") || name.includes("RAVEN") || name.includes("OWL")) return "sweep";
    if (name.includes("DEMON") || name.includes("DEVIL") || name.includes("IMP") || name.includes("FIEND")) return "vortex";
    if (name.includes("ANGEL") || name.includes("SERAPH") || name.includes("HERALD") || name.includes("DIVINE")) return "orbit";
    if (name.includes("ROBOT") || name.includes("MECH") || name.includes("DROID") || name.includes("AUTOMATON")) return "cross";
    if (name.includes("PANDA") || name.includes("BEAR") || name.includes("WOLF") || name.includes("FOX") || name.includes("CAT")) return "chase";
    if (name.includes("CHIME") || name.includes("BELL") || name.includes("RING") || name.includes("GONG")) return "pulse";
    if (name.includes("WALKER") || name.includes("STRIDER") || name.includes("RUNNER") || name.includes("STALKER")) return "zigzag";
    if (name.includes("WARDEN") || name.includes("KEEPER") || name.includes("SENTINEL") || name.includes("PROTECTOR")) return "cross";
    if (name.includes("SEEKER") || name.includes("HUNTER") || name.includes("TRACKER") || name.includes("PREDATOR")) return "aimed";
    
    const patterns = ["rain", "spiral", "sides", "wave", "aimed", "corners", "burst", "scatter", "pulse"];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }, [currentEnemy]);

  const spawnBullets = useCallback((patternOverride?: string) => {
    const newBullets: Bullet[] = [];
    const pattern = patternOverride || getEnemyPattern();
    const baseSpeed = 2.5 + (currentEnemy?.atk || 5) / 10;
    const speed = isBoss ? baseSpeed * (bossPhase === 2 ? 1.4 : 1.2) : baseSpeed;
    const bulletMultiplier = isBoss ? (bossPhase === 2 ? 1.5 : 1.25) : 1;

    if (pattern === "rain") {
      const count = Math.floor(8 * bulletMultiplier);
      for (let i = 0; i < count; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: Math.random() * ARENA_WIDTH,
          y: -10,
          vx: (Math.random() - 0.5) * 2,
          vy: speed + Math.random() * 1.5,
        });
      }
    } else if (pattern === "spiral") {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
    } else if (pattern === "sides") {
      for (let i = 0; i < 4; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: -10,
          y: Math.random() * ARENA_HEIGHT,
          vx: speed + 1,
          vy: (Math.random() - 0.5) * 2,
        });
        newBullets.push({
          id: bulletIdRef.current++,
          x: ARENA_WIDTH + 10,
          y: Math.random() * ARENA_HEIGHT,
          vx: -(speed + 1),
          vy: (Math.random() - 0.5) * 2,
        });
      }
    } else if (pattern === "wave") {
      for (let i = 0; i < 8; i++) {
        const offset = Math.sin(i * 0.5) * 30;
        newBullets.push({
          id: bulletIdRef.current++,
          x: (i / 7) * ARENA_WIDTH,
          y: -10 + offset,
          vx: 0,
          vy: speed,
        });
      }
    } else if (pattern === "aimed") {
      const targetX = soulPosition.x + SOUL_SIZE / 2;
      const targetY = soulPosition.y + SOUL_SIZE / 2;
      const corners = [
        { x: 0, y: 0 },
        { x: ARENA_WIDTH, y: 0 },
        { x: 0, y: ARENA_HEIGHT },
        { x: ARENA_WIDTH, y: ARENA_HEIGHT },
      ];
      for (const corner of corners) {
        const dx = targetX - corner.x;
        const dy = targetY - corner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        newBullets.push({
          id: bulletIdRef.current++,
          x: corner.x,
          y: corner.y,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
        });
      }
    } else if (pattern === "corners") {
      const spawnPoints = [
        { x: 0, y: 0, vx: speed, vy: speed },
        { x: ARENA_WIDTH, y: 0, vx: -speed, vy: speed },
        { x: 0, y: ARENA_HEIGHT, vx: speed, vy: -speed },
        { x: ARENA_WIDTH, y: ARENA_HEIGHT, vx: -speed, vy: -speed },
      ];
      for (const point of spawnPoints) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: point.x,
          y: point.y,
          vx: point.vx,
          vy: point.vy,
        });
      }
    } else if (pattern === "burst") {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX + (Math.random() - 0.5) * 40,
          y: centerY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * (speed + 1),
          vy: Math.sin(angle) * (speed + 1),
        });
      }
    } else if (pattern === "orbit") {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      const time = Date.now() / 500;
      for (let i = 0; i < 6; i++) {
        const angle = time + (i / 6) * Math.PI * 2;
        const radius = 80;
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: Math.cos(angle + Math.PI / 2) * speed,
          vy: Math.sin(angle + Math.PI / 2) * speed,
        });
      }
    } else if (pattern === "cross") {
      for (let i = 0; i < 5; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: -10,
          y: ARENA_HEIGHT / 2 + (i - 2) * 25,
          vx: speed + 1,
          vy: 0,
        });
        newBullets.push({
          id: bulletIdRef.current++,
          x: (i / 4) * ARENA_WIDTH,
          y: -10,
          vx: 0,
          vy: speed + 1,
        });
      }
    } else if (pattern === "scatter") {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        if (edge === 0) { x = Math.random() * ARENA_WIDTH; y = -10; }
        else if (edge === 1) { x = Math.random() * ARENA_WIDTH; y = ARENA_HEIGHT + 10; }
        else if (edge === 2) { x = -10; y = Math.random() * ARENA_HEIGHT; }
        else { x = ARENA_WIDTH + 10; y = Math.random() * ARENA_HEIGHT; }
        const dx = ARENA_WIDTH / 2 - x;
        const dy = ARENA_HEIGHT / 2 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        newBullets.push({
          id: bulletIdRef.current++,
          x,
          y,
          vx: (dx / dist) * speed * 0.8,
          vy: (dy / dist) * speed * 0.8,
        });
      }
    } else if (pattern === "chase") {
      const targetX = soulPosition.x + SOUL_SIZE / 2;
      const targetY = soulPosition.y + SOUL_SIZE / 2;
      for (let i = 0; i < 3; i++) {
        const startX = Math.random() * ARENA_WIDTH;
        const startY = Math.random() < 0.5 ? -10 : ARENA_HEIGHT + 10;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        newBullets.push({
          id: bulletIdRef.current++,
          x: startX,
          y: startY,
          vx: (dx / dist) * (speed + 0.5),
          vy: (dy / dist) * (speed + 0.5),
        });
      }
    } else if (pattern === "pulse") {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      const rings = 2;
      for (let r = 0; r < rings; r++) {
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + (r * Math.PI / 6);
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * (speed + r * 0.5),
            vy: Math.sin(angle) * (speed + r * 0.5),
          });
        }
      }
    } else if (pattern === "zigzag") {
      for (let i = 0; i < 6; i++) {
        const startY = (i / 5) * ARENA_HEIGHT;
        newBullets.push({
          id: bulletIdRef.current++,
          x: -10,
          y: startY,
          vx: speed,
          vy: Math.sin(i) * 2,
        });
      }
    } else if (pattern === "split") {
      const startX = ARENA_WIDTH / 2;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI - Math.PI / 2;
        newBullets.push({
          id: bulletIdRef.current++,
          x: startX,
          y: -10,
          vx: Math.cos(angle) * speed * 0.8,
          vy: Math.abs(Math.sin(angle)) * speed + 1,
        });
      }
    } else if (pattern === "bounce") {
      for (let i = 0; i < 5; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: Math.random() * ARENA_WIDTH,
          y: -10,
          vx: (Math.random() - 0.5) * 4,
          vy: speed + Math.random(),
        });
      }
    } else if (pattern === "sweep") {
      const time = Date.now() / 1000;
      for (let i = 0; i < 8; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: -10,
          y: (i / 7) * ARENA_HEIGHT,
          vx: speed + 1.5,
          vy: Math.sin(time + i * 0.5) * 1.5,
        });
      }
    } else if (pattern === "vortex") {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 120;
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: -Math.cos(angle) * speed * 0.5 + Math.sin(angle) * 1.5,
          vy: -Math.sin(angle) * speed * 0.5 - Math.cos(angle) * 1.5,
        });
      }
    } else if (pattern === "barrage") {
      for (let i = 0; i < 12; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: Math.random() * ARENA_WIDTH,
          y: -10 - Math.random() * 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: speed + Math.random() * 2,
        });
      }
    }

    setBullets((prev) => [...prev, ...newBullets]);
    
    if (isBoss && bossPhase === 2 && !patternOverride) {
      const secondPattern = ["spiral", "rain", "barrage", "vortex"][Math.floor(Math.random() * 4)];
      if (secondPattern !== pattern) {
        setTimeout(() => {
          spawnBullets(secondPattern);
        }, 300);
      }
    }
  }, [soulPosition, currentEnemy, getEnemyPattern, isBoss, bossPhase]);

  const handleMenuSelect = () => {
    const option = menuOptions[menuIndex];
    
    switch (option) {
      case "FIGHT":
        setBattlePhase("fight");
        const damage = Math.floor(Math.random() * 5) + atk;
        damageEnemy(damage);
        setBattleMessage(`You dealt ${damage} damage!`);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          if (currentEnemy && currentEnemy.hp <= damage) {
            setBattleMessage(`${currentEnemy.name} was defeated!`);
            setShowMessage(true);
            setTimeout(() => {
              endBattle("victory");
            }, 1500);
          } else {
            startEnemyTurn();
          }
        }, 1500);
        break;
        
      case "ACT":
        setBattlePhase("act");
        break;
        
      case "ITEM":
        if (healingItems.length > 0) {
          setBattlePhase("item");
        } else {
          setBattleMessage("No items!");
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 1000);
        }
        break;
        
      case "DEFEND":
        setBattlePhase("defend");
        setIsDefending(true);
        setBattleMessage("You braced yourself!");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          startEnemyTurn();
        }, 1000);
        break;
        
      case "MERCY":
        setBattlePhase("mercy");
        if (currentEnemy?.canSpare) {
          setBattleMessage(`You spared ${currentEnemy.name}!`);
          setShowMessage(true);
          setTimeout(() => {
            spareEnemy();
          }, 1500);
        } else {
          setBattleMessage(`${currentEnemy?.name} isn't ready to be spared.`);
          setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
            startEnemyTurn();
          }, 1500);
        }
        break;
    }
  };

  const handleActSelect = () => {
    const act = actOptions[actIndex];
    
    switch (act) {
      case "Check":
        setBattleMessage(`${currentEnemy?.name} - HP: ${currentEnemy?.hp}/${currentEnemy?.maxHp} ATK: ${currentEnemy?.atk} DEF: ${currentEnemy?.def}`);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          setBattlePhase("menu");
        }, 2000);
        break;
        
      case "Talk":
        setShowTalkMenu(true);
        setTalkIndex(0);
        break;
        
      case "Flirt":
        const flirtResponse = enemyDialogue?.flirtResponse || `${currentEnemy?.name} doesn't know how to react.`;
        setBattleMessage(flirtResponse);
        setShowMessage(true);
        setSpareProgress(prev => Math.min(100, prev + 5));
        setTimeout(() => {
          setShowMessage(false);
          startEnemyTurn();
        }, 1500);
        break;
    }
  };

  const handleTalkSelect = () => {
    const option = talkOptions[talkIndex];
    if (!option || !currentEnemy) return;
    
    setShowTalkMenu(false);
    setBattleMessage(option.response);
    setShowMessage(true);
    
    let newProgress = spareProgress;
    if (option.effect === "progress") {
      newProgress = Math.min(100, spareProgress + (option.progressAmount || 20));
    } else if (option.effect === "setback") {
      newProgress = Math.max(0, spareProgress + (option.progressAmount || -10));
    } else if (option.effect === "instant_spare") {
      newProgress = 100;
    }
    setSpareProgress(newProgress);
    
    if (newProgress >= 100) {
      progressTalk();
      progressTalk();
      progressTalk();
    } else if (option.effect === "progress") {
      progressTalk();
    }
    
    setTimeout(() => {
      setShowMessage(false);
      if (newProgress >= 100 && currentEnemy?.canSpare) {
        setBattleMessage(`* ${currentEnemy.name} can now be SPARED! *`);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          startEnemyTurn();
        }, 1500);
      } else if (newProgress >= 100) {
        setBattleMessage(`* ${currentEnemy.name} is ready to be spared... *`);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          startEnemyTurn();
        }, 1500);
      } else {
        startEnemyTurn();
      }
    }, 1500);
  };

  const handleItemSelect = () => {
    const item = healingItems[itemIndex];
    if (item) {
      useItem(item.id);
      setBattleMessage(`You used ${item.name}! Restored ${item.value} HP!`);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        startEnemyTurn();
      }, 1500);
    }
  };

  const [warningText, setWarningText] = useState("");
  
  const startEnemyTurn = () => {
    setBattlePhase("enemy_attack");
    setEnemyTurnActive(true);
    setAttackTimer(0);
    setBullets([]);
    setSoulPosition({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50 });
    
    const warnings = [
      "* Bullets incoming! *",
      "* Watch out! *",
      "* Here it comes! *",
      "* Dodge carefully! *",
    ];
    setWarningText(warnings[Math.floor(Math.random() * warnings.length)]);
    setTimeout(() => setWarningText(""), 800);
    
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnBullets(), 500 + i * 400);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (battlePhase === "enemy_attack") {
        keysPressed.current.add(e.key.toLowerCase());
        return;
      }

      if (showMessage) return;

      if (battlePhase === "menu") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          setMenuIndex((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          setMenuIndex((prev) => (prev + 1) % menuOptions.length);
        } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          handleMenuSelect();
        }
      } else if (battlePhase === "act") {
        if (showTalkMenu) {
          if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            setTalkIndex((prev) => (prev - 1 + talkOptions.length) % talkOptions.length);
          } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
            setTalkIndex((prev) => (prev + 1) % talkOptions.length);
          } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
            handleTalkSelect();
          } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
            setShowTalkMenu(false);
          }
        } else {
          if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            setActIndex((prev) => (prev - 1 + actOptions.length) % actOptions.length);
          } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
            setActIndex((prev) => (prev + 1) % actOptions.length);
          } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
            handleActSelect();
          } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
            setBattlePhase("menu");
          }
        }
      } else if (battlePhase === "item") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          setItemIndex((prev) => (prev - 1 + healingItems.length) % healingItems.length);
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          setItemIndex((prev) => (prev + 1) % healingItems.length);
        } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          handleItemSelect();
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
          setBattlePhase("menu");
        }
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
  }, [battlePhase, menuIndex, actIndex, itemIndex, talkIndex, showMessage, showTalkMenu, currentEnemy, talkOptions.length]);

  useEffect(() => {
    if (battlePhase !== "enemy_attack" || !enemyTurnActive) return;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) dy -= SOUL_SPEED;
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) dy += SOUL_SPEED;
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) dx -= SOUL_SPEED;
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) dx += SOUL_SPEED;

      setSoulPosition((prev) => ({
        x: Math.max(0, Math.min(ARENA_WIDTH - SOUL_SIZE, prev.x + dx)),
        y: Math.max(0, Math.min(ARENA_HEIGHT - SOUL_SIZE, prev.y + dy)),
      }));

      setBullets((prev) => {
        const updated = prev
          .map((b) => ({
            ...b,
            x: b.x + b.vx,
            y: b.y + b.vy,
          }))
          .filter(
            (b) =>
              b.x > -50 && b.x < ARENA_WIDTH + 50 && b.y > -50 && b.y < ARENA_HEIGHT + 50
          );

        for (const bullet of updated) {
          const soulCenterX = soulPosition.x + SOUL_SIZE / 2;
          const soulCenterY = soulPosition.y + SOUL_SIZE / 2;
          const bulletCenterX = bullet.x + BULLET_SIZE / 2;
          const bulletCenterY = bullet.y + BULLET_SIZE / 2;
          const distance = Math.sqrt(
            Math.pow(soulCenterX - bulletCenterX, 2) +
            Math.pow(soulCenterY - bulletCenterY, 2)
          );

          if (distance < (SOUL_SIZE + BULLET_SIZE) / 2) {
            const damage = isDefending ? Math.floor((currentEnemy?.atk || 5) / 2) : currentEnemy?.atk || 5;
            takeDamage(damage);
            setDamageFlash(true);
            setScreenShake(true);
            setTimeout(() => setDamageFlash(false), 200);
            setTimeout(() => setScreenShake(false), 150);
            return updated.filter((b) => b.id !== bullet.id);
          }
        }

        return updated;
      });

      setAttackTimer((prev) => prev + 1);

      if (attackTimer > 180) {
        setEnemyTurnActive(false);
        setIsDefending(false);
        setBullets([]);
        setBattlePhase("menu");
      } else {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [battlePhase, enemyTurnActive, soulPosition, attackTimer, isDefending, currentEnemy]);

  useEffect(() => {
    if (hp <= 0) {
      setBattleMessage("You were defeated...");
      setShowMessage(true);
      setTimeout(() => {
        endBattle("defeat");
      }, 2000);
    }
  }, [hp]);

  useEffect(() => {
    if (currentEnemy) {
      setSpareProgress(currentEnemy.talkProgress || 0);
    }
  }, [currentEnemy?.talkProgress]);
  
  if (!currentEnemy) return null;

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center select-none transition-all ${
        screenShake ? 'animate-shake' : ''
      }`}
      style={{ 
        backgroundColor: damageFlash ? '#330000' : '#000000',
        transition: 'background-color 0.1s'
      }}
    >
      <div
        className="text-white text-2xl mb-4"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {currentEnemy.name}
      </div>

      <div className="mb-2 w-48 h-4 bg-gray-800 border border-white">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
        />
      </div>

      <div
        className="relative border-4 border-white mb-4"
        style={{
          width: ARENA_WIDTH,
          height: ARENA_HEIGHT,
          backgroundColor: "#000",
        }}
      >
        {battlePhase === "enemy_attack" && (
          <>
            <div
              className="absolute"
              style={{
                left: soulPosition.x,
                top: soulPosition.y,
                width: SOUL_SIZE,
                height: SOUL_SIZE,
                backgroundColor: "#FF0000",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                transform: "rotate(180deg)",
              }}
            />

            {bullets.map((bullet) => (
              <div
                key={bullet.id}
                className="absolute rounded-full"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  width: BULLET_SIZE,
                  height: BULLET_SIZE,
                  backgroundColor: "#FFFFFF",
                }}
              />
            ))}
          </>
        )}

        {battlePhase !== "enemy_attack" && !showMessage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${currentEnemy.canSpare ? 'animate-pulse' : ''}`}>
              <Sprite 
                type={isBoss ? "boss" : getEnemySpriteType(currentEnemy.name)} 
                size={isBoss ? 128 : 96}
                glow={currentEnemy.canSpare}
                glowColor={currentEnemy.canSpare ? "#FFD700" : undefined}
              />
            </div>
          </div>
        )}

        {showMessage && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p
              className="text-white text-xl text-center"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {battleMessage}
            </p>
          </div>
        )}
      </div>

      {battlePhase === "menu" && !showMessage && (
        <div className="flex gap-4">
          {menuOptions.map((option, index) => (
            <div
              key={option}
              className={`px-4 py-2 border-2 cursor-pointer ${
                index === menuIndex
                  ? "border-yellow-400 text-yellow-400"
                  : "border-white text-white"
              }`}
              style={{ fontFamily: "'Courier New', monospace" }}
              onClick={() => {
                setMenuIndex(index);
                handleMenuSelect();
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {battlePhase === "act" && !showMessage && !showTalkMenu && (
        <div className="flex flex-col gap-2">
          {actOptions.map((option, index) => (
            <div
              key={option}
              className={`px-4 py-2 cursor-pointer ${
                index === actIndex ? "text-yellow-400" : "text-white"
              }`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {index === actIndex ? "▶ " : "  "}
              {option}
            </div>
          ))}
          <div className="mt-2 mb-2">
            <p className="text-gray-400 text-xs mb-1" style={{ fontFamily: "'Courier New', monospace" }}>
              SPARE PROGRESS:
            </p>
            <div className="w-48 h-3 bg-gray-800 border border-gray-600">
              <div
                className="h-full transition-all"
                style={{ 
                  width: `${spareProgress}%`,
                  backgroundColor: spareProgress >= 100 ? "#FFD700" : "#00FF00"
                }}
              />
            </div>
            {spareProgress >= 100 && (
              <p className="text-yellow-400 text-xs mt-1 animate-pulse" style={{ fontFamily: "'Courier New', monospace" }}>
                Ready to SPARE!
              </p>
            )}
          </div>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "'Courier New', monospace" }}>
            X/Shift: Back
          </p>
        </div>
      )}

      {battlePhase === "act" && !showMessage && showTalkMenu && (
        <div className="flex flex-col gap-2">
          <p className="text-cyan-400 text-lg mb-2" style={{ fontFamily: "'Courier New', monospace" }}>
            What do you say?
          </p>
          {talkOptions.map((option, index) => (
            <div
              key={option.id}
              className={`px-4 py-2 cursor-pointer ${
                index === talkIndex ? "text-yellow-400" : "text-white"
              }`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {index === talkIndex ? "▶ " : "  "}
              {option.text}
            </div>
          ))}
          <div className="mt-2 mb-2">
            <p className="text-gray-400 text-xs mb-1" style={{ fontFamily: "'Courier New', monospace" }}>
              SPARE PROGRESS:
            </p>
            <div className="w-48 h-3 bg-gray-800 border border-gray-600">
              <div
                className="h-full transition-all"
                style={{ 
                  width: `${spareProgress}%`,
                  backgroundColor: spareProgress >= 100 ? "#FFD700" : "#00FF00"
                }}
              />
            </div>
          </div>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "'Courier New', monospace" }}>
            X/Shift: Back
          </p>
        </div>
      )}

      {battlePhase === "item" && !showMessage && (
        <div className="flex flex-col gap-2">
          {healingItems.map((item, index) => (
            <div
              key={item.id}
              className={`px-4 py-2 cursor-pointer ${
                index === itemIndex ? "text-yellow-400" : "text-white"
              }`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {index === itemIndex ? "▶ " : "  "}
              {item.name} x{item.quantity}
            </div>
          ))}
          <p className="text-gray-500 text-sm mt-2" style={{ fontFamily: "'Courier New', monospace" }}>
            X/Shift: Back
          </p>
        </div>
      )}

      {battlePhase === "enemy_attack" && (
        <div className="text-center">
          {warningText && (
            <p
              className="text-yellow-400 text-xl animate-pulse mb-2"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {warningText}
            </p>
          )}
          <p
            className="text-gray-400"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            DODGE! Use WASD/Arrows to move your SOUL!
          </p>
        </div>
      )}

      <div
        className="mt-4 flex gap-8 text-white items-center"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        <div>
          <span className="text-gray-400">HP:</span>{" "}
          <span className={hp < effectiveMaxHp / 4 ? "text-red-500" : ""}>{hp}/{effectiveMaxHp}</span>
        </div>
        <div>
          <span className="text-gray-400">LV:</span> {level}
        </div>
        {hopeBonus.def > 0 && (
          <div>
            <span className="text-cyan-400">DEF+{hopeBonus.def}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">MERCY:</span>
          <div className="w-24 h-3 bg-gray-800 border border-gray-600">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${(spareProgress / 3) * 100}%`,
                backgroundColor: currentEnemy.canSpare ? '#FFD700' : '#FFFF00'
              }}
            />
          </div>
          {currentEnemy.canSpare && (
            <span className="text-yellow-400 animate-pulse">READY!</span>
          )}
        </div>
      </div>
    </div>
  );
}
