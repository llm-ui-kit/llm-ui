import { useEffect, useRef, useState } from "react";
import { matchComponents } from "./helper";
import {
  ComponentMatch,
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

export const LLMOutput: React.FC<LLMOutputProps> = ({
  llmOutput,
  isFinished,
  components,
  fallbackComponent,
  throttle,
}) => {
  const startTime = useRef<number>(0);
  const [ticks, setTicks] = useState<number>(0);
  const [matches, setMatches] = useState<ComponentMatch[]>([]);
  const visibleChars = matches.map((match) => match.match.visibleText).join("");
  const renderedLLMOutput = matches
    .map((match) => match.match.outputAfterLookback)
    .join("");

  useEffect(() => {
    (async () => {
      if (renderedLLMOutput === llmOutput && isFinished) {
        return;
      }
      console.log("\n------\n");
      const timeInMsSinceStart = Date.now() - startTime.current;
      const allMatches = matchComponents({
        llmOutput,
        components,
        fallbackComponent,
        isStreamFinished: isFinished,
      });
      const allVisibleChars = allMatches
        .map((match) => match.match.visibleText)
        .join("");
      const allRenderedLLMOutput = allMatches
        .map((match) => match.match.outputAfterLookback)
        .join("");

      const throttleFunc =
        matches[matches.length - 1]?.component?.throttle ?? throttle;
      const { targetVisibleCharsLength: visibleCharsIndex, skip } =
        await throttleFunc({
          rawLLMOutput: llmOutput,
          currentLLMOutput: renderedLLMOutput,
          allLLMOutput: allRenderedLLMOutput,
          visibleChars,
          allVisibleChars,
          timeInMsSinceStart,
          isStreamFinished: isFinished,
        });
      console.log({ visibleCharsIndex, skip });
      if (!skip) {
        const matches = matchComponents({
          llmOutput,
          components,
          fallbackComponent,
          isStreamFinished: isFinished,
          visibleCharsIndex,
        });
        // console.log("zzz matches", matches, llmOutput);
        setMatches(matches);
      }

      setTicks((ticks) => ticks + 1); // triggers the next tick
    })();
  }, [ticks]);

  useEffect(() => {
    if (llmOutput.length > 0 && startTime.current === 0) {
      startTime.current = Date.now();
      setTicks((ticks) => ticks + 1);
    }
  }, [llmOutput]);

  return (
    <>
      {matches.map(({ component, match }, index) => {
        const Component = component.component;
        return <Component key={index} llmOutput={match.outputAfterLookback} />;
      })}
    </>
  );
};
