import { CSSProperties, useMemo } from "react";

export type SpriteType = 
  | "player"
  | "lakine"
  | "zara"
  | "korin"
  | "mira"
  | "enemy_basic"
  | "enemy_eye"
  | "enemy_crystal"
  | "boss"
  | "door"
  | "shard"
  | "key"
  | "healing"
  | "portal";

export type AnimationType = 
  | "none"
  | "idle"
  | "walk"
  | "float"
  | "bob"
  | "attack"
  | "hurt"
  | "spawn"
  | "shimmer"
  | "portal"
  | "menace"
  | "sparkle";

const SPRITE_PATHS: Record<SpriteType, string> = {
  player: "/sprites/player_character_sprite.png",
  lakine: "/sprites/lakine_guide_sprite.png",
  zara: "/sprites/zara_companion_sprite.png",
  korin: "/sprites/korin_companion_sprite.png",
  mira: "/sprites/mira_mechanic_sprite.png",
  enemy_basic: "/sprites/basic_alien_enemy_sprite.png",
  enemy_eye: "/sprites/eye_alien_enemy_sprite.png",
  enemy_crystal: "/sprites/crystal_alien_enemy_sprite.png",
  boss: "/sprites/boss_monster_sprite.png",
  door: "/sprites/door_portal_sprite.png",
  shard: "/sprites/nebuli_shard_sprite.png",
  key: "/sprites/key_collectible_sprite.png",
  healing: "/sprites/healing_station_sprite.png",
  portal: "/sprites/galaxy_portal_sprite.png",
};

const ANIMATION_CLASSES: Record<AnimationType, string> = {
  none: "",
  idle: "animate-sprite-idle",
  walk: "animate-sprite-walk",
  float: "animate-sprite-float",
  bob: "animate-sprite-bob",
  attack: "animate-sprite-attack",
  hurt: "animate-sprite-hurt",
  spawn: "animate-sprite-spawn",
  shimmer: "animate-sprite-shimmer",
  portal: "animate-portal-swirl",
  menace: "animate-enemy-menace",
  sparkle: "animate-item-sparkle",
};

interface SpriteProps {
  type: SpriteType;
  size?: number;
  className?: string;
  style?: CSSProperties;
  animation?: AnimationType;
  glow?: boolean;
  glowColor?: string;
  hueRotate?: number;
  saturation?: number;
  brightness?: number;
  flipX?: boolean;
}

export function Sprite({ 
  type, 
  size = 64,
  className = "", 
  style = {},
  animation = "idle",
  glow = false,
  glowColor = "#ffffff",
  hueRotate = 0,
  saturation = 100,
  brightness = 100,
  flipX = false,
}: SpriteProps) {
  const filters = useMemo(() => {
    const filterParts: string[] = [];
    
    if (hueRotate !== 0) {
      filterParts.push(`hue-rotate(${hueRotate}deg)`);
    }
    if (saturation !== 100) {
      filterParts.push(`saturate(${saturation}%)`);
    }
    if (brightness !== 100) {
      filterParts.push(`brightness(${brightness}%)`);
    }
    if (glow) {
      filterParts.push(`drop-shadow(0 0 ${Math.floor(size / 8)}px ${glowColor})`);
      filterParts.push(`drop-shadow(0 0 ${Math.floor(size / 4)}px ${glowColor})`);
    }
    
    return filterParts.length > 0 ? filterParts.join(" ") : undefined;
  }, [hueRotate, saturation, brightness, glow, glowColor, size]);

  const animationClass = ANIMATION_CLASSES[animation] || "";

  return (
    <div 
      className={`${className} ${animationClass}`.trim()}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <img 
        src={SPRITE_PATHS[type]}
        alt={type}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          imageRendering: "pixelated",
          filter: filters,
          transform: flipX ? "scaleX(-1)" : undefined,
        }}
        draggable={false}
      />
    </div>
  );
}

export interface EnemyVariant {
  baseType: SpriteType;
  hueRotate: number;
  saturation: number;
  brightness: number;
  glowColor: string;
  hasGlow: boolean;
}

const ENEMY_BASE_TYPES: SpriteType[] = ["enemy_basic", "enemy_eye", "enemy_crystal"];

