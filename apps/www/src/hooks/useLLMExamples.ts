import {
  useStreamWithProbabilities,
  type UseStreamWithProbabilitiesOptions,
} from "llm-ui/hooks";

export const useStreamFastSmooth = (
  output: string,
  options: Partial<UseStreamWithProbabilitiesOptions>,
) => {
  return useStreamWithProbabilities(output, {
    delayMsProbabilities: [{ delayMs: 14, prob: 1 }],
    tokenCharsProbabilities: [{ tokenChars: 1, prob: 1 }],
    ...options,
  });
};
