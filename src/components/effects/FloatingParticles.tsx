// ============================================
// ✨ FLOATING PARTICLES - FINANCIAL SYMBOLS EFFECT
// Animated financial symbols floating in background
// ============================================
import React, { useMemo } from 'react';
import { useStore, getThemeColors } from '../../stores/useStore';

// Financial symbols to display
const FINANCIAL_SYMBOLS = [
  '$', '€', '£', '¥', '₿', '₽', '₩', '฿',
  '💰', '💵', '💳', '📈', '📊', '💎', '🏦', '🪙',
  '📉', '💹', '🎯', '🐷', '✨', '⭐', '💲'
];

interface FloatingSymbol {
  id: number;
  symbol: string;
  size: number;
  x: number;
  delay: number;
  duration: number;
  opacity: number;
  rotation: number;
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

  // Generate floating financial symbols
  const floatingSymbols = useMemo<FloatingSymbol[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      symbol: FINANCIAL_SYMBOLS[Math.floor(Math.random() * FINANCIAL_SYMBOLS.length)],
      size: Math.random() * 16 + 12, // 12-28px
      x: Math.random() * 100, // 0-100%
      delay: Math.random() * 30, // 0-30s delay
      duration: Math.random() * 25 + 20, // 20-45s duration
      opacity: Math.random() * 0.4 + 0.2, // 0.2-0.6 opacity
      rotation: Math.random() * 360, // Random initial rotation
    }));
  }, []);

  // Generate circular outline bubbles (hollow rings)
  const circleBubbles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 30, // 30-90px
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 30 + 25, // 25-55s
    }));
  }, []);

  // Generate glow orbs (large, blurred ambient lights)
  const glowOrbs = useMemo<GlowOrb[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: Math.random() * 300 + 200, // 200-500px
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
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
      {/* Floating Financial Symbols */}
      {floatingSymbols.map((item) => (
        <div
          key={`symbol-${item.id}`}
          className="absolute flex items-center justify-center select-none"
          style={{
            fontSize: item.size,
            left: `${item.x}%`,
            bottom: '-50px',
            color: `${particleColor}${item.opacity})`,
            textShadow: `
              0 0 ${item.size}px ${particleColor}0.8),
              0 0 ${item.size * 2}px ${particleColor}0.4),
              0 0 ${item.size * 3}px ${particleColor}0.2)
            `,
            animation: `symbolFloat ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`,
            filter: 'blur(0.5px)',
          }}
        >
          {item.symbol}
        </div>
      ))}

      {/* Floating Circle Outlines (hollow rings) */}
      {circleBubbles.map((bubble) => (
        <div
          key={`circle-${bubble.id}`}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            bottom: '-100px',
            background: 'transparent',
            border: `1.5px solid ${particleColor}0.25)`,
            boxShadow: `
              0 0 ${bubble.size / 2}px ${particleColor}0.15),
              inset 0 0 ${bubble.size / 3}px ${particleColor}0.08)
            `,
            animation: `circleFloat ${bubble.duration}s ease-in-out infinite`,
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
            background: `radial-gradient(circle, ${particleColor}0.1) 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: `orbPulse 12s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Corner accent glows */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle at top left, ${particleColor}0.15) 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle at bottom right, ${particleColor}0.12) 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes symbolFloat {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          25% {
            transform: translateY(-25vh) rotate(15deg) scale(1);
          }
          50% {
            transform: translateY(-50vh) rotate(-10deg) scale(1.1);
          }
          75% {
            transform: translateY(-75vh) rotate(20deg) scale(1);
          }
          95% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-105vh) rotate(0deg) scale(0.9);
            opacity: 0;
          }
        }
        
        @keyframes circleFloat {
          0% {
            transform: translateY(0) translateX(0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          30% {
            transform: translateY(-30vh) translateX(30px) scale(1) rotate(60deg);
          }
          50% {
            transform: translateY(-50vh) translateX(-20px) scale(1.1) rotate(120deg);
          }
          70% {
            transform: translateY(-70vh) translateX(25px) scale(1) rotate(180deg);
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-105vh) translateX(0) scale(0.9) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes orbPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.25;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingParticles;
