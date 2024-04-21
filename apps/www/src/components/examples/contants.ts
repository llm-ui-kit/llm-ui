import type { ProbabilityOptions } from "llm-ui/examples";

export const defaultExampleProbs: ProbabilityOptions = {
  delayMsProbabilities: [{ delayMs: 30, prob: 1 }],
  tokenCharsProbabilities: [{ tokenChars: 1, prob: 1 }],
};
