import type { ProbabilityOptions } from "@llm-ui/react/examples";

export const defaultExampleProbs: ProbabilityOptions = {
  delayMsProbabilities: [{ delayMs: 90, prob: 1 }],
  tokenCharsProbabilities: [{ tokenChars: 3, prob: 1 }],
};
