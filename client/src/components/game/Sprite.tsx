import { CSSProperties } from "react";

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

interface SpriteProps {
  type: SpriteType;
  size?: number;
  className?: string;
  style?: CSSProperties;
  animate?: boolean;
  glow?: boolean;
  glowColor?: string;
}

export function Sprite({ 
  type, 
  size = 32, 
  className = "", 
  style = {},
  animate = false,
  glow = false,
  glowColor = "#ffffff"
}: SpriteProps) {
  const spriteStyle: CSSProperties = {
    width: size,
    height: size,
    backgroundImage: `url(${SPRITE_PATHS[type]})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    imageRendering: "pixelated",
    ...style,
  };

  if (animate) {
    spriteStyle.animation = "sprite-bob 0.5s ease-in-out infinite alternate";
  }

  if (glow) {
    spriteStyle.filter = `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 8px ${glowColor})`;
  }

  return (
    <div 
      className={className}
      style={spriteStyle}
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
