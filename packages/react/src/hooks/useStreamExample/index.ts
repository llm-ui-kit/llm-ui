import { delay } from "../../lib/delay";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UseStreamTokenArrayOptions = {
  autoStart: boolean;
  autoStartDelayMs: number;
  loop: boolean;
  loopDelayMs: number;
  delayMultiplier: number;
};

const defaultUseStreamTokenArrayOptions: UseStreamTokenArrayOptions = {
  autoStartDelayMs: 0,
  autoStart: true,
  loop: false,
  loopDelayMs: 1000,
  delayMultiplier: 1,
};

export type UseStreamResponse = {
  output: string;
  reset: () => void;
  pause: () => void;
  start: () => void;
  isStarted: boolean;
  isFinished: boolean;
};

type TokenWithDelay = {
  token: string;
  delayMs: number;
};

export const useStreamTokenArray = (
  tokenArray: TokenWithDelay[],
  userOptions?: Partial<UseStreamTokenArrayOptions>,
): UseStreamResponse => {
  const options: UseStreamTokenArrayOptions = useMemo(
    () => ({ ...defaultUseStreamTokenArrayOptions, ...(userOptions ?? {}) }),
    [userOptions],
  );
  const [output, setOutput] = useState<string>("");

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
    const isFinished = index >= tokenArray.length;
    if (isFinished) {
      if (options.loop) {
        await delay(options.loopDelayMs);
        reset();
        nextToken();
      }
    } else {
      const { token, delayMs } = tokenArray[index];
      setOutput((prevOutput) => `${prevOutput}${token}`);
      currentIndex.current = index + 1;
      clearTimeoutRef.current = setTimeout(
        nextToken,
        delayMs * options.delayMultiplier,
      );
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
      setTimeout(start, options.autoStartDelayMs);
    }
    return () => reset();
  }, []);
  const finishedOutput = tokenArray.map((t) => t.token).join("");
  const isFinished = output.length === finishedOutput.length;
  return {
    output,
    reset,
    pause,
    start,
    isStarted: output.length > 0,
    isFinished,
  };
};

export type Probability = {
  prob: number;
};
type TokenProbability = { tokenChars: number } & Probability;
type DelayProbability = { delayMs: number } & Probability;

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
  {
    tokenCharsProbabilities,
    delayMsProbabilities,
  }: UseStreamWithProbabilitiesOptions,
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

export type UseStreamWithProbabilitiesOptions = UseStreamTokenArrayOptions & {
  tokenCharsProbabilities: TokenProbability[];
  delayMsProbabilities: DelayProbability[];
};

const defaultUseStreamExampleOptions: UseStreamWithProbabilitiesOptions = {
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
  ...defaultUseStreamTokenArrayOptions,
};

export const useStreamWithProbabilities = (
  output: string,
  userOptions?: Partial<UseStreamWithProbabilitiesOptions>,
): UseStreamResponse => {
  const options: UseStreamWithProbabilitiesOptions = useMemo(
    () => ({ ...defaultUseStreamExampleOptions, ...(userOptions ?? {}) }),
    [userOptions],
  );
  // console.log("options", options);
  const tokenArray = useMemo(
    () => stringToTokenArray(output, options),
    [output, options],
  );
  // console.log("tokenArray", tokenArray);

  return useStreamTokenArray(tokenArray, options);
};
