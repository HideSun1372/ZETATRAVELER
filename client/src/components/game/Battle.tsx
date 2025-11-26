import { useEffect, useRef, useState, useCallback } from "react";
import { useRPG } from "../../lib/stores/useRPG";

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
    inventory,
    damageEnemy,
    progressTalk,
    spareEnemy,
    takeDamage,
    useItem,
    endBattle,
  } = useRPG();

  const [menuIndex, setMenuIndex] = useState(0);
  const [actIndex, setActIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [soulPosition, setSoulPosition] = useState({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [battleMessage, setBattleMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [attackTimer, setAttackTimer] = useState(0);
  const [enemyTurnActive, setEnemyTurnActive] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const bulletIdRef = useRef(0);

  const menuOptions = ["FIGHT", "ACT", "ITEM", "DEFEND", "MERCY"];
  const actOptions = ["Check", "Talk", "Flirt"];
  const healingItems = inventory.filter((i) => i.type === "healing");

  const spawnBullets = useCallback((patternOverride?: string) => {
    const newBullets: Bullet[] = [];
    const patterns = ["rain", "spiral", "sides", "wave", "aimed", "corners"];
    const pattern = patternOverride || patterns[Math.floor(Math.random() * patterns.length)];

    if (pattern === "rain") {
      for (let i = 0; i < 8; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: Math.random() * ARENA_WIDTH,
          y: -10,
          vx: (Math.random() - 0.5) * 2,
          vy: 3 + Math.random() * 2,
        });
      }
    } else if (pattern === "spiral") {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * 3.5,
          vy: Math.sin(angle) * 3.5,
        });
      }
    } else if (pattern === "sides") {
      for (let i = 0; i < 4; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: -10,
          y: Math.random() * ARENA_HEIGHT,
          vx: 4,
          vy: (Math.random() - 0.5) * 2,
        });
        newBullets.push({
          id: bulletIdRef.current++,
          x: ARENA_WIDTH + 10,
          y: Math.random() * ARENA_HEIGHT,
          vx: -4,
          vy: (Math.random() - 0.5) * 2,
        });
      }
    } else if (pattern === "wave") {
      for (let i = 0; i < 6; i++) {
        newBullets.push({
          id: bulletIdRef.current++,
          x: (i / 5) * ARENA_WIDTH,
          y: -10,
          vx: 0,
          vy: 3,
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
          vx: (dx / dist) * 3,
          vy: (dy / dist) * 3,
        });
      }
    } else if (pattern === "corners") {
      const spawnPoints = [
        { x: 0, y: 0, vx: 3, vy: 3 },
        { x: ARENA_WIDTH, y: 0, vx: -3, vy: 3 },
        { x: 0, y: ARENA_HEIGHT, vx: 3, vy: -3 },
        { x: ARENA_WIDTH, y: ARENA_HEIGHT, vx: -3, vy: -3 },
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
    }

    setBullets((prev) => [...prev, ...newBullets]);
  }, [soulPosition]);

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
        progressTalk();
        const talkResponses = [
          `You tried talking to ${currentEnemy?.name}.`,
          `${currentEnemy?.name} seems to be listening...`,
          `${currentEnemy?.name} is reconsidering...`,
        ];
        const response = talkResponses[Math.min((currentEnemy?.talkProgress || 0), 2)];
        setBattleMessage(response);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          if (currentEnemy?.canSpare) {
            setBattleMessage(`* ${currentEnemy.name} can now be SPARED! *`);
            setShowMessage(true);
            setTimeout(() => {
              setShowMessage(false);
              startEnemyTurn();
            }, 1500);
          } else {
            startEnemyTurn();
          }
        }, 1500);
        break;
        
      case "Flirt":
        setBattleMessage(`You winked at ${currentEnemy?.name}. It seems confused.`);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          startEnemyTurn();
        }, 1500);
        break;
    }
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
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          setActIndex((prev) => (prev - 1 + actOptions.length) % actOptions.length);
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          setActIndex((prev) => (prev + 1) % actOptions.length);
        } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          handleActSelect();
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift") {
          setBattlePhase("menu");
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
  }, [battlePhase, menuIndex, actIndex, itemIndex, showMessage, currentEnemy]);

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
            const damage = isDefending ? Math.floor(currentEnemy?.atk || 5 / 2) : currentEnemy?.atk || 5;
            takeDamage(damage);
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

  if (!currentEnemy) return null;

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
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
            <div
              className="text-6xl"
              style={{
                color: currentEnemy.canSpare ? "#FFFF00" : "#FF6B6B",
              }}
            >
              {currentEnemy.name[0]}
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

      {battlePhase === "act" && !showMessage && (
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
          <p className="text-gray-500 text-sm mt-2" style={{ fontFamily: "'Courier New', monospace" }}>
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
        className="mt-4 flex gap-8 text-white"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        <div>
          <span className="text-gray-400">HP:</span>{" "}
          <span className={hp < maxHp / 4 ? "text-red-500" : ""}>{hp}/{maxHp}</span>
        </div>
        <div>
          <span className="text-gray-400">LV:</span> {level}
        </div>
        {currentEnemy.canSpare && (
          <div className="text-yellow-400 animate-pulse">* SPARE READY *</div>
        )}
      </div>
    </div>
  );
}
