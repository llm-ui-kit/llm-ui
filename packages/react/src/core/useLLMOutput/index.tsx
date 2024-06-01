import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { throttleBasic } from "../../throttle";
import { matchBlocks } from "./helper";
import {
  BlockMatch,
  LLMOutputBlock,
  LLMOutputFallbackBlock,
  ThrottleFunction,
} from "./types";

export type LLMOutputProps = {
  llmOutput: string;
  blocks?: LLMOutputBlock[];
  fallbackBlock: LLMOutputFallbackBlock;
  isStreamFinished: boolean;
  throttle?: ThrottleFunction;
  onFinish?: () => void;
};

const matchesToVisibleText = (matches: BlockMatch[]): string => {
  return matches.map((match) => match.visibleText).join("");
};

const matchesToOutput = (matches: BlockMatch[]): string => {
  return matches.map((match) => match.output).join("");
};

export type UseLLMOutputReturn = {
  blockMatches: BlockMatch[];
  isFinished: boolean;
  finishCount: number;
  visibleText: string;
  restart: () => void;
};

const initialState = {
  blockMatches: [],
  isFinished: false,
  visibleText: "",
};

export const useLLMOutput = ({
  llmOutput,
  isStreamFinished,
  blocks = [],
  fallbackBlock,
  throttle = throttleBasic(),
  onFinish = () => null,
}: LLMOutputProps): UseLLMOutputReturn => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const renderLoopRef = useRef<(frameTime: DOMHighResTimeStamp) => void>();
  const frameRef = useRef<number>();
  const frameCountRef = useRef<number>(0);
  const finishTimeRef = useRef<DOMHighResTimeStamp>();
  const previousFrameTimeRef = useRef<DOMHighResTimeStamp>();
  const visibleTextAllLengthsRef = useRef<number[]>([]);
  const outputLengthsRef = useRef<number[]>([]);
  const visibleTextIncrementsRef = useRef<number[]>([]);
  const visibleTextLengthTargetRef = useRef<number>(0);

  const memoMatchBlocks = useMemo(() => {
    return matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock,
      isStreamFinished,
    });
  }, [llmOutput, isStreamFinished]);

  const [{ blockMatches, ...state }, setState] = useState<
    Omit<UseLLMOutputReturn, "restart">
  >({
    ...initialState,
    finishCount: 0,
    blockMatches: memoMatchBlocks,
  });

  const reset = useCallback(() => {
    setState((state) => ({ ...state, ...initialState }));
    startTime.current = performance.now();
    finishTimeRef.current = undefined;
    previousFrameTimeRef.current = undefined;
    visibleTextAllLengthsRef.current = [];
    outputLengthsRef.current = [];
    visibleTextIncrementsRef.current = [];
    visibleTextLengthTargetRef.current = 0;
    frameCountRef.current = 0;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
  }, [setState]);

  const restart = useCallback(() => {
    reset();
    setTimeout(() => {
      if (renderLoopRef.current) {
        frameRef.current = requestAnimationFrame(renderLoopRef.current);
      }
    }, 10);
  }, [reset]);

  const renderLoop = (frameTime: DOMHighResTimeStamp) => {
    if (!renderLoopRef.current) {
      return;
    }

    const allMatches = matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock,
      isStreamFinished,
    });
    const visibleText = matchesToVisibleText(blockMatches);
    const outputRendered = matchesToOutput(blockMatches);

    const visibleTextAll = matchesToVisibleText(allMatches);
    const outputAll = matchesToOutput(allMatches);
    if (!isStreamFinished) {
      visibleTextAllLengthsRef.current.push(visibleTextAll.length);
      outputLengthsRef.current.push(outputAll.length);
    }
    const isFinished = visibleText === visibleTextAll && isStreamFinished;
    if (isFinished) {
      frameRef.current = undefined;
      setState((state) => ({
        ...state,
        blockMatches,
        isFinished,
        finishCount: state.finishCount + 1,
        visibleText,
      }));
      onFinish();
      return;
    }

    // make sure throttle has the last text lengths when the stream finishes
    const visibleTextLengthsAll = isStreamFinished
      ? [...visibleTextAllLengthsRef.current, visibleTextAll.length]
      : visibleTextAllLengthsRef.current;

    const outputLengths = isStreamFinished
      ? [...outputLengthsRef.current, outputAll.length]
      : outputLengthsRef.current;

    const { visibleTextIncrement } = throttle({
      outputRaw: llmOutput,
      outputRendered,
      outputAll,
      visibleText,
      visibleTextAll,
      startStreamTime: startTime.current,
      isStreamFinished,
      frameCount: frameCountRef.current,
      frameTime,
      frameTimePrevious: previousFrameTimeRef.current,
      finishStreamTime: finishTimeRef.current,
      visibleTextLengthsAll,
      outputLengths,
      visibleTextIncrements: visibleTextIncrementsRef.current,
      visibleTextLengthTarget: visibleTextLengthTargetRef.current,
    });
    if (visibleTextIncrement < 0) {
      throw new Error("throttle returned negative visibleTextIncrement");
    }

    visibleTextIncrementsRef.current.push(visibleTextIncrement);
    visibleTextLengthTargetRef.current =
      visibleTextLengthTargetRef.current + visibleTextIncrement;

    if (visibleTextLengthTargetRef.current > visibleText.length) {
      const matches = matchBlocks({
        llmOutput,
        blocks,
        fallbackBlock,
        isStreamFinished,
        visibleTextLengthTarget: visibleTextLengthTargetRef.current,
      });
      const updatedVisibleText = matchesToVisibleText(matches);

      lastRenderTime.current = performance.now();

      setState((state) => ({
        ...state,
        blockMatches: matches,
        isFinished,
        visibleText: updatedVisibleText,
      }));
    }
    frameRef.current = requestAnimationFrame(renderLoopRef.current);
    previousFrameTimeRef.current = frameTime;
    frameCountRef.current = frameCountRef.current + 1;
  };

  useEffect(() => {
    renderLoopRef.current = renderLoop;
  });

  useEffect(() => {
    renderLoopRef.current = renderLoop;
    // start the render loop
    if (!frameRef.current && llmOutput && llmOutput.length > 0) {
      frameRef.current = requestAnimationFrame(renderLoopRef.current);
    } else if (
      // reset the render loop if user clears the llmOutput
      visibleTextIncrementsRef.current.length > 0 &&
      llmOutput.length === 0
    ) {
      reset();
    }
  }, [llmOutput]);

  useEffect(() => {
    () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!finishTimeRef.current && isStreamFinished) {
      finishTimeRef.current = performance.now();
    }
  }, [isStreamFinished]);

  return { blockMatches, restart, ...state };
};
