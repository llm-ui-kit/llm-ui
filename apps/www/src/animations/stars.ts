import confetti from "canvas-confetti";

var defaults = {
  spread: 360,
  ticks: 50,
  gravity: 0,
  decay: 0.94,
  startVelocity: 30,
  colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
};

const stars = () => {
  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ["star"],
  });

  confetti({
    ...defaults,
    particleCount: 10,
    scalar: 0.75,
    shapes: ["circle"],
  });
};

export const multipleStars = () => {
  for (let i = 0; i < 3; i++) {
    setTimeout(stars, i * 100);
  }
};
