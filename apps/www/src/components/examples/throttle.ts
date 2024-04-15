import { throttleBasic } from "llm-ui/throttle";

export const bufferThrottle = throttleBasic({
  lagBufferMs: 1200,
  frameLookbackMs: 2000,
  behindIncrementFactor: 2.7,
  aheadIncrementFactor: 1 / 2.7,
});
