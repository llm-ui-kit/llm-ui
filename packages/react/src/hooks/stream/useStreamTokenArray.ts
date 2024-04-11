import { delay } from "../../lib/delay";

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
    delayMultiplier: 0,
  };

export const useStreamTokenArray = (
  tokenArray: TokenWithDelay[],
  userOptions?: Partial<UseStreamTokenArrayOptions>,
): UseStreamResponse => {
  const options: UseStreamTokenArrayOptions = useMemo(
    () => ({
      ...useStreamTokenArrayOptionsDefaultOptions,
      ...(userOptions ?? {}),
    }),
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
