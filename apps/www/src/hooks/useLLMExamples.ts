import { useStreamExample, type UseStreamExampleOptions } from "llm-ui/hooks";

export const useStreamFastSmooth = (
  fullOutput: string,
  options: Partial<UseStreamExampleOptions>,
) => {
  return useStreamExample(fullOutput, {
    delayMsProbabilities: [{ delayMs: 12, prob: 1 }],
    tokenCharsProbabilities: [{ tokenChars: 1, prob: 1 }],
    ...options,
  });
};
