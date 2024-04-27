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
    delayMultiplier: 1,
    startIndex: 0,
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
    Math.min(options.startIndex, tokenArray.length),
  );
  const [output, setOutput] = useState<string>(
    tokenArray
      .slice(0, currentIndex.current)
      .map((t) => t.token)
      .join(""),
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(options.autoStart);

  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pause = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setOutput("");
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
      setIsPlaying(false);
      clearTimeoutRef.current = null;
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
    if (clearTimeoutRef.current) {
      return;
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
  };
};
