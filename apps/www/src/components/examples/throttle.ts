import { throttleBasic } from "@llm-ui/react";

export type ThrottleType = "buffered" | "low-lag";

export const throttleLowLag = throttleBasic({
  adjustPercentage: 0.35,
  readAheadChars: 10,
  targetBufferChars: 9,
});

export const getThrottle = (throttleType: ThrottleType | undefined) => {
  if (throttleType === "low-lag" || throttleType === undefined) {
    return throttleLowLag;
  }
  return throttleBasic();
};
