import { useStreamExample, type UseStreamExampleOptions } from "llm-ui/hooks";

export const useStreamFastSmooth = (
  completeOutput: string,
  options: Partial<UseStreamExampleOptions>,
) => {
  return useStreamExample(completeOutput, {
    delayMsProbabilities: [{ delayMs: 1, prob: 1 }],
    tokenCharsProbabilities: [{ tokenChars: 1, prob: 1 }],
    ...options,
  });
};
