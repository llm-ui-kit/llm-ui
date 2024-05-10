import confetti, { type Options } from "canvas-confetti";

var count = 200;

var defaults = {
  origin: { y: 0.7 },
};

const fire = (particleRatio: number, options: Partial<Options>) => {
  confetti({
    ...defaults,
    ...options,
    particleCount: Math.floor(count * particleRatio),
  });
};

export const fireConfetti = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
