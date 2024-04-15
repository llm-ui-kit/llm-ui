import { throttleBasic } from "llm-ui/throttle";

export const throttleBuffer = throttleBasic({
  lagBufferMs: 1200,
  frameLookbackMs: 2000,
  behindIncrementFactor: 2.7,
  aheadIncrementFactor: 1 / 2.7,
});

export const getThrottle = (throttleType: "basic" | "buffer" | undefined) => {
  if (throttleType === "basic" || throttleType === undefined) {
    return throttleBasic();
  }
  return throttleBuffer;
};
