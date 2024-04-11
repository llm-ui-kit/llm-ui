import { useRef, useState } from "react";
import { useAnimationFrame } from "./animationFrame";
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
  stopWhenFinished?: boolean;
  throttle: ThrottleFunction;
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
  stopWhenFinished = true,
}: LLMOutputProps): { matches: BlockMatch[] } => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const [matches, setMatches] = useState<BlockMatch[]>(
    matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock: fallbackComponent,
      isStreamFinished: isFinished,
    }),
  );

  useAnimationFrame(() => {
    // render loop!
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
    if (stopWhenFinished && shouldStop) {
      stop();
    }

    // allow looping
    if (llmOutput.length === 1 && matches.length > 0) {
      setMatches([]);
      return;
    }

    const { visibleTextLengthTarget, skip } = throttle({
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
  });

  return { matches };
};

export const LLMOutput: React.FC<LLMOutputProps> = (props) => {
  const { matches } = useMatches({ ...props });
  return (
    <>
      {matches.map(({ block, match }, index) => {
        const Component = block.component;
        return <Component key={index} llmOutput={match.outputAfterLookback} />;
      })}
    </>
  );
};
