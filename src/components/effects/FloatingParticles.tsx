// ============================================
// ✨ FLOATING PARTICLES - PREMIUM FINTECH EFFECT
// Animated background particles for the entire app
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

  // Generate random particles
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2-6px
      x: Math.random() * 100, // 0-100%
      delay: Math.random() * 20, // 0-20s delay
      duration: Math.random() * 20 + 15, // 15-35s duration
      opacity: Math.random() * 0.5 + 0.2, // 0.2-0.7 opacity
    }));
  }, []);

  // Generate glow orbs (larger, blurred circles)
  const glowOrbs = useMemo<GlowOrb[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: Math.random() * 200 + 100, // 100-300px
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
  }, []);

  const getParticleColor = () => {
    switch (theme) {
      case 'pink': return 'rgba(236, 72, 153, ';
      case 'purple': return 'rgba(168, 85, 247, ';
      case 'light': return 'rgba(8, 145, 178, ';
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
      {/* Floating Particles */}
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
            boxShadow: `0 0 ${particle.size * 2}px ${particleColor}0.5)`,
            animation: `particleFloat ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
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
            background: `radial-gradient(circle, ${particleColor}0.15) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animation: `orbPulse 8s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Corner accent glows */}
      <div
        className="absolute top-0 left-0 w-96 h-96"
        style={{
          background: `radial-gradient(circle at top left, ${particleColor}0.2) 0%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96"
        style={{
          background: `radial-gradient(circle at bottom right, ${particleColor}0.15) 0%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Inline keyframes for particles */}
      <style>{`
        @keyframes particleFloat {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes orbPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingParticles;
