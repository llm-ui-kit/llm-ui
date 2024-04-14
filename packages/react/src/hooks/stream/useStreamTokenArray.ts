import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TokenWithDelay,
  UseStreamResponse,
  UseStreamTokenArrayOptions,
} from "./types";

export const useStreamTokenArrayOptionsDefaultOptions: UseStreamTokenArrayOptions =
  {
    autoStartDelayMs: 0,
    autoStart: true,
    loop: false,
    loopDelayMs: 1000,
    delayMultiplier: 1,
    loopStartIndex: 0,
  };

export const useStreamTokenArray = (
  tokenArray: TokenWithDelay[],
  userOptions?: Partial<UseStreamTokenArrayOptions>,
): UseStreamResponse => {
  const nextTokenRef = useRef<() => void>();
  const options: UseStreamTokenArrayOptions = useMemo(
    () => ({
      ...useStreamTokenArrayOptionsDefaultOptions,
      ...(userOptions ?? {}),
    }),
    [userOptions],
  );
  const currentIndex = useRef<number>(
    Math.min(options.loopStartIndex, tokenArray.length),
  );
  const [output, setOutput] = useState<string>(
    tokenArray
      .slice(0, currentIndex.current)
      .map((t) => t.token)
      .join(""),
  );
  const [loopIndex, setLoopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(options.autoStart);

  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pause = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setLoopIndex((prev) => prev + 1);
    pause();
    currentIndex.current = 0;
  }, []);

  const nextToken = useCallback(async () => {
    if (!nextTokenRef.current) {
      return;
    }
    const index = currentIndex.current;
    const isFinished = index >= tokenArray.length;
    if (isFinished) {
      if (options.loop) {
        clearTimeoutRef.current = setTimeout(() => {
          reset();
          start();
        }, options.loopDelayMs);
      } else {
        setIsPlaying(false);
        clearTimeoutRef.current = null;
      }
    } else {
      const { token, delayMs } = tokenArray[index];
      setOutput((prevOutput) => `${prevOutput}${token}`);
      currentIndex.current = index + 1;
      clearTimeoutRef.current = setTimeout(
        nextTokenRef.current,
        delayMs * options.delayMultiplier,
      );
    }
  }, [options, setOutput, reset, tokenArray]);

  useEffect(() => {
    nextTokenRef.current = nextToken;
  });

  const start = useCallback(() => {
    const isFinished = currentIndex.current >= tokenArray.length;
    if (clearTimeoutRef.current) {
      return;
    }
    if (isFinished) {
      reset();
    }
    setIsPlaying(true);
    nextToken();
  }, [tokenArray, currentIndex]);

  useEffect(() => {
    if (options.autoStart) {
      setTimeout(start, options.autoStartDelayMs);
    }
  }, []);

  const finishedOutput = tokenArray.map((t) => t.token).join("");
  const isFinished = output.length === finishedOutput.length;
  return {
    output,
    reset,
    pause,
    start,
    isPlaying,
    isStreamStarted: output.length > 0,
    isStreamFinished: isFinished,
    loopIndex,
  };
};
