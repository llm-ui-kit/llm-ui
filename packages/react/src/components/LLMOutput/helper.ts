import {
  ComponentMatch,
  LLMOutputComponent,
  LLMOutputFallbackComponent,
  LLMOutputMatch,
} from "./types";

const completeMatchesForComponent = (
  llmOutput: string,
  component: LLMOutputComponent,
  priority: number,
): ComponentMatch[] => {
  const matches: ComponentMatch[] = [];
  let index = 0;
  while (index < llmOutput.length) {
    const nextMatch = component.isCompleteMatch(llmOutput.slice(index));
    if (nextMatch) {
      const lookBack = component.lookBack({
        output: nextMatch.outputRaw,
        visibleTextLengthTarget: Number.MAX_SAFE_INTEGER,
        isStreamFinished: false,
        isComplete: true,
      });
      matches.push({
        component: component,
        match: {
          outputRaw: nextMatch.outputRaw,
          startIndex: index + nextMatch.startIndex,
          endIndex: index + nextMatch.endIndex,
          outputAfterLookback: lookBack.output,
          visibleText: lookBack.visibleText,
        },
        priority,
      });
      index += nextMatch.endIndex;
    } else {
      return matches;
    }
  }
  return matches;
};

const highestPriorityNonOverlappingMatches = (
  matches: ComponentMatch[],
): ComponentMatch[] => {
  return matches.filter((match) => {
    const higherPriorityMatches = matches.filter(
      (m) => m.priority < match.priority,
    );
    return !higherPriorityMatches.some((m) =>
      isOverlapping(m.match, match.match),
    );
  });
};

const byMatchStartIndex = (
  match1: ComponentMatch,
  match2: ComponentMatch,
): number => match1.match.startIndex - match2.match.startIndex;

const isOverlapping = (
  match1: LLMOutputMatch,
  match2: LLMOutputMatch,
): boolean => {
  return (
    (match1.startIndex >= match2.startIndex &&
      match1.startIndex < match2.endIndex) || // match1 starts inside match2
    (match1.endIndex > match2.startIndex &&
      match1.endIndex <= match2.endIndex) || // match1 ends inside match2
    (match2.startIndex >= match1.startIndex &&
      match2.startIndex < match1.endIndex) || // match2 starts inside match1
    (match2.endIndex > match1.startIndex && match2.endIndex <= match1.endIndex) // match2 ends inside match1
  );
};

const findPartialMatch = (
  llmOutput: string,
  currentIndex: number,
  components: LLMOutputComponent[],
): ComponentMatch | undefined => {
  for (const [priority, component] of components.entries()) {
    const outputRaw = llmOutput.slice(currentIndex);
    const partialMatch = component.isPartialMatch(outputRaw);
    if (partialMatch) {
      const lookBack = component.lookBack({
        output: partialMatch.outputRaw,
        visibleTextLengthTarget: Number.MAX_SAFE_INTEGER,
        isStreamFinished: false,
        isComplete: false,
      });
      return {
        component: component,
        match: {
          outputRaw,
          startIndex: partialMatch.startIndex + currentIndex,
          endIndex: partialMatch.endIndex + currentIndex,
          outputAfterLookback: lookBack.output,
          visibleText: lookBack.visibleText,
        },
        priority,
      };
    }
  }
  return undefined;
};

export type FallbacksInGapsParams = {
  componentMatches: ComponentMatch[];
  llmOutput: string;
  fallbackPriority: number;
  fallbackComponent: LLMOutputFallbackComponent;
  visibleTextLengthTarget: number;
  isStreamFinished: boolean;
};

const fallbacksInGaps = ({
  componentMatches,
  llmOutput,
  fallbackPriority,
  fallbackComponent,
  visibleTextLengthTarget,
  isStreamFinished,
}: FallbacksInGapsParams): ComponentMatch[] => {
  const fallbacks = componentMatches
    .map((match, index) => {
      const previousMatchEndIndex =
        index === 0 ? 0 : componentMatches[index - 1].match.endIndex;
      if (
        previousMatchEndIndex < match.match.startIndex &&
        visibleTextLengthTarget > 0
      ) {
        const outputRaw = llmOutput.slice(
          previousMatchEndIndex,
          match.match.startIndex,
        );
        const lookBack = fallbackComponent.lookBack({
          output: outputRaw,
          visibleTextLengthTarget: visibleTextLengthTarget,
          isStreamFinished,
          isComplete: true,
        });
        if (lookBack.visibleText.length > visibleTextLengthTarget) {
          throw new Error("lookBack visible output is longer than requested");
        }
        visibleTextLengthTarget =
          visibleTextLengthTarget - lookBack.visibleText.length;
        return {
          component: fallbackComponent,
          match: {
            startIndex: previousMatchEndIndex,
            endIndex: match.match.startIndex,
            outputRaw,
            outputAfterLookback: lookBack.output,
            visibleText: lookBack.visibleText,
          },
          priority: fallbackPriority,
        } satisfies ComponentMatch;
      }
      return undefined;
    })
    .filter((match) => match !== undefined) as ComponentMatch[];

  // Add last fallback that reaches to end of output
  const lastMatchEndIndex =
    componentMatches.length > 0
      ? componentMatches[componentMatches.length - 1].match.endIndex
      : 0;

  if (lastMatchEndIndex < llmOutput.length && visibleTextLengthTarget > 0) {
    const outputRaw = llmOutput.slice(lastMatchEndIndex, llmOutput.length);
    const lookBack = fallbackComponent.lookBack({
      output: outputRaw,
      visibleTextLengthTarget,
      isStreamFinished,
      isComplete: false,
    });
    if (lookBack.visibleText.length > visibleTextLengthTarget) {
      throw new Error("lookback visible output is longer than requested");
    }
    visibleTextLengthTarget =
      visibleTextLengthTarget - lookBack.visibleText.length;
    fallbacks.push({
      component: fallbackComponent,
      match: {
        startIndex: lastMatchEndIndex,
        endIndex: llmOutput.length,
        outputRaw,
        outputAfterLookback: lookBack.output,
        visibleText: lookBack.visibleText,
      },
      priority: fallbackPriority,
    });
  }
  return fallbacks;
};

export type MatchComponentParams = {
  llmOutput: string;
  components: LLMOutputComponent[];
  fallbackComponent: LLMOutputFallbackComponent;
  isStreamFinished: boolean;
  visibleTextLengthTarget?: number;
};

export const matchComponents = ({
  llmOutput,
  components,
  fallbackComponent,
  isStreamFinished,
  visibleTextLengthTarget = Number.MAX_SAFE_INTEGER,
}: MatchComponentParams): ComponentMatch[] => {
  const allCompleteMatches = components.flatMap((component, priority) =>
    completeMatchesForComponent(llmOutput, component, priority),
  );
  const matches = highestPriorityNonOverlappingMatches(allCompleteMatches);
  matches.sort(byMatchStartIndex);

  const lastMatchEndIndex =
    matches.length > 0 ? matches[matches.length - 1].match.endIndex : 0;

  const partialMatch = !isStreamFinished
    ? findPartialMatch(llmOutput, lastMatchEndIndex, components)
    : undefined;

  if (partialMatch) {
    matches.push(partialMatch);
  }
  const fallBacks = fallbacksInGaps({
    componentMatches: matches,
    llmOutput,
    fallbackPriority: components.length,
    fallbackComponent,
    visibleTextLengthTarget,
    isStreamFinished,
  });

  for (const fallBack of fallBacks) {
    matches.push(fallBack);
  }
  matches.sort(byMatchStartIndex);
  return matches;
};
