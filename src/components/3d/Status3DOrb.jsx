import React from 'react';
import { prefersReducedMotion } from '../../utils/animeEffects';

/**
 * Status3DOrb - Pure CSS animated orb (Three.js olmadan)
 * Sorunlu → Amber/Turuncu, Sorunsuz → Emerald
 */
export default function Status3DOrb({ hasIssues = false, count = 0 }) {
  const reduced = prefersReducedMotion();

  return (
    <div
      className="w-7 h-7 shrink-0 flex items-center justify-center cursor-pointer relative"
      title={hasIssues ? `${count} Çakışma / Uyarı` : 'Sistem Durumu: Çakışmasız'}
      aria-hidden="true"
      style={{ perspective: '80px' }}
    >
      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full ${
          hasIssues
            ? 'bg-amber-400/20 shadow-amber-400/40'
            : 'bg-emerald-400/20 shadow-emerald-400/40'
        } shadow-lg`}
        style={{
          animation: reduced ? 'none' : 'orbPulse 2s ease-in-out infinite',
        }}
      />

      {/* Core orb sphere */}
      <div
        className={`w-5 h-5 rounded-full relative overflow-hidden ${
          hasIssues
            ? 'shadow-amber-500/50'
            : 'shadow-emerald-500/50'
        } shadow-md`}
        style={{
          background: hasIssues
            ? 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 55%, #92400e)'
            : 'radial-gradient(circle at 35% 35%, #6ee7b7, #10b981 55%, #064e3b)',
          animation: reduced ? 'none' : 'orbSpin 3s linear infinite',
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute top-0.5 left-0.5 w-2 h-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.55)',
            filter: 'blur(1px)'
          }}
        />
        {/* Equator stripe */}
        <div
          className="absolute inset-x-0 h-[1px]"
          style={{
            top: '50%',
            background: 'rgba(0,0,0,0.2)',
            animation: reduced ? 'none' : 'orbSpin 3s linear infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.35); opacity: 0.3; }
        }
        @keyframes orbSpin {
          from { filter: brightness(1); }
          50% { filter: brightness(1.15); }
          to { filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