export function generateEnemyVariant(enemyName: string, planetId: number, enemyIndex: number): EnemyVariant {
  const nameLower = enemyName.toLowerCase();
  
  let baseType: SpriteType = "enemy_basic";
  if (nameLower.includes("eye") || nameLower.includes("watcher") || nameLower.includes("seer") || nameLower.includes("gazer")) {
    baseType = "enemy_eye";
  } else if (nameLower.includes("crystal") || nameLower.includes("shard") || nameLower.includes("gem") || nameLower.includes("prism")) {
    baseType = "enemy_crystal";
  } else if (nameLower.includes("golem") || nameLower.includes("construct") || nameLower.includes("machine")) {
    baseType = "enemy_crystal";
  } else if (nameLower.includes("ghost") || nameLower.includes("phantom") || nameLower.includes("spirit") || nameLower.includes("specter")) {
    baseType = "enemy_eye";
  } else {
    baseType = ENEMY_BASE_TYPES[(planetId + enemyIndex) % ENEMY_BASE_TYPES.length];
  }
  
  const seed = (planetId * 1000 + enemyIndex * 7 + nameLower.charCodeAt(0)) % 360;
  const hueRotate = seed;
  
  const satSeed = ((planetId * 13 + enemyIndex * 23) % 60) + 70;
  const saturation = satSeed;
  
  const brightSeed = ((planetId * 7 + enemyIndex * 11) % 40) + 80;
  const brightness = brightSeed;
  
  const glowHue = (hueRotate + 180) % 360;
  const glowColor = `hsl(${glowHue}, 70%, 60%)`;
  
  const hasGlow = (planetId + enemyIndex) % 3 === 0;
  
  return {
    baseType,
    hueRotate,
    saturation,
    brightness,
    glowColor,
    hasGlow,
  };
}

export function EnemySprite({ 
  enemyName, 
  planetId, 
  enemyIndex,
  size = 64,
  animation = "menace",
  isBoss = false,
  className = "",
  style = {},
}: {
  enemyName: string;
  planetId: number;
  enemyIndex: number;
  size?: number;
  animation?: AnimationType;
  isBoss?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const variant = useMemo(() => 
    generateEnemyVariant(enemyName, planetId, enemyIndex), 
    [enemyName, planetId, enemyIndex]
  );

  if (isBoss) {
    return (
      <Sprite
        type="boss"
        size={size * 1.5}
        animation={animation}
        glow={true}
        glowColor="#ff4444"
        hueRotate={(planetId * 30) % 360}
        saturation={120}
        brightness={110}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Sprite
      type={variant.baseType}
      size={size}
      animation={animation}
      glow={variant.hasGlow}
      glowColor={variant.glowColor}
      hueRotate={variant.hueRotate}
      saturation={variant.saturation}
      brightness={variant.brightness}
      className={className}
      style={style}
    />
  );
}

export function getEnemySpriteType(enemyName: string): SpriteType {
  const nameLower = enemyName.toLowerCase();
  if (nameLower.includes("eye") || nameLower.includes("watcher") || nameLower.includes("seer")) {
    return "enemy_eye";
  }
  if (nameLower.includes("crystal") || nameLower.includes("shard") || nameLower.includes("gem")) {
    return "enemy_crystal";
  }
  return "enemy_basic";
}

export function getNPCSpriteType(npcId: string): SpriteType {
  switch (npcId) {
    case "lakine": return "lakine";
    case "zara": return "zara";
    case "korin": return "korin";
    case "mira": return "mira";
    case "healer": return "healing";
    case "galaxy_portal": return "portal";
    default: return "player";
  }
}

export function ItemSprite({
  type,
  size = 48,
  className = "",
  style = {},
}: {
  type: "shard" | "key" | "healing";
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const spriteType: SpriteType = type === "healing" ? "healing" : type;
  const animation: AnimationType = type === "shard" ? "sparkle" : type === "key" ? "float" : "bob";
  const glowColor = type === "shard" ? "#9b59b6" : type === "key" ? "#f1c40f" : "#2ecc71";

  return (
    <Sprite
      type={spriteType}
      size={size}
      animation={animation}
      glow={true}
      glowColor={glowColor}
      className={className}
      style={style}
    />
  );
}

export function NPCSprite({
  npcId,
  size = 64,
  isMoving = false,
  className = "",
  style = {},
}: {
  npcId: string;
  size?: number;
  isMoving?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const spriteType = getNPCSpriteType(npcId);
  const isPortal = npcId === "galaxy_portal";
  const isHealer = npcId === "healer";
  
  return (
    <Sprite
      type={spriteType}
      size={size}
      animation={isPortal ? "portal" : isMoving ? "walk" : "idle"}
      glow={isPortal || isHealer}
      glowColor={isPortal ? "#9b59b6" : isHealer ? "#2ecc71" : "#ffffff"}
      className={className}
      style={style}
    />
  );
}

export function PlayerSprite({
  size = 64,
  isMoving = false,
  flipX = false,
  className = "",
  style = {},
}: {
  size?: number;
  isMoving?: boolean;
  flipX?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Sprite
      type="player"
      size={size}
      animation={isMoving ? "walk" : "idle"}
      flipX={flipX}
      className={className}
      style={style}
    />
  );
}
