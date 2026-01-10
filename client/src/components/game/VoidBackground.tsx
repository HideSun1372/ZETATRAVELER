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
  const opacityRef = useRef(opacity);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  const particles = useMemo(() => {
    const particleCount = 75;
    const result: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1.5,
        opacity: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.03,
        speedY: (Math.random() - 0.5) * 0.02,
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

      ctx.fillStyle = "#050208";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const pulseIntensity = 0.5 + Math.sin(time * 0.5) * 0.25;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.7;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        maxRadius
      );
      gradient.addColorStop(0, `rgba(60, 40, 90, ${pulseIntensity})`);
      gradient.addColorStop(0.2, `rgba(40, 25, 70, ${pulseIntensity * 0.7})`);
      gradient.addColorStop(0.4, `rgba(25, 15, 50, ${pulseIntensity * 0.4})`);
      gradient.addColorStop(0.7, `rgba(10, 5, 25, ${pulseIntensity * 0.2})`);
      gradient.addColorStop(1, "rgba(5, 2, 8, 0)");

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
          particle.opacity * (0.6 + Math.sin(time * 2 + particle.x * 0.5) * 0.4);
        const layerOpacity = 1 - particle.parallaxLayer * 0.15;

        if (particle.size > 2.5) {
          const glowGradient = ctx.createRadialGradient(
            px,
            py,
            0,
            px,
            py,
            particle.size * 4
          );
          glowGradient.addColorStop(0, `rgba(220, 200, 255, ${flickerOpacity * 0.5 * layerOpacity})`);
          glowGradient.addColorStop(0.5, `rgba(180, 150, 230, ${flickerOpacity * 0.2 * layerOpacity})`);
          glowGradient.addColorStop(1, "rgba(150, 120, 200, 0)");
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(px, py, particle.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 230, 255, ${flickerOpacity * layerOpacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [particles]);

  const fogLayers = useMemo(() => {
    return [
      { delay: "0s", duration: "20s", opacity: 0.25 },
      { delay: "-7s", duration: "25s", opacity: 0.2 },
      { delay: "-14s", duration: "22s", opacity: 0.15 },
    ];
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity, transition: "opacity 1s ease-out" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {fogLayers.map((layer, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            inset: "-20%",
            background: `radial-gradient(ellipse 120% 80% at 50% 50%, 
              rgba(50, 30, 80, ${layer.opacity}) 0%, 
              rgba(30, 20, 60, ${layer.opacity * 0.6}) 30%, 
              transparent 60%)`,
            animation: `fogDrift${index} ${layer.duration} ease-in-out infinite`,
            animationDelay: layer.delay,
            filter: "blur(50px)",
          }}
        />
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, 
            rgba(100, 70, 150, 0.3) 0%, 
            rgba(70, 45, 110, 0.2) 15%, 
            rgba(40, 25, 70, 0.1) 30%, 
            transparent 50%)`,
          animation: "breathe 4s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, 
            transparent 20%, 
            rgba(0, 0, 0, 0.3) 50%, 
            rgba(0, 0, 0, 0.7) 75%, 
            rgba(0, 0, 0, 0.95) 100%)`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
        <defs>
          <filter id="turbulence">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="4"
              seed="5"
            >
              <animate
                attributeName="baseFrequency"
                dur="40s"
                values="0.008;0.012;0.008"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(30, 20, 50, 0.4)"
          filter="url(#turbulence)"
        />
      </svg>

      <style>{`
        @keyframes breathe {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes fogDrift0 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(8%, 5%) scale(1.1) rotate(2deg);
          }
          50% {
            transform: translate(-5%, 8%) scale(1.05) rotate(-1deg);
          }
          75% {
            transform: translate(-8%, -3%) scale(1.15) rotate(1deg);
          }
        }

        @keyframes fogDrift1 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1.05) rotate(0deg);
          }
          33% {
            transform: translate(-10%, 6%) scale(1) rotate(-2deg);
          }
          66% {
            transform: translate(6%, -5%) scale(1.12) rotate(1deg);
          }
        }

        @keyframes fogDrift2 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1.1) rotate(0deg);
          }
          50% {
            transform: translate(5%, -6%) scale(1) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
