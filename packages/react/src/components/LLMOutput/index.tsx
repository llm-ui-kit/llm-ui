import { useEffect, useRef, useState } from "react";
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
  const visibleText = matches.map((match) => match.match.visibleText).join("");
  const outputRendered = matches
    .map((match) => match.match.outputAfterLookback)
    .join("");

  useEffect(() => {
    (async () => {
      if (outputRendered === llmOutput && isFinished) {
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
      const visibleTextAll = allMatches
        .map((match) => match.match.visibleText)
        .join("");
      const outputAll = allMatches
        .map((match) => match.match.outputAfterLookback)
        .join("");

      const throttleFunc =
        matches[matches.length - 1]?.component?.throttle ?? throttle;
      const { visibleTextLengthTarget, skip } = await throttleFunc({
        outputRaw: llmOutput,
        outputRendered,
        outputAll,
        visibleText,
        visibleTextAll,
        timeInMsSinceStart,
        isStreamFinished: isFinished,
      });
      console.log({ visibleTextLengthTarget, skip });
      if (!skip) {
        const matches = matchComponents({
          llmOutput,
          components,
          fallbackComponent,
          isStreamFinished: isFinished,
          visibleTextLengthTarget,
        });
        console.log("matches", matches);
        console.log("llmOutput", llmOutput);

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
