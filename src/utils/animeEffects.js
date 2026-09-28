import { animate, createTimeline, stagger } from 'animejs';

/**
 * Checks if the user prefers reduced motion
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animates a numeric counter smoothly from start to target value using spring physics.
 * @param {HTMLElement} element - The DOM element displaying the number
 * @param {number} targetValue - The final integer value
 * @param {number} duration - Duration in milliseconds
 * @param {string} suffix - Optional suffix e.g. " Görev", "%"
 */
export function animateCounter(element, targetValue, duration = 1200, suffix = '') {
  if (!element) return;
  if (prefersReducedMotion()) {
    element.textContent = targetValue.toLocaleString('tr-TR') + suffix;
    return;
  }

  const obj = { val: 0 };
  const parsedTarget = Math.round(Number(targetValue) || 0);

  animate(obj, {
    val: parsedTarget,
    duration: duration,
    ease: 'out(3)',
    onUpdate: () => {
      element.textContent = Math.round(obj.val).toLocaleString('tr-TR') + suffix;
    }
  });
}

/**
 * Staggers in elements with a refined spatial spring motion.
 * @param {string|HTMLElement|NodeList} targets
 * @param {Object} options
 */
export function staggerEntrance(targets, options = {}) {
  if (!targets || prefersReducedMotion()) return;

  const {
    delay = 50,
    staggerDelay = 45,
    translateY = [16, 0],
    scale = [0.98, 1],
    opacity = [0, 1],
    duration = 600
  } = options;

  animate(targets, {
    translateY,
    scale,
    opacity,
    delay: stagger(staggerDelay, { start: delay }),
    duration,
    ease: 'out(3)'
  });
}

/**
 * Animates a page/tab transition with modern fluid crossfade.
 * @param {HTMLElement} container
 */
export function animateViewTransition(container) {
  if (!container || prefersReducedMotion()) return;

  animate(container, {
    opacity: [0, 1],
    duration: 200,
    ease: 'out(2)'
  });
}


/**
 * Bouncy spring animation for modals.
 * @param {HTMLElement} modalContent
 * @param {HTMLElement} backdrop
 */
export function animateModalOpen(modalContent, backdrop) {
  if (prefersReducedMotion()) return;

  if (backdrop) {
    animate(backdrop, {
      opacity: [0, 1],
      duration: 250,
      ease: 'out(2)'
    });
  }

  if (modalContent) {
    animate(modalContent, {
      opacity: [0, 1],
      scale: [0.92, 1],
      translateY: [20, 0],
      duration: 400,
      ease: 'out(3)'
    });
  }
}

/**
 * Spring entrance for floating notification toasts.
 * @param {HTMLElement} toastElement
 */
export function animateToastEntrance(toastElement) {
  if (!toastElement || prefersReducedMotion()) return;

  animate(toastElement, {
    opacity: [0, 1],
    translateY: [30, 0],
    scale: [0.9, 1],
    duration: 450,
    ease: 'out(3)'
  });
}

/**
 * Subtle pulse animation for status badges or alert indicators.
 * @param {HTMLElement} element
 */
export function pulseAttention(element) {
  if (!element || prefersReducedMotion()) return;

  animate(element, {
    scale: [1, 1.08, 1],
    duration: 800,
    ease: 'inOut(2)'
  });
}
