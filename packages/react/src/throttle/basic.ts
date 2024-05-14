import type { ThrottleFunction } from "../core";

export type ThrottleBasicOptions = {
  readAheadChars: number;
  targetBufferChars: number;
  adjustPercentage: number;
  frameLookBackMs: number;
  windowLookBackMs: number;
};

export const defaultOptions: ThrottleBasicOptions = {
  readAheadChars: 15,
  targetBufferChars: 15,
  adjustPercentage: 0.2,
  frameLookBackMs: 10000,
  windowLookBackMs: 2000,
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
  windowLookBackCount: number,
  visibleTextLengthsAllOriginal: number[],
) => {
  const visibleTextLengthsAll = [0, ...visibleTextLengthsAllOriginal];
  const lookbackFrames = Math.min(
    lookbackFrameCount,
    visibleTextLengthsAll.length,
  );
  const windowFrames = Math.min(
    windowLookBackCount,
    visibleTextLengthsAll.length,
  );
  const recentVisibleTextLengths = visibleTextLengthsAll.slice(
    -1 * lookbackFrames,
  );

  const textAddedCounts = [];

  if (windowFrames > 0) {
    for (
      let start = 0;
      start < recentVisibleTextLengths.length - windowFrames + 1;
      start++
    ) {
      const end = start + windowFrames - 1;
      const textAddedCount =
        recentVisibleTextLengths[end] - recentVisibleTextLengths[start];
      textAddedCounts.push(textAddedCount);
    }
  }

  const avgTextAddedCount =
    textAddedCounts.reduce((a, b) => a + b, 0) / textAddedCounts.length ?? 0;
  const result =
    avgTextAddedCount > 0 ? windowFrames / avgTextAddedCount : windowFrames;

  return result;
};

export const throttleBasic = (
  userOptions: Partial<ThrottleBasicOptions> = {},
): ThrottleFunction => {
  const {
    frameLookBackMs,
    targetBufferChars,
    readAheadChars,
    adjustPercentage,
    windowLookBackMs,
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
    const lookbackFrameCount = Math.ceil(frameLookBackMs / (1000 / fps));
    const windowLookBackCount = Math.ceil(windowLookBackMs / (1000 / fps));

    const visibleTextEveryNFrames = getVisibleTextEveryNFrames(
      lookbackFrameCount,
      windowLookBackCount,
      visibleTextLengthsAll,
    );

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
      if (targetFrameEveryN > 1) {
        visibleTextIncrement =
          framesSinceLastIncrement >= targetFrameEveryN ? 1 : 0;
      } else {
        visibleTextIncrement = Math.round(1 / targetFrameEveryN);
      }
    }
    return {
      visibleTextIncrement,
    };
  };
};
