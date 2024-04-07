import { delay } from "../../lib/delay";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Probability = {
  prob: number;
};
type TokenProbability = { tokenChars: number } & Probability;
type DelayProbability = { delayMs: number } & Probability;

type TokenWithDelay = {
  token: string;
  delayMs: number;
};

export const cumulativeProbability = <T extends Probability>(
  probs: T[],
): T[] => {
  return probs.reduce((acc, curr) => {
    const previousProb = acc.length === 0 ? 0 : acc[acc.length - 1].prob;
    return [
      ...acc,
      {
        ...curr,
        prob: previousProb + curr.prob,
      },
    ];
  }, [] as T[]);
};

export const stringToTokenArray = (
  llmOutput: string,
  { tokenCharsProbabilities, delayMsProbabilities }: UseStreamExampleOptions,
): TokenWithDelay[] => {
  const tokenCharsProbabilitiesCum = cumulativeProbability(
    tokenCharsProbabilities,
  );
  const delayProbsCum = cumulativeProbability(delayMsProbabilities);
  let index = 0;
  const tokensWithDelay: TokenWithDelay[] = [];
  while (index < llmOutput.length) {
    const tokenSizeRand = Math.random();
    const delayRand = Math.random();
    const remainingChars = llmOutput.length - index;

    const tokenSize = Math.min(
      tokenCharsProbabilitiesCum.find((tp) => tp.prob > tokenSizeRand)
        ?.tokenChars ?? 1,
      remainingChars,
    );

    const token = llmOutput.slice(index, index + tokenSize);
    const delay =
      delayProbsCum.find((dp) => dp.prob > delayRand)?.delayMs ?? 10;

    tokensWithDelay.push({ token, delayMs: delay });
    index += tokenSize;
  }
  return tokensWithDelay;
};

export type UseStreamExampleOptions = {
  tokenCharsProbabilities: TokenProbability[];
  delayMsProbabilities: DelayProbability[];
  autoStart: boolean;
  loop: boolean;
  loopDelayMs: number;
};

const defaultUseStreamExampleOptions: UseStreamExampleOptions = {
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
  autoStart: true,
  loop: false,
  loopDelayMs: 1000,
};

export type UseStreamExampleResponse = {
  output: string;
  reset: () => void;
  pause: () => void;
  start: () => void;
};

export const useStreamExample = (
  completeOutput: string,
  userOptions?: Partial<UseStreamExampleOptions>,
): UseStreamExampleResponse => {
  const options: UseStreamExampleOptions = useMemo(
    () => ({ ...defaultUseStreamExampleOptions, ...(userOptions ?? {}) }),
    [userOptions],
  );
  const [output, setOutput] = useState<string>("");
  const tokens = useMemo(
    () => stringToTokenArray(completeOutput, options),
    [completeOutput, options],
  );
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef<number>(0);

  const pause = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    pause();
    currentIndex.current = 0;
  }, []);

  const nextToken = useCallback(async () => {
    const index = currentIndex.current;
    if (index < tokens.length) {
      const { token, delayMs } = tokens[index];
      setOutput((prevOutput) => `${prevOutput}${token}`);
      currentIndex.current = index + 1;
      clearTimeoutRef.current = setTimeout(nextToken, delayMs);
    } else {
      if (options.loop) {
        await delay(options.loopDelayMs);
        reset();
        nextToken();
      }
    }
  }, []);

  const start = useCallback(() => {
    if (clearTimeoutRef.current) {
      return;
    }
    nextToken();
  }, []);

  useEffect(() => {
    if (options.autoStart) {
      start();
    }
    return () => reset();
  }, []);

  return {
    output,
    reset,
    pause,
    start,
  };
};
