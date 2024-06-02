import type { ProbabilityOptions } from "@llm-ui/react";

export const defaultExampleProbs: ProbabilityOptions = {
  delayMsProbabilities: [{ delayMs: 90, prob: 1 }],
  tokenCharsProbabilities: [{ tokenChars: 3, prob: 1 }],
};

export const HIDDEN_CHAR = "‎";
