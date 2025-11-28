import { CSSProperties, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { getEnemySpritePath } from "@/lib/data/enemySprites";

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

const processedSpriteCache = new Map<string, string>();

function removeWhiteBackground(imageSrc: string): Promise<string> {
  const cached = processedSpriteCache.get(imageSrc);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0;
        } else if (r > 220 && g > 220 && b > 220) {
          data[i + 3] = Math.floor(data[i + 3] * 0.3);
        } else if (r > 200 && g > 200 && b > 200) {
          data[i + 3] = Math.floor(data[i + 3] * 0.6);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const processedUrl = canvas.toDataURL("image/png");
      processedSpriteCache.set(imageSrc, processedUrl);
      resolve(processedUrl);
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

function useProcessedSprite(spritePath: string): string {
  const [processedUrl, setProcessedUrl] = useState<string>(spritePath);

  useEffect(() => {
    let mounted = true;
    removeWhiteBackground(spritePath).then(url => {
      if (mounted) setProcessedUrl(url);
    });
    return () => { mounted = false; };
  }, [spritePath]);

  return processedUrl;
}

interface SpriteAnimationConfig {
  frameCount: number;
  fps: number;
  loop: boolean;
  yoyo: boolean;
}

const SPRITE_ANIMATIONS: Record<AnimationType, SpriteAnimationConfig> = {
  none: { frameCount: 1, fps: 0, loop: false, yoyo: false },
  idle: { frameCount: 4, fps: 3, loop: true, yoyo: true },
  walk: { frameCount: 6, fps: 10, loop: true, yoyo: false },
  float: { frameCount: 4, fps: 4, loop: true, yoyo: true },
  bob: { frameCount: 3, fps: 3, loop: true, yoyo: true },
  attack: { frameCount: 4, fps: 12, loop: false, yoyo: false },
  hurt: { frameCount: 2, fps: 8, loop: false, yoyo: false },
  spawn: { frameCount: 5, fps: 8, loop: false, yoyo: false },
  shimmer: { frameCount: 3, fps: 5, loop: true, yoyo: true },
  portal: { frameCount: 8, fps: 6, loop: true, yoyo: false },
  menace: { frameCount: 4, fps: 4, loop: true, yoyo: true },
  sparkle: { frameCount: 4, fps: 6, loop: true, yoyo: true },
};

function useSpriteAnimator(animation: AnimationType): { frame: number; scale: number; offsetY: number; rotation: number } {
  const [frame, setFrame] = useState(0);
  const [direction, setDirection] = useState(1);
  const frameRef = useRef(0);
  const directionRef = useRef(1);
  const lastTimeRef = useRef(0);
  const config = SPRITE_ANIMATIONS[animation];

  useEffect(() => {
    if (config.fps === 0) return;

    const interval = 1000 / config.fps;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= interval) {
        lastTimeRef.current = currentTime;
        
        if (config.yoyo) {
          const nextFrame = frameRef.current + directionRef.current;
          if (nextFrame >= config.frameCount - 1) {
            directionRef.current = -1;
            frameRef.current = config.frameCount - 1;
          } else if (nextFrame <= 0) {
            directionRef.current = 1;
            frameRef.current = 0;
          } else {
            frameRef.current = nextFrame;
          }
        } else {
          frameRef.current = (frameRef.current + 1) % config.frameCount;
        }
        
        setFrame(frameRef.current);
        setDirection(directionRef.current);
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [animation, config.fps, config.frameCount, config.yoyo]);

  const animationEffects = useMemo(() => {
    const normalizedFrame = frame / Math.max(1, config.frameCount - 1);
    
    switch (animation) {
      case "idle":
        return {
          scale: 1 + Math.sin(normalizedFrame * Math.PI) * 0.03,
          offsetY: Math.sin(normalizedFrame * Math.PI) * 2,
          rotation: 0,
        };
      case "walk":
        return {
          scale: 1,
          offsetY: Math.abs(Math.sin(frame * Math.PI / 3)) * 4,
          rotation: Math.sin(frame * Math.PI / 3) * 3,
        };
      case "float":
        return {
          scale: 1 + Math.sin(normalizedFrame * Math.PI) * 0.05,
          offsetY: Math.sin(normalizedFrame * Math.PI) * 6,
          rotation: Math.sin(normalizedFrame * Math.PI * 2) * 2,
        };
      case "bob":
        return {
          scale: 1,
          offsetY: Math.sin(normalizedFrame * Math.PI) * 3,
          rotation: 0,
        };
      case "menace":
        return {
          scale: 1 + Math.sin(normalizedFrame * Math.PI * 2) * 0.08,
          offsetY: Math.sin(normalizedFrame * Math.PI) * 2,
          rotation: Math.sin(normalizedFrame * Math.PI * 2) * 5,
        };
      case "sparkle":
        return {
          scale: 1 + Math.sin(normalizedFrame * Math.PI * 2) * 0.1,
          offsetY: Math.sin(normalizedFrame * Math.PI) * 3,
          rotation: frame * 5,
        };
      case "portal":
        return {
          scale: 1 + Math.sin(normalizedFrame * Math.PI) * 0.1,
          offsetY: 0,
          rotation: frame * 8,
        };
      case "attack":
        return {
          scale: 1 + (frame === 2 ? 0.2 : 0),
          offsetY: frame === 2 ? -5 : 0,
          rotation: frame === 2 ? 10 : 0,
        };
      case "hurt":
        return {
          scale: 0.9,
          offsetY: 0,
          rotation: frame % 2 === 0 ? -10 : 10,
        };
      case "shimmer":
        return {
          scale: 1,
          offsetY: 0,
          rotation: 0,
        };
      default:
        return { scale: 1, offsetY: 0, rotation: 0 };
    }
  }, [animation, frame, config.frameCount]);

  return { frame, ...animationEffects };
}

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
  const spritePath = SPRITE_PATHS[type];
  const processedSprite = useProcessedSprite(spritePath);
  const { scale, offsetY, rotation } = useSpriteAnimator(animation);

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

  const transform = useMemo(() => {
    const transforms: string[] = [];
    if (flipX) transforms.push("scaleX(-1)");
    if (scale !== 1) transforms.push(`scale(${scale})`);
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    return transforms.length > 0 ? transforms.join(" ") : undefined;
  }, [flipX, scale, rotation]);

  return (
    <div 
      className={className}
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
        src={processedSprite}
        alt={type}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          imageRendering: "pixelated",
          filter: filters,
          transform,
          marginTop: -offsetY,
          transition: "margin-top 0.05s ease-out",
        }}
        draggable={false}
      />
    </div>
  );
}

