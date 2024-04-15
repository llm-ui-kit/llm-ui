import type { ThrottleFunction } from "llm-ui/components";

const readAhead = 10;
const lagBufferMs = 200;

export type ThrottleBasicOptions = {
  readAheadChars: number;
  lagBufferMs: number;
  frameLookbackMs: number;
  behindIncrementFactor: number;
  aheadIncrementFactor: number;
};

export const defaultOptions: ThrottleBasicOptions = {
  readAheadChars: 10,
  lagBufferMs: 200,
  behindIncrementFactor: 3,
  aheadIncrementFactor: 1 / 3,
  frameLookbackMs: 200,
};

export const throttleBasic = (
  userOptions: Partial<ThrottleBasicOptions> = {},
): ThrottleFunction => {
  const options = { ...defaultOptions, ...userOptions };
  return ({
    isStreamFinished,
    visibleText,
    visibleTextAll,
    visibleTextLengthsAll,
    frameTime,
    frameTimePrevious,
    visibleTextIncrements,
  }) => {
    const fps =
      1000 / (frameTime - (frameTimePrevious ?? frameTime - 1000 / 30));

    const bufferSize = visibleTextAll.length - visibleText.length;
    const lookbackFrameCount = Math.ceil(
      options.frameLookbackMs / (1000 / fps),
    );
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

    const visibleTextPerRender = textAddedCount / lookbackFrames;
    const visibleTextPerMs = visibleTextPerRender / (1000 / fps);
    const lagBufferChars = lagBufferMs * visibleTextPerMs;

    let visibleTextIncrement = 0;
    const recentIncrements = visibleTextIncrements.slice(-20);

    const recentAverageIncrement =
      recentIncrements.reduce((a, b) => a + b, 0) / recentIncrements.length;
    if (isStreamFinished) {
      visibleTextIncrement = Math.max(1, Math.ceil(visibleTextPerRender));
    } else if (!isStreamFinished && bufferSize < readAhead) {
      visibleTextIncrement = 0;
    } else {
      const targetBufferSize = isStreamFinished
        ? 0
        : readAhead + lagBufferChars;
      const isBehindTarget = bufferSize > targetBufferSize;
      const targetIncrement = isBehindTarget
        ? visibleTextPerRender * 3
        : (visibleTextPerRender * 1) / 3;

      visibleTextIncrement =
        recentAverageIncrement > targetIncrement
          ? Math.floor(targetIncrement)
          : Math.ceil(targetIncrement);
    }
    return {
      visibleTextIncrement,
    };
  };
};
