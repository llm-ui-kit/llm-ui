import { useMemo, useRef } from "react";
import { stringToTokenArray } from "./helper";
import {
  TokenWithDelay,
  UseStreamResponse,
  UseStreamWithProbabilitiesOptions,
} from "./types";
import {
  useStreamTokenArray,
  useStreamTokenArrayOptionsDefaultOptions,
} from "./useStreamTokenArray";

export const useStreamWithProbabilitiesDefaultOptions: UseStreamWithProbabilitiesOptions =
  {
    delayMsProbabilities: [
      { delayMs: 10, prob: 0.4 },
      { delayMs: 70, prob: 0.3 },
      { delayMs: 250, prob: 0.2 },
      { delayMs: 600, prob: 0.1 },
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
  const tokenArrayRef = useRef<TokenWithDelay[]>(
    stringToTokenArray(output, options),
  );

  return useStreamTokenArray(tokenArrayRef.current, options);
};
