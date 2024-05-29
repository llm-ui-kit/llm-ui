import { fireConfetti } from "./confetti";
import { multipleStars } from "./stars";

export const starsAndConfetti = (text: string = "") => {
  if (text.toLowerCase().includes("star")) {
    multipleStars();
  } else if (text.toLowerCase().includes("confetti")) {
    fireConfetti();
  }
};
