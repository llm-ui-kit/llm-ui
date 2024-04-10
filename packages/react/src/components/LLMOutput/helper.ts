import {
  LLMOutputComponent,
  LLMOutputFallbackComponent,
  LLMOutputMatch,
  LLMOutputMatchWithLookBack,
} from "./types";

export type ComponentMatch = {
  component: LLMOutputFallbackComponent;
  match: LLMOutputMatchWithLookBack;
  priority: number;
};

type ComponentMatchNoLookback = {
  component: LLMOutputFallbackComponent;
  match: LLMOutputMatch;
  priority: number;
};

const completeMatchesForComponent = ({
  llmOutput,
  component,
  priority,
}: {
  llmOutput: string;
  component: LLMOutputComponent;
  priority: number;
}): ComponentMatchNoLookback[] => {
  const matches: ComponentMatchNoLookback[] = [];
  let index = 0;
  while (index < llmOutput.length) {
    const nextMatch = component.isCompleteMatch(llmOutput.slice(index));
    if (nextMatch) {
      matches.push({
        component: component,
        match: {
          outputRaw: nextMatch.outputRaw,
          startIndex: index + nextMatch.startIndex,
          endIndex: index + nextMatch.endIndex,
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
  matches: ComponentMatchNoLookback[],
): ComponentMatchNoLookback[] => {
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
  match1: ComponentMatchNoLookback,
  match2: ComponentMatchNoLookback,
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

const findPartialMatch = ({
  llmOutput,
  components,
  currentIndex,
}: {
  llmOutput: string;
  currentIndex: number;
  components: LLMOutputComponent[];
}): ComponentMatchNoLookback | undefined => {
  for (const [priority, component] of components.entries()) {
    const outputRaw = llmOutput.slice(currentIndex);
    const partialMatch = component.isPartialMatch(outputRaw);
    if (partialMatch) {
      return {
        component: component,
        match: {
          outputRaw: partialMatch.outputRaw,
          startIndex: partialMatch.startIndex + currentIndex,
          endIndex: partialMatch.endIndex + currentIndex,
        },
        priority,
      };
    }
  }
  return undefined;
};

export type FallbacksInGapsParams = {
  componentMatches: ComponentMatchNoLookback[];
  llmOutput: string;
  fallbackPriority: number;
  fallbackComponent: LLMOutputFallbackComponent;
};
const fallbacksInGaps = ({
  componentMatches,
  llmOutput,
  fallbackPriority,
  fallbackComponent,
}: FallbacksInGapsParams): ComponentMatchNoLookback[] => {
  const fallbacks = componentMatches
    .map((match, index) => {
      const previousMatchEndIndex =
        index === 0 ? 0 : componentMatches[index - 1].match.endIndex;
      if (previousMatchEndIndex < match.match.startIndex) {
        const outputRaw = llmOutput.slice(
          previousMatchEndIndex,
          match.match.startIndex,
        );

        return {
          component: fallbackComponent,
          match: {
            startIndex: previousMatchEndIndex,
            endIndex: match.match.startIndex,
            outputRaw,
          },
          priority: fallbackPriority,
        } satisfies ComponentMatchNoLookback;
      }
      return undefined;
    })
    .filter((match) => match !== undefined) as ComponentMatchNoLookback[];

  // Add last fallback that reaches to end of output
  const lastMatchEndIndex =
    componentMatches.length > 0
      ? componentMatches[componentMatches.length - 1].match.endIndex
      : 0;

  if (lastMatchEndIndex < llmOutput.length) {
    const outputRaw = llmOutput.slice(lastMatchEndIndex, llmOutput.length);

    fallbacks.push({
      component: fallbackComponent,
      match: {
        startIndex: lastMatchEndIndex,
        endIndex: llmOutput.length,
        outputRaw,
      },
      priority: fallbackPriority,
    });
  }
  return fallbacks;
};

const matchesWithLookback = ({
  matches,
  visibleTextLengthTarget,
  isStreamFinished,
}: {
  matches: ComponentMatchNoLookback[];
  visibleTextLengthTarget: number;
  isStreamFinished: boolean;
}): ComponentMatch[] => {
  return matches.reduce((acc, match, index) => {
    const visibleTextSoFar = acc
      .map((m) => m.match.visibleText.length)
      .reduce((a, b) => a + b, 0);
    const localVisibleTextLengthTarget =
      visibleTextLengthTarget - visibleTextSoFar;
    if (localVisibleTextLengthTarget <= 0) {
      return acc;
    }
    const isLastMatch = index === matches.length - 1;
    const { output, visibleText } = match.component.lookBack({
      isComplete: !isLastMatch || isStreamFinished,
      visibleTextLengthTarget: localVisibleTextLengthTarget,
      isStreamFinished: isStreamFinished,
      output: match.match.outputRaw,
    });
    if (visibleText.length > localVisibleTextLengthTarget) {
      throw new Error(
        `Visible text length exceeded target for: ${visibleText} target: ${localVisibleTextLengthTarget}`,
      );
    }
    const matchWithLookback: ComponentMatch = {
      ...match,
      match: {
        ...match.match,
        outputAfterLookback: output,
        visibleText,
      },
    };

    return [...acc, matchWithLookback];
  }, [] as ComponentMatch[]);
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
    completeMatchesForComponent({
      llmOutput,
      component,
      priority,
    }),
  );
  const matches = highestPriorityNonOverlappingMatches(allCompleteMatches);
  matches.sort(byMatchStartIndex);

  const lastMatchEndIndex =
    matches.length > 0 ? matches[matches.length - 1].match.endIndex : 0;

  const partialMatch = !isStreamFinished
    ? findPartialMatch({
        llmOutput,
        currentIndex: lastMatchEndIndex,
        components,
      })
    : undefined;

  if (partialMatch) {
    matches.push(partialMatch);
  }
  const fallBacks = fallbacksInGaps({
    componentMatches: matches,
    llmOutput,
    fallbackPriority: components.length,
    fallbackComponent,
  });

  for (const fallBack of fallBacks) {
    matches.push(fallBack);
  }
  matches.sort(byMatchStartIndex);
  return matchesWithLookback({
    matches,
    isStreamFinished,
    visibleTextLengthTarget,
  });
};
