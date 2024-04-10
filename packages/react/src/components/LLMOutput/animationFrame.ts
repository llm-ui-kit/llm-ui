import { useLayoutEffect, useRef } from "react";

export type CallbackFunction = (
  deltaInMs: DOMHighResTimeStamp,
  stop: () => void,
) => void;

// inspired by: https://github.com/franciscop/use-animation-frame/blob/master/src/index.js
export const useAnimationFrame = (callback: CallbackFunction) => {
  const cbRef = useRef<CallbackFunction>();
  const frame = useRef<number>();
  const lastTimeMs = useRef(performance.now());
  const shouldStop = useRef(false);
  cbRef.current = callback;

  const animate = (timeInMs: number) => {
    if (cbRef.current)
      cbRef.current(timeInMs - lastTimeMs.current, () => {
        if (frame.current) {
          shouldStop.current = true;
          cancelAnimationFrame(frame.current);
        }
      });
    lastTimeMs.current = timeInMs;
    if (!shouldStop.current) {
      frame.current = requestAnimationFrame(animate);
    }
  };

  useLayoutEffect(() => {
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);
};
