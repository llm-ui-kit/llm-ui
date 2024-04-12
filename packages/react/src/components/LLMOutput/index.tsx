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
  fallbackComponent: LLMOutputFallbackBlock;
  isFinished: boolean;
  throttle: ThrottleFunction;
  loopIndex?: number;
};

const matchesToVisibleText = (matches: BlockMatch[]): string => {
  return matches.map((match) => match.match.visibleText).join("");
};

const matchesToOutput = (matches: BlockMatch[]): string => {
  return matches.map((match) => match.match.outputAfterLookback).join("");
};

export const useMatches = ({
  llmOutput,
  isFinished,
  blocks = [],
  fallbackComponent,
  throttle,
  loopIndex = 0,
}: LLMOutputProps): { matches: BlockMatch[] } => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const renderLoopRef = useRef<(frameTime: DOMHighResTimeStamp) => void>();
  const frameRef = useRef<number>();
  const finishTimeRef = useRef<DOMHighResTimeStamp>();
  const restartRef = useRef<boolean>(false);
  const previousFrameTimeRef = useRef<DOMHighResTimeStamp>();
  const visibleTextLengths = useRef<number[]>([]);
  const outputLengths = useRef<number[]>([]);

  const [matches, setMatches] = useState<BlockMatch[]>(
    matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock: fallbackComponent,
      isStreamFinished: isFinished,
    }),
  );

  const renderLoop = (frameTime: DOMHighResTimeStamp) => {
    // render loop!
    if (!renderLoopRef.current) {
      return;
    }
    if (restartRef.current) {
      startTime.current = performance.now();
      restartRef.current = false;
      setMatches([]);
      finishTimeRef.current = undefined;
      previousFrameTimeRef.current = undefined;
      visibleTextLengths.current = [];
      outputLengths.current = [];
      requestAnimationFrame(renderLoopRef.current);
      return;
    }

    const allMatches = matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock: fallbackComponent,
      isStreamFinished: isFinished,
    });
    const visibleText = matchesToVisibleText(matches);
    const outputRendered = matchesToOutput(matches);

    const visibleTextAll = matchesToVisibleText(allMatches);
    const outputAll = matchesToOutput(allMatches);
    if (!isFinished) {
      visibleTextLengths.current.push(visibleTextAll.length);
      outputLengths.current.push(outputAll.length);
    }
    const shouldStop = visibleText === visibleTextAll && isFinished;
    if (shouldStop) {
      frameRef.current = undefined;
      return;
    }

    const { visibleTextLengthTarget, skip } = throttle({
      outputRaw: llmOutput,
      outputRendered,
      outputAll,
      visibleText,
      visibleTextAll,
      startStreamTime: startTime.current,
      isStreamFinished: isFinished,
      frameTime,
      frameTimePrevious: previousFrameTimeRef.current,
      finishStreamTime: finishTimeRef.current,
      visibleTextLengths: visibleTextLengths.current,
      outputLengths: outputLengths.current,
    });
    if (!skip) {
      const matches = matchBlocks({
        llmOutput,
        blocks,
        fallbackBlock: fallbackComponent,
        isStreamFinished: isFinished,
        visibleTextLengthTarget,
      });
      lastRenderTime.current = performance.now();
      setMatches(matches);
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
    if (!finishTimeRef.current && isFinished) {
      finishTimeRef.current = performance.now();
    }
  }, [isFinished]);

  return { matches };
};

export const LLMOutput: React.FC<LLMOutputProps> = (props) => {
  const { matches } = useMatches(props);
  return (
    <>
      {matches.map(({ block, match }, index) => {
        const Component = block.component;
        return <Component key={index} llmOutput={match.outputAfterLookback} />;
      })}
    </>
  );
};
