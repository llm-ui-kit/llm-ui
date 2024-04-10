import { useRef, useState } from "react";
import { ComponentMatch, matchComponents } from "./helper";
import {
  LLMOutputComponent,
  LLMOutputFallbackComponent,
  ThrottleFunction,
} from "./types";

export type LLMOutputProps = {
  llmOutput: string;
  isFinished: boolean;
  components: LLMOutputComponent[];
  fallbackComponent: LLMOutputFallbackComponent;
  throttle: ThrottleFunction;
};

export const useMatches = ({
  llmOutput,
  isFinished,
  components,
  fallbackComponent,
  throttle,
}: LLMOutputProps): { matches: ComponentMatch[] } => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  const [matches, setMatches] = useState<ComponentMatch[]>([]);

  useAnimationFrame((_deltaTime, stop) => {
    // render loop!
    const timeInMsSinceStart = performance.now() - startTime.current;
    const timeInMsSinceLastRender = performance.now() - lastRenderTime.current;
    const allMatches = matchComponents({
      llmOutput,
      components,
      fallbackComponent,
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
      const matches = matchComponents({
        llmOutput,
        components,
        fallbackComponent,
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
      {matches.map(({ component, match }, index) => {
        const Component = component.component;
        return <Component key={index} llmOutput={match.outputAfterLookback} />;
      })}
    </>
  );
};
