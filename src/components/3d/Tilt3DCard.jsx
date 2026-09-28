import React, { useRef, useState } from 'react';
import { prefersReducedMotion } from '../../utils/animeEffects';

/**
 * Tilt3DCard wraps content with smooth, hardware-accelerated 3D perspective tilt
 * and interactive spotlight/glare effects.
 */
export default function Tilt3DCard({
  children,
  className = '',
  maxRotation = 7, // Degrees of tilt
  scale = 1,
  glare = true,
  onClick,
  ...props
}) {

  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
  });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (e) => {
    if (prefersReducedMotion()) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const percentX = x / rect.width;
    const percentY = y / rect.height;

    // Calculate rotation: inverted Y for natural tilt
    const rotX = ((percentY - 0.5) * -2 * maxRotation).toFixed(2);
    const rotY = ((percentX - 0.5) * 2 * maxRotation).toFixed(2);

    setStyle({
      transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.1s ease-out'
    });

    if (glare) {
      setGlarePosition({
        x: (percentX * 100).toFixed(1),
        y: (percentY * 100).toFixed(1),
        opacity: 0.15
      });
    }
  };

  const handlePointerLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
    });
    if (glare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* 3D Dynamic Glare / Light Reflection */}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 240px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 80%)`,
            opacity: glarePosition.opacity
          }}
          aria-hidden="true"
        />
      )}

      {/* Content wrapper with slight 3D elevation */}
      <div className="relative z-10 w-full h-full transform-style-preserve-3d">
        {children}
      </div>
    </div>
  );
}
