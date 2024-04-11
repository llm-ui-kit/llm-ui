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
  const renderLoopRef = useRef<() => void>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const restartRef = useRef<boolean>(false);

  const [matches, setMatches] = useState<BlockMatch[]>(
    matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock: fallbackComponent,
      isStreamFinished: isFinished,
    }),
  );

  const renderLoop = () => {
    // render loop!
    if (!renderLoopRef.current) {
      return;
    }
    if (restartRef.current) {
      startTime.current = performance.now();
      restartRef.current = false;
      setMatches([]);
      setTimeout(renderLoopRef.current, 0);
      return;
    }

    const timeInMsSinceStart = performance.now() - startTime.current;
    const timeInMsSinceLastRender = performance.now() - lastRenderTime.current;
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

    const shouldStop = visibleText === visibleTextAll && isFinished;
    if (shouldStop) {
      timeoutRef.current = undefined;
      return;
    }

    const { visibleTextLengthTarget, skip, delayMs } = throttle({
      outputRaw: llmOutput,
      outputRendered,
      outputAll,
      visibleText,
      visibleTextAll,
      timeInMsSinceStart,
      timeInMsSinceLastRender,
      isStreamFinished: isFinished,
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
    timeoutRef.current = setTimeout(renderLoopRef.current, delayMs);
  };

  useEffect(() => {
    renderLoopRef.current = renderLoop;
  });

  useEffect(() => {
    renderLoop();
  }, []);

  useEffect(() => {
    if (loopIndex > 0) {
      restartRef.current = true;
      if (!timeoutRef.current) {
        renderLoop();
      }
    }
  }, [loopIndex]);

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