export interface EnemyAppearance {
  baseType: SpriteType;
  hueRotate: number;
  saturation: number;
  brightness: number;
  glowColor: string;
  hasGlow: boolean;
  bodyShape: "round" | "angular" | "spiky" | "amorphous" | "tall" | "wide";
  eyeStyle: "single" | "multiple" | "slits" | "glowing" | "compound" | "none";
  accessoryType: "horns" | "spikes" | "wings" | "tendrils" | "crystals" | "none";
  auraColor: string;
  scaleModifier: number;
}

const BODY_SHAPES = ["round", "angular", "spiky", "amorphous", "tall", "wide"] as const;
const EYE_STYLES = ["single", "multiple", "slits", "glowing", "compound", "none"] as const;
const ACCESSORY_TYPES = ["horns", "spikes", "wings", "tendrils", "crystals", "none"] as const;

const BIOME_HUE_RANGES: Record<string, [number, number]> = {
  "Verdant Cluster": [80, 160],
  "Frozen Expanse": [180, 240],
  "Inferno Sector": [0, 40],
  "Void Realm": [260, 320],
  "Celestial Heights": [40, 80],
};

const ENEMY_BASE_TYPES: SpriteType[] = ["enemy_basic", "enemy_eye", "enemy_crystal"];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateEnemyAppearance(
  enemyName: string, 
  enemyType: string,
  planetId: number, 
  enemyIndex: number,
  region: string = "Verdant Cluster"
): EnemyAppearance {
  const nameHash = hashString(enemyName + enemyType);
  const uniqueSeed = nameHash + planetId * 1000 + enemyIndex * 7;
  
  const nameLower = enemyName.toLowerCase();
  const typeLower = enemyType.toLowerCase();
  
  let baseType: SpriteType = "enemy_basic";
  if (typeLower.includes("eye") || typeLower.includes("watcher") || typeLower.includes("seer") || 
      typeLower.includes("gazer") || typeLower.includes("observer")) {
    baseType = "enemy_eye";
  } else if (typeLower.includes("crystal") || typeLower.includes("shard") || typeLower.includes("gem") || 
             typeLower.includes("prism") || typeLower.includes("geode")) {
    baseType = "enemy_crystal";
  } else if (typeLower.includes("golem") || typeLower.includes("construct") || typeLower.includes("machine") ||
             typeLower.includes("automaton") || typeLower.includes("drone")) {
    baseType = "enemy_crystal";
  } else if (typeLower.includes("ghost") || typeLower.includes("phantom") || typeLower.includes("spirit") || 
             typeLower.includes("specter") || typeLower.includes("wraith")) {
    baseType = "enemy_eye";
  } else if (typeLower.includes("slime") || typeLower.includes("blob") || typeLower.includes("ooze") ||
             typeLower.includes("jelly")) {
    baseType = "enemy_basic";
  } else {
    baseType = ENEMY_BASE_TYPES[uniqueSeed % ENEMY_BASE_TYPES.length];
  }
  
  const hueRange = BIOME_HUE_RANGES[region] || [0, 360];
  const hueSpread = hueRange[1] - hueRange[0];
  const baseHue = hueRange[0] + ((uniqueSeed * 37) % hueSpread);
  const hueVariation = ((nameHash % 60) - 30);
  const hueRotate = (baseHue + hueVariation + 360) % 360;
  
  const saturation = 70 + ((uniqueSeed * 13) % 50);
  const brightness = 80 + ((uniqueSeed * 11) % 40);
  
  const glowHue = (hueRotate + 120 + (uniqueSeed % 60)) % 360;
  const glowColor = `hsl(${glowHue}, 80%, 60%)`;
  const hasGlow = (uniqueSeed % 4) === 0;
  
  const bodyShape = BODY_SHAPES[uniqueSeed % BODY_SHAPES.length];
  const eyeStyle = EYE_STYLES[(uniqueSeed * 3) % EYE_STYLES.length];
  const accessoryType = ACCESSORY_TYPES[(uniqueSeed * 7) % ACCESSORY_TYPES.length];
  
  const auraHue = (hueRotate + 60) % 360;
  const auraColor = `hsla(${auraHue}, 70%, 50%, 0.3)`;
  
  const scaleModifier = 0.85 + ((uniqueSeed % 30) / 100);

  return {
    baseType,
    hueRotate,
    saturation,
    brightness,
    glowColor,
    hasGlow,
    bodyShape,
    eyeStyle,
    accessoryType,
    auraColor,
    scaleModifier,
  };
}

