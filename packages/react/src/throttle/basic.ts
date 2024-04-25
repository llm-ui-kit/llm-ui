import type { ThrottleFunction } from "../core";

export type ThrottleBasicOptions = {
  readAheadChars: number;
  targetBufferChars: number;
  frameLookbackMs: number;
  adjustPercentage: number;
  windowCount: number;
};

export const defaultOptions: ThrottleBasicOptions = {
  readAheadChars: 15,
  targetBufferChars: 15,
  adjustPercentage: 0.2,
  frameLookbackMs: 10000,
  windowCount: 5,
};

const calcPercentage = ({
  isBehind,
  adjustPercentage,
  isStreamFinished,
}: {
  isBehind: boolean;
  adjustPercentage: number;
  isStreamFinished: boolean;
}) => {
  if (isStreamFinished) {
    return 1;
  }
  if (isBehind) {
    return 1 - adjustPercentage;
  }
  return 1 + adjustPercentage;
};

const getVisibleTextEveryNFrames = (
  lookbackFrameCount: number,
  windowCount: number,
  visibleTextLengthsAll: number[],
) => {
  const lookbackFrames = Math.min(
    lookbackFrameCount,
    visibleTextLengthsAll.length,
  );
  const recentVisibleTextLengths = visibleTextLengthsAll.slice(
    -1 * lookbackFrames,
  );
  const windowSize = Math.floor(lookbackFrames / windowCount);

  const textAddedCounts = [];

  for (let i = 0; i < recentVisibleTextLengths.length - windowSize; i++) {
    const start = i;
    const end = i + windowSize;
    const textAddedCount =
      recentVisibleTextLengths[end] - recentVisibleTextLengths[start];
    textAddedCounts.push(textAddedCount);
  }

  const avgTextAddedCount =
    textAddedCounts.reduce((a, b) => a + b, 0) / textAddedCounts.length;

  return avgTextAddedCount > 0 ? windowSize / avgTextAddedCount : windowSize;
};

export const throttleBasic = (
  userOptions: Partial<ThrottleBasicOptions> = {},
): ThrottleFunction => {
  const {
    frameLookbackMs,
    targetBufferChars,
    readAheadChars,
    adjustPercentage,
    windowCount,
  } = {
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

    const visibleTextEveryNFrames = getVisibleTextEveryNFrames(
      lookbackFrameCount,
      windowCount,
      visibleTextLengthsAll,
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

    const oldVisibleTextEveryNFrames =
      textAddedCount > 0 ? lookbackFrames / textAddedCount : lookbackFrames;

    let framesSinceLastIncrement = [...visibleTextIncrements]
      .reverse()
      .findIndex((inc) => inc > 0);
    framesSinceLastIncrement =
      framesSinceLastIncrement === -1 ? frameCount : framesSinceLastIncrement;
    let visibleTextIncrement = 0;
    const targetBufferSize = readAheadChars + targetBufferChars;
    if (
      (!isStreamFinished &&
        (bufferSize < readAheadChars ||
          (visibleText.length === 0 && bufferSize < targetBufferSize))) ||
      visibleTextLengthTarget >= visibleTextAll.length
    ) {
      visibleTextIncrement = 0;
    } else {
      const targetBufferSize = readAheadChars + targetBufferChars;
      const isBehind = bufferSize > targetBufferSize;

      const targetFrameEveryN =
        visibleTextEveryNFrames *
        calcPercentage({ adjustPercentage, isBehind, isStreamFinished });

      visibleTextIncrement =
        framesSinceLastIncrement > targetFrameEveryN ? 1 : 0;
    }
    return {
      visibleTextIncrement,
    };
  };
};
