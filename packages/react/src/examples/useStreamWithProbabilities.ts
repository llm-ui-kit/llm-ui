import { useMemo } from "react";
import { stringToTokenArray } from "./helper";
import { UseStreamResponse, UseStreamWithProbabilitiesOptions } from "./types";
import {
  useStreamTokenArray,
  useStreamTokenArrayOptionsDefaultOptions,
} from "./useStreamTokenArray";

export const useStreamWithProbabilitiesDefaultOptions: UseStreamWithProbabilitiesOptions =
  {
    delayMsProbabilities: [
      { delayMs: 10, prob: 0.4 },
      { delayMs: 200, prob: 0.3 },
      { delayMs: 500, prob: 0.2 },
      { delayMs: 1000, prob: 0.1 },
    ],
    tokenCharsProbabilities: [
      { tokenChars: 1, prob: 0.5 },
      { tokenChars: 2, prob: 0.3 },
      { tokenChars: 3, prob: 0.2 },
    ],
    ...useStreamTokenArrayOptionsDefaultOptions,
  };

export const useStreamWithProbabilities = (
  output: string,
  userOptions?: Partial<UseStreamWithProbabilitiesOptions>,
): UseStreamResponse => {
  const options: UseStreamWithProbabilitiesOptions = useMemo(
    () => ({
      ...useStreamWithProbabilitiesDefaultOptions,
      ...(userOptions ?? {}),
    }),
    [userOptions],
  );
  const tokenArray = useMemo(
    () => stringToTokenArray(output, options),
    [output, options],
  );
  return useStreamTokenArray(tokenArray, options);
};
