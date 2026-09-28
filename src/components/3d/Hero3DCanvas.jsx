import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../utils/animeEffects';

/**
 * Hero3DCanvas - Pure CSS + Canvas 2D animasyon (Three.js olmadan)
 * Performanslı, hafif, görsel olarak çarpıcı
 */
export default function Hero3DCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let animId;
    let t = 0;

    // Orbs/Particles
    const particles = [];
    const count = reduced ? 20 : 55;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 2.2 + 0.4,
        speed: Math.random() * 0.18 + 0.04,
        angle: Math.random() * Math.PI * 2,
        orbitR: Math.random() * 0.32 + 0.08,
        cx: Math.random(),
        cy: Math.random(),
        opacity: Math.random() * 0.7 + 0.2,
        hue: Math.random() > 0.5 ? 350 : (Math.random() > 0.5 ? 30 : 200)
      });
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * Math.min(window.devicePixelRatio, 2);
      canvas.height = canvas.offsetHeight * Math.min(window.devicePixelRatio, 2);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (document.hidden) return;

      const w = canvas.width;
      const h = canvas.height;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const wl = w / dpr;
      const hl = h / dpr;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);

      const speedMult = reduced ? 0.15 : 1;
      t += 0.012 * speedMult;

      // Central glowing sphere (CSS-like gradient)
      const cx = wl / 2;
      const cy = hl / 2;
      const rad = Math.min(wl, hl) * 0.26;

      // Outer glow pulse
      const pulseScale = 1 + Math.sin(t * 1.4) * 0.06;
      const outerR = rad * 1.8 * pulseScale;
      const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      outerGrad.addColorStop(0, 'rgba(244,63,94,0.18)');
      outerGrad.addColorStop(0.5, 'rgba(251,191,36,0.07)');
      outerGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // Core sphere
      const coreGrad = ctx.createRadialGradient(
        cx - rad * 0.3, cy - rad * 0.3, 0,
        cx, cy, rad
      );
      coreGrad.addColorStop(0, '#ff8fa3');
      coreGrad.addColorStop(0.45, '#f43f5e');
      coreGrad.addColorStop(0.8, '#881337');
      coreGrad.addColorStop(1, '#3f0020');
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Specular highlight
      const specGrad = ctx.createRadialGradient(
        cx - rad * 0.35, cy - rad * 0.4, 0,
        cx - rad * 0.35, cy - rad * 0.4, rad * 0.55
      );
      specGrad.addColorStop(0, 'rgba(255,255,255,0.38)');
      specGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Orbiting rings
      const rings = [
        { radiusMult: 1.45, tilt: 0.55, speed: 0.6, color: 'rgba(56,189,248,0.6)', lineW: 1.5 },
        { radiusMult: 1.7, tilt: -0.3, speed: -0.4, color: 'rgba(251,191,36,0.5)', lineW: 1.0 },
        { radiusMult: 1.9, tilt: 0.8, speed: 0.25, color: 'rgba(244,63,94,0.35)', lineW: 0.7 }
      ];

      rings.forEach(({ radiusMult, tilt, speed, color, lineW }) => {
        const rr = rad * radiusMult;
        const angle = t * speed;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle * 0.5);
        ctx.scale(1, Math.sin(tilt));
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        ctx.stroke();
        ctx.restore();
      });

      // Floating particles
      particles.forEach((p, i) => {
        const px = p.cx * wl + Math.cos(p.angle + t * p.speed) * p.orbitR * wl;
        const py = p.cy * hl + Math.sin(p.angle + t * p.speed) * p.orbitR * hl;
        const fade = (Math.sin(t * p.speed * 3 + i) + 1) * 0.5 * p.opacity;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${fade})`;
        ctx.fill();
      });

      // Ambient particle cloud near center
      const cloudCount = reduced ? 0 : 8;
      for (let i = 0; i < cloudCount; i++) {
        const angle = (i / cloudCount) * Math.PI * 2 + t * 0.3;
        const dist = rad * (1.15 + 0.1 * Math.sin(t + i));
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 0.5;
        const cr = 1.5 + Math.sin(t * 2 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, cr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${0.5 + Math.sin(t + i) * 0.2})`;
        ctx.fill();
      }

      ctx.restore();
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`relative w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    />
  );
}
