import type { ThrottleFunction } from "llm-ui/components";

const readAhead = 10;
const lagBufferMs = 200;

export const throttle: ThrottleFunction = ({
  isStreamFinished,
  visibleText,
  visibleTextAll,
  visibleTextLengthsAll,
  frameTime,
  frameTimePrevious,
  visibleTextIncrements,
}) => {
  const fps = 1000 / (frameTime - (frameTimePrevious ?? frameTime - 1000 / 30));

  const bufferSize = visibleTextAll.length - visibleText.length;

  // lookback 500 frames
  const lookbackFrames = Math.min(500, visibleTextLengthsAll.length);
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
    const targetBufferSize = isStreamFinished ? 0 : readAhead + lagBufferChars;
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
