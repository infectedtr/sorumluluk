import React, { useEffect, useRef } from 'react';
import { animateCounter } from '../../utils/animeEffects';

export default function AnimatedCounter({
  value,
  duration = 1000,
  suffix = '',
  className = ''
}) {
  const spanRef = useRef(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (spanRef.current) {
      animateCounter(spanRef.current, value, duration, suffix);
      prevValueRef.current = value;
    }
  }, [value, duration, suffix]);

  return (
    <span
      ref={spanRef}
      className={`tabular-nums font-bold tracking-tight ${className}`}
      aria-live="polite"
    >
      {Number(value || 0).toLocaleString('tr-TR')}{suffix}
    </span>
  );
}
