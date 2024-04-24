import { useEffect, useRef, useState } from "react";
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
  loopIndex?: number;
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
  visibleText: string;
  loopIndex: number;
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
  loopIndex = 0,
}: LLMOutputProps): UseLLMOutputReturn => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const renderLoopRef = useRef<(frameTime: DOMHighResTimeStamp) => void>();
  const frameRef = useRef<number>();
  const frameCountRef = useRef<number>(0);
  const finishTimeRef = useRef<DOMHighResTimeStamp>();
  const restartRef = useRef<boolean>(false);
  const previousFrameTimeRef = useRef<DOMHighResTimeStamp>();
  const visibleTextAllLengthsRef = useRef<number[]>([]);
  const outputLengthsRef = useRef<number[]>([]);
  const visibleTextIncrementsRef = useRef<number[]>([]);
  const visibleTextLengthTargetRef = useRef<number>(0);

  const [{ blockMatches, ...state }, setState] = useState<UseLLMOutputReturn>({
    ...initialState,
    loopIndex,
    blockMatches: matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock,
      isStreamFinished,
    }),
  });

  const renderLoop = (frameTime: DOMHighResTimeStamp) => {
    if (!renderLoopRef.current) {
      return;
    }
    if (restartRef.current) {
      startTime.current = performance.now();
      restartRef.current = false;
      finishTimeRef.current = undefined;
      frameCountRef.current = 0;
      previousFrameTimeRef.current = undefined;
      visibleTextAllLengthsRef.current = [];
      outputLengthsRef.current = [];
      visibleTextIncrementsRef.current = [];
      visibleTextLengthTargetRef.current = 0;
      requestAnimationFrame(renderLoopRef.current);
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
        visibleText,
      }));
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
      frameCount: frameCountRef.current,
      frameTime,
      frameTimePrevious: previousFrameTimeRef.current,
      finishStreamTime: finishTimeRef.current,
      visibleTextLengthsAll: visibleTextAllLengthsRef.current,
      outputLengths: outputLengthsRef.current,
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
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(renderLoopRef.current);
    }
    () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loopIndex > 0) {
      // set the state here so we have latest loopIndex
      setState({ ...initialState, loopIndex });
      restartRef.current = true;
      if (!frameRef.current) {
        renderLoopRef.current = renderLoop;
        frameRef.current = requestAnimationFrame(renderLoopRef.current);
      }
    }
  }, [loopIndex]);

  useEffect(() => {
    if (!finishTimeRef.current && isStreamFinished) {
      finishTimeRef.current = performance.now();
    }
  }, [isStreamFinished]);

  return { blockMatches, ...state };
};
