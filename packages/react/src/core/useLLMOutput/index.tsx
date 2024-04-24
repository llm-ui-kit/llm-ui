import { useCallback, useEffect, useRef, useState } from "react";
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
  const finishTimeRef = useRef<DOMHighResTimeStamp>();
  const previousFrameTimeRef = useRef<DOMHighResTimeStamp>();
  const visibleTextAllLengthsRef = useRef<number[]>([]);
  const outputLengthsRef = useRef<number[]>([]);
  const visibleTextIncrementsRef = useRef<number[]>([]);

  const [{ blockMatches, ...state }, setState] = useState<
    Omit<UseLLMOutputReturn, "restart">
  >({
    ...initialState,
    finishCount: 0,
    blockMatches: matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock,
      isStreamFinished,
    }),
  });

  const restart = useCallback(() => {
    setState((state) => ({ ...state, ...initialState }));
    startTime.current = performance.now();
    finishTimeRef.current = undefined;
    previousFrameTimeRef.current = undefined;
    visibleTextAllLengthsRef.current = [];
    outputLengthsRef.current = [];
    visibleTextIncrementsRef.current = [];
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setTimeout(() => {
      if (renderLoopRef.current) {
        frameRef.current = requestAnimationFrame(renderLoopRef.current);
      }
    }, 10);
  }, [setState]);

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

    const { visibleTextIncrement } = throttle({
      outputRaw: llmOutput,
      outputRendered,
      outputAll,
      visibleText,
      visibleTextAll,
      startStreamTime: startTime.current,
      isStreamFinished,
      frameTime,
      frameTimePrevious: previousFrameTimeRef.current,
      finishStreamTime: finishTimeRef.current,
      visibleTextLengthsAll: visibleTextAllLengthsRef.current,
      outputLengths: outputLengthsRef.current,
      visibleTextIncrements: visibleTextIncrementsRef.current,
    });
    visibleTextIncrementsRef.current.push(visibleTextIncrement);
    const visibleTextLengthTarget = visibleText.length + visibleTextIncrement;

    if (visibleTextLengthTarget > visibleText.length) {
      const matches = matchBlocks({
        llmOutput,
        blocks,
        fallbackBlock,
        isStreamFinished,
        visibleTextLengthTarget,
      });
      lastRenderTime.current = performance.now();
      setState((state) => ({
        ...state,
        blockMatches: matches,
        isFinished,
        visibleText,
      }));
    }
    frameRef.current = requestAnimationFrame(renderLoopRef.current);
    previousFrameTimeRef.current = frameTime;
  };

  useEffect(() => {
    renderLoopRef.current = renderLoop;
  });

  useEffect(() => {
    renderLoopRef.current = renderLoop;
    frameRef.current = requestAnimationFrame(renderLoopRef.current);
  }, []);

  useEffect(() => {
    if (!finishTimeRef.current && isStreamFinished) {
      finishTimeRef.current = performance.now();
    }
  }, [isStreamFinished]);

  return { blockMatches, restart, ...state };
};
