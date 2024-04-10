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
  isFinished: boolean;
  blocks?: LLMOutputBlock[];
  fallbackComponent: LLMOutputFallbackBlock;
  throttle: ThrottleFunction;
};

export const useMatches = ({
  llmOutput,
  isFinished,
  blocks = [],
  fallbackComponent,
  throttle,
}: LLMOutputProps): { matches: BlockMatch[] } => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const [matches, setMatches] = useState<BlockMatch[]>([]);

  useAnimationFrame((_deltaTime, stop) => {
    // render loop!
    const timeInMsSinceStart = performance.now() - startTime.current;
    const timeInMsSinceLastRender = performance.now() - lastRenderTime.current;
    const allMatches = matchBlocks({
      llmOutput,
      blocks,
      fallbackBlock: fallbackComponent,
      isStreamFinished: isFinished,
    });
    const visibleText = matches
      .map((match) => match.match.visibleText)
      .join("");
    const outputRendered = matches
      .map((match) => match.match.outputAfterLookback)
      .join("");
    const visibleTextAll = allMatches
      .map((match) => match.match.visibleText)
      .join("");
    const outputAll = allMatches
      .map((match) => match.match.outputAfterLookback)
      .join("");

    const shouldStop = visibleText === visibleTextAll && isFinished;
    if (shouldStop) {
      stop();
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
