import { useEffect, useRef, useState } from "react";
import { BlockMatch, matchBlocks } from "./helper";
import {
  LLMOutputBlock,
  LLMOutputFallbackBlock,
  ThrottleFunction,
} from "./types";

export type LLMOutputProps = {
  llmOutput: string;
  blocks?: LLMOutputBlock[];
  fallbackBlock: LLMOutputFallbackBlock;
  isStreamFinished: boolean;
  throttle: ThrottleFunction;
  loopIndex?: number;
};

const matchesToVisibleText = (matches: BlockMatch[]): string => {
  return matches.map((match) => match.match.visibleText).join("");
};

const matchesToOutput = (matches: BlockMatch[]): string => {
  return matches.map((match) => match.match.outputAfterLookback).join("");
};

export type UseLLMOutputReturn = {
  blockMatches: BlockMatch[];
  isFinished: boolean;
  visibleText: string;
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
  throttle,
  loopIndex = 0,
}: LLMOutputProps): UseLLMOutputReturn => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const renderLoopRef = useRef<(frameTime: DOMHighResTimeStamp) => void>();
  const frameRef = useRef<number>();
  const finishTimeRef = useRef<DOMHighResTimeStamp>();
  const restartRef = useRef<boolean>(false);
  const previousFrameTimeRef = useRef<DOMHighResTimeStamp>();
  const visibleTextAllLengthsRef = useRef<number[]>([]);
  const outputLengthsRef = useRef<number[]>([]);
  const visibleTextIncrementsRef = useRef<number[]>([]);

  const [{ blockMatches, ...state }, setState] =
    useState<UseLLMOutputReturn>(initialState);

  const renderLoop = (frameTime: DOMHighResTimeStamp) => {
    if (!renderLoopRef.current) {
      return;
    }
    if (restartRef.current) {
      startTime.current = performance.now();
      restartRef.current = false;
      setState(initialState);
      finishTimeRef.current = undefined;
      previousFrameTimeRef.current = undefined;
      visibleTextAllLengthsRef.current = [];
      outputLengthsRef.current = [];
      visibleTextIncrementsRef.current = [];
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
      setState({ blockMatches: matches, isFinished, visibleText });
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
    if (loopIndex > 0) {
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

export const LLMOutput: React.FC<LLMOutputProps> = (props) => {
  const { blockMatches } = useLLMOutput(props);
  return (
    <>
      {blockMatches.map(({ block, match }, index) => {
        const Component = block.component;
        return <Component key={index} llmOutput={match.outputAfterLookback} />;
      })}
    </>
  );
};
