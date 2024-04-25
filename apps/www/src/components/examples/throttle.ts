import { throttleBasic } from "llm-ui/throttle";

export const throttleBuffer = throttleBasic({
  adjustPercentage: 0.35,
  frameLookbackMs: 500,
  targetBufferChars: 10,
});

export const getThrottle = (throttleType: "basic" | "buffer" | undefined) => {
  if (throttleType === "basic" || throttleType === undefined) {
    return throttleBasic();
  }
  return throttleBuffer;
};