export function EnemySprite({ 
  enemyName, 
  enemyType = "",
  planetId, 
  enemyIndex,
  region = "Verdant Cluster",
  size = 64,
  animation = "menace",
  isBoss = false,
  isChasing = false,
  className = "",
  style = {},
}: {
  enemyName: string;
  enemyType?: string;
  planetId: number;
  enemyIndex: number;
  region?: string;
  size?: number;
  animation?: AnimationType;
  isBoss?: boolean;
  isChasing?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const uniqueSpritePath = useMemo(() => getEnemySpritePath(enemyName), [enemyName]);
  const processedUniqueSprite = useProcessedSprite(uniqueSpritePath || "");
  const { scale, offsetY, rotation } = useSpriteAnimator(isChasing ? "attack" : animation);

  const appearance = useMemo(() => 
    generateEnemyAppearance(enemyName, enemyType, planetId, enemyIndex, region), 
    [enemyName, enemyType, planetId, enemyIndex, region]
  );

  const effectiveAnimation = isChasing ? "attack" : animation;
  const effectiveSize = size;

  if (isBoss) {
    return (
      <div className="relative" style={{ width: size * 1.5, height: size * 1.5 }}>
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${appearance.auraColor} 0%, transparent 70%)`,
            transform: "scale(1.5)",
          }}
        />
        <Sprite
          type="boss"
          size={size * 1.5}
          animation={effectiveAnimation}
          glow={true}
          glowColor="#ff4444"
          hueRotate={(planetId * 30) % 360}
          saturation={120}
          brightness={110}
          className={className}
          style={style}
        />
      </div>
    );
  }

  const transform = useMemo(() => {
    const transforms: string[] = [];
    if (scale !== 1) transforms.push(`scale(${scale})`);
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    return transforms.length > 0 ? transforms.join(" ") : undefined;
  }, [scale, rotation]);

  const glowFilter = useMemo(() => {
    if (isChasing) {
      return `drop-shadow(0 0 8px #ff0000) drop-shadow(0 0 16px #ff0000)`;
    }
    if (appearance.hasGlow) {
      return `drop-shadow(0 0 6px ${appearance.glowColor}) drop-shadow(0 0 12px ${appearance.glowColor})`;
    }
    return undefined;
  }, [isChasing, appearance.hasGlow, appearance.glowColor]);

  if (uniqueSpritePath && processedUniqueSprite) {
    return (
      <div className={`relative ${className}`} style={{ width: effectiveSize, height: effectiveSize, ...style }}>
        {(appearance.hasGlow || isChasing) && (
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${isChasing ? 'rgba(255,0,0,0.4)' : appearance.auraColor} 0%, transparent 60%)`,
              transform: "scale(1.4)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}
        <img 
          src={processedUniqueSprite}
          alt={enemyName}
          style={{
            width: effectiveSize,
            height: effectiveSize,
            objectFit: "contain",
            imageRendering: "pixelated",
            filter: glowFilter,
            transform,
            marginTop: -offsetY,
            transition: "margin-top 0.05s ease-out",
          }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: effectiveSize, height: effectiveSize }}>
      {appearance.hasGlow && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${appearance.auraColor} 0%, transparent 60%)`,
            transform: "scale(1.3)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}
      <Sprite
        type={appearance.baseType}
        size={effectiveSize}
        animation={effectiveAnimation}
        glow={appearance.hasGlow || isChasing}
        glowColor={isChasing ? "#ff0000" : appearance.glowColor}
        hueRotate={appearance.hueRotate}
        saturation={appearance.saturation}
        brightness={isChasing ? appearance.brightness + 20 : appearance.brightness}
        className={className}
        style={style}
      />
      {appearance.accessoryType !== "none" && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4"
          style={{
            width: effectiveSize * 0.4,
            height: effectiveSize * 0.3,
            opacity: 0.8,
          }}
        >
          {appearance.accessoryType === "horns" && (
            <div className="flex justify-between w-full">
              <div 
                className="w-2 h-4 rounded-t-full" 
                style={{ 
                  backgroundColor: appearance.glowColor,
                  transform: "rotate(-20deg)",
                }}
              />
              <div 
                className="w-2 h-4 rounded-t-full" 
                style={{ 
                  backgroundColor: appearance.glowColor,
                  transform: "rotate(20deg)",
                }}
              />
            </div>
          )}
          {appearance.accessoryType === "crystals" && (
            <div 
              className="w-3 h-5 mx-auto"
              style={{ 
                backgroundColor: appearance.glowColor,
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                filter: `drop-shadow(0 0 4px ${appearance.glowColor})`,
              }}
            />
          )}
        </div>
      )}
    </div>
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

export function generateEnemyVariant(enemyName: string, planetId: number, enemyIndex: number): EnemyAppearance {
  return generateEnemyAppearance(enemyName, "", planetId, enemyIndex);
}
