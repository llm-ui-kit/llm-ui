import type { ThrottleFunction } from "../core";

export type ThrottleBasicOptions = {
  readAheadChars: number;
  targetBufferChars: number;
  frameLookbackMs: number;
  adjustPercentage: number;
};

export const defaultOptions: ThrottleBasicOptions = {
  readAheadChars: 15,
  targetBufferChars: 9,
  adjustPercentage: 0.1,
  frameLookbackMs: 3000,
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
  return isStreamFinished
    ? 1
    : isBehind
      ? 1 + adjustPercentage
      : 1 - adjustPercentage;
};

export const throttleBasic = (
  userOptions: Partial<ThrottleBasicOptions> = {},
): ThrottleFunction => {
  const {
    frameLookbackMs,
    targetBufferChars,
    readAheadChars,
    adjustPercentage,
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
    const targetBufferSize = readAheadChars + targetBufferChars;
    if (
      !isStreamFinished &&
      (bufferSize < readAheadChars ||
        (visibleText.length === 0 && bufferSize < targetBufferSize))
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
