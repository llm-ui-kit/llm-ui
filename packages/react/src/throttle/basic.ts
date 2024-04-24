import type { ThrottleFunction } from "../core";

export type ThrottleBasicOptions = {
  readAheadChars: number;
  lagBufferChars: number;
  frameLookbackMs: number;
  percentage: number;
};

export const defaultOptions: ThrottleBasicOptions = {
  readAheadChars: 15,
  lagBufferChars: 15,
  percentage: 0.35,
  frameLookbackMs: 3000,
};
export const throttleBasic = (
  userOptions: Partial<ThrottleBasicOptions> = {},
): ThrottleFunction => {
  const { frameLookbackMs, lagBufferChars, readAheadChars, percentage } = {
    ...defaultOptions,
    ...userOptions,
  };
  return ({
    visibleText,
    isStreamFinished,
    visibleTextAll,
    visibleTextLengthsAll,
    frameCount,
    visibleTextIncrements,
    visibleTextLengthTarget,
    startStreamTime,
  }) => {
    const timeSinceStartMs = performance.now() - startStreamTime;
    const timeSinceStartSec = timeSinceStartMs / 1000;
    const fps = frameCount / timeSinceStartSec;

    const bufferSize = visibleTextAll.length - visibleTextLengthTarget;
    const lookbackFrameCount = Math.ceil(frameLookbackMs / (1000 / fps));
    const lookbackFrames = Math.min(
      lookbackFrameCount,
      visibleTextLengthsAll.length,
    );
    const recentVisibleTextLengths = visibleTextLengthsAll.slice(
      -1 * lookbackFrames,
    );
    const textAddedCount =
      recentVisibleTextLengths[recentVisibleTextLengths.length - 1] -
      recentVisibleTextLengths[0];

    const visibleTextEveryNFrames =
      textAddedCount > 0 ? lookbackFrames / textAddedCount : lookbackFrames;

    let framesSinceLastIncrement = [...visibleTextIncrements]
      .reverse()
      .findIndex((inc) => inc > 0);
    framesSinceLastIncrement =
      framesSinceLastIncrement === -1 ? frameCount : framesSinceLastIncrement;
    let visibleTextIncrement = 0;
    const targetBufferSize = readAheadChars + lagBufferChars;
    if (
      !isStreamFinished &&
      (bufferSize < readAheadChars ||
        (visibleText.length === 0 && bufferSize < targetBufferSize))
    ) {
      visibleTextIncrement = 0;
    } else {
      const targetBufferSize = readAheadChars + lagBufferChars;
      const isBehind = bufferSize > targetBufferSize;

      const adjustPercentage = isStreamFinished
        ? 1
        : isBehind
          ? 1 + percentage
          : 1 - percentage;
      const targetFrameEveryN = visibleTextEveryNFrames * adjustPercentage;

      visibleTextIncrement =
        framesSinceLastIncrement > targetFrameEveryN ? 1 : 0;
    }
    return {
      visibleTextIncrement,
    };
  };
};
