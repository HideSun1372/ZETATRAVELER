import { useEffect, useRef, useMemo } from "react";

interface VoidBackgroundProps {
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  parallaxLayer: number;
}

export function VoidBackground({ opacity }: VoidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const particles = useMemo(() => {
    const particleCount = 75;
    const result: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.1,
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.015,
        parallaxLayer: Math.floor(Math.random() * 3),
      });
    }
    return result;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const pulseIntensity = 0.3 + Math.sin(time * 0.5) * 0.15;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.6;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        maxRadius
      );
      gradient.addColorStop(0, `rgba(40, 30, 60, ${pulseIntensity * opacity})`);
      gradient.addColorStop(0.3, `rgba(20, 15, 35, ${pulseIntensity * 0.6 * opacity})`);
      gradient.addColorStop(0.6, `rgba(10, 8, 20, ${pulseIntensity * 0.3 * opacity})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        const layerSpeed = 1 + particle.parallaxLayer * 0.5;
        particle.x += particle.speedX * layerSpeed;
        particle.y += particle.speedY * layerSpeed;

        if (particle.x < -5) particle.x = 105;
        if (particle.x > 105) particle.x = -5;
        if (particle.y < -5) particle.y = 105;
        if (particle.y > 105) particle.y = -5;

        const px = (particle.x / 100) * canvas.width;
        const py = (particle.y / 100) * canvas.height;

        const flickerOpacity =
          particle.opacity * (0.7 + Math.sin(time * 2 + particle.x) * 0.3);
        const layerOpacity = 1 - particle.parallaxLayer * 0.2;

        ctx.beginPath();
        ctx.arc(px, py, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 255, ${flickerOpacity * layerOpacity * opacity})`;
        ctx.fill();

        if (particle.size > 2) {
          const glowGradient = ctx.createRadialGradient(
            px,
            py,
            0,
            px,
            py,
            particle.size * 3
          );
          glowGradient.addColorStop(
            0,
            `rgba(180, 160, 220, ${flickerOpacity * 0.3 * layerOpacity * opacity})`
          );
          glowGradient.addColorStop(1, "rgba(180, 160, 220, 0)");
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(px, py, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [particles, opacity]);

  const fogLayers = useMemo(() => {
    return [
      { delay: "0s", duration: "20s", opacity: 0.15 },
      { delay: "-7s", duration: "25s", opacity: 0.12 },
      { delay: "-14s", duration: "22s", opacity: 0.1 },
    ];
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity, transition: "opacity 0.8s ease-out" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {fogLayers.map((layer, index) => (
        <div
          key={index}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 150% 100% at 50% 50%, 
              rgba(30, 20, 50, ${layer.opacity}) 0%, 
              rgba(15, 10, 30, ${layer.opacity * 0.5}) 40%, 
              transparent 70%)`,
            animation: `fogDrift${index} ${layer.duration} ease-in-out infinite`,
            animationDelay: layer.delay,
            filter: "blur(40px)",
          }}
        />
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, 
            rgba(80, 60, 120, 0.2) 0%, 
            rgba(50, 35, 80, 0.15) 15%, 
            rgba(30, 20, 50, 0.1) 30%, 
            transparent 50%)`,
          animation: "breathe 4s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, 
            transparent 30%, 
            rgba(0, 0, 0, 0.4) 60%, 
            rgba(0, 0, 0, 0.8) 80%, 
            rgba(0, 0, 0, 1) 100%)`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <filter id="turbulence">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="3"
              seed="5"
            >
              <animate
                attributeName="baseFrequency"
                dur="30s"
                values="0.01;0.015;0.01"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="30" />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(20, 15, 35, 0.3)"
          filter="url(#turbulence)"
        />
      </svg>

      <style>{`
        @keyframes breathe {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes fogDrift0 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          25% {
            transform: translate(5%, 3%) scale(1.05);
          }
          50% {
            transform: translate(-3%, 5%) scale(1.02);
          }
          75% {
            transform: translate(-5%, -2%) scale(1.08);
          }
        }

        @keyframes fogDrift1 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1.02);
          }
          33% {
            transform: translate(-6%, 4%) scale(1);
          }
          66% {
            transform: translate(4%, -3%) scale(1.06);
          }
        }

        @keyframes fogDrift2 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1.05);
          }
          50% {
            transform: translate(3%, -4%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
