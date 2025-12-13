// ============================================
// ✨ FLOATING PARTICLES - PREMIUM FINTECH EFFECT
// Animated background particles & bubbles for the entire app
// ============================================
import React, { useMemo } from 'react';
import { useStore, getThemeColors } from '../../stores/useStore';

interface Particle {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface Bubble {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
}

interface GlowOrb {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
}

export const FloatingParticles: React.FC = () => {
  const { theme } = useStore();
  const themeColors = getThemeColors(theme);

  // Generate random particles (small dots)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2-6px
      x: Math.random() * 100, // 0-100%
      delay: Math.random() * 25, // 0-25s delay
      duration: Math.random() * 20 + 15, // 15-35s duration
      opacity: Math.random() * 0.6 + 0.3, // 0.3-0.9 opacity
    }));
  }, []);

  // Generate bubbles (larger, hollow circles)
  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 30 + 10, // 10-40px
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 25 + 20, // 20-45s
    }));
  }, []);

  // Generate glow orbs (large, blurred circles)
  const glowOrbs = useMemo<GlowOrb[]>(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.random() * 250 + 150, // 150-400px
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
    }));
  }, []);

  const getParticleColor = () => {
    switch (theme) {
      case 'pink': return 'rgba(236, 72, 153, ';
      case 'purple': return 'rgba(168, 85, 247, ';
      case 'turquoise': return 'rgba(20, 184, 166, ';
      default: return 'rgba(5, 191, 219, ';
    }
  };

  const particleColor = getParticleColor();

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* Floating Particles (small glowing dots) */}
      {particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            bottom: '-20px',
            background: `radial-gradient(circle, ${particleColor}${particle.opacity}) 0%, ${particleColor}0) 70%)`,
            boxShadow: `0 0 ${particle.size * 3}px ${particleColor}0.6)`,
            animation: `particleFloat ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Floating Bubbles (larger hollow circles) */}
      {bubbles.map((bubble) => (
        <div
          key={`bubble-${bubble.id}`}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            bottom: '-50px',
            background: 'transparent',
            border: `1px solid ${particleColor}0.3)`,
            boxShadow: `
              0 0 ${bubble.size / 2}px ${particleColor}0.2),
              inset 0 0 ${bubble.size / 3}px ${particleColor}0.1)
            `,
            animation: `bubbleFloat ${bubble.duration}s ease-in-out infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* Glow Orbs - Large ambient lights */}
      {glowOrbs.map((orb) => (
        <div
          key={`orb-${orb.id}`}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${particleColor}0.12) 0%, transparent 70%)`,
            filter: 'blur(50px)',
            animation: `orbPulse 10s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Corner accent glows */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle at top left, ${particleColor}0.2) 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle at bottom right, ${particleColor}0.15) 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `radial-gradient(circle, ${particleColor}0.08) 0%, transparent 50%)`,
          filter: 'blur(100px)',
        }}
      />

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes particleFloat {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          50% {
            transform: translateY(-50vh) rotate(180deg) scale(1.2);
          }
          95% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes bubbleFloat {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-50vh) translateX(20px) scale(1.1);
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100vh) translateX(-10px) scale(0.9);
            opacity: 0;
          }
        }
        
        @keyframes orbPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingParticles;
