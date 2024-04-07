import {
  ComponentMatch,
  LLMOutputComponent,
  LLMOutputMatch,
  LLMOutputReactComponent,
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
      matches.push({
        component: component.completeComponent,
        match: nextMatch,
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
    const partialMatch = component.isPartialMatch(
      llmOutput.slice(currentIndex),
    );
    if (partialMatch) {
      return {
        component: component.partialComponent,
        match: {
          match: partialMatch.match,
          startIndex: partialMatch.startIndex + currentIndex,
          endIndex: partialMatch.endIndex + currentIndex,
        },
        priority,
      };
    }
  }
  return undefined;
};

const fallbacksInGaps = (
  componentMatches: ComponentMatch[],
  llmOutput: string,
  fallbackPriority: number,
  fallbackComponent: LLMOutputReactComponent,
): ComponentMatch[] => {
  const fallbacks = componentMatches
    .map((match, index) => {
      const previousMatchEndIndex =
        index === 0 ? 0 : componentMatches[index - 1].match.endIndex;
      if (previousMatchEndIndex < match.match.startIndex) {
        return {
          component: fallbackComponent,
          match: {
            startIndex: previousMatchEndIndex,
            endIndex: match.match.startIndex,
            match: llmOutput.slice(
              previousMatchEndIndex,
              match.match.startIndex,
            ),
          },
          priority: fallbackPriority,
        };
      }
      return undefined;
    })
    .filter((match) => match !== undefined) as ComponentMatch[];

  // Add last fallback that reaches to end of output
  const lastMatchEndIndex =
    componentMatches.length > 0
      ? componentMatches[componentMatches.length - 1].match.endIndex
      : 0;

  if (lastMatchEndIndex < llmOutput.length) {
    fallbacks.push({
      component: fallbackComponent,
      match: {
        startIndex: lastMatchEndIndex,
        endIndex: llmOutput.length,
        match: llmOutput.slice(lastMatchEndIndex, llmOutput.length),
      },
      priority: fallbackPriority,
    });
  }
  return fallbacks;
};

export const matchComponents = (
  llmOutput: string,
  components: LLMOutputComponent[],
  fallbackComponent: LLMOutputReactComponent,
): ComponentMatch[] => {
  const allCompleteMatches = components.flatMap((component, priority) =>
    completeMatchesForComponent(llmOutput, component, priority),
  );
  const matches = highestPriorityNonOverlappingMatches(allCompleteMatches);
  matches.sort(byMatchStartIndex);

  const lastMatchEndIndex =
    matches.length > 0 ? matches[matches.length - 1].match.endIndex : 0;

  const partialMatch = findPartialMatch(
    llmOutput,
    lastMatchEndIndex,
    components,
  );

  if (partialMatch) {
    matches.push(partialMatch);
  }
  const fallBacks = fallbacksInGaps(
    matches,
    llmOutput,
    components.length,
    fallbackComponent,
  );

  for (const fallBack of fallBacks) {
    matches.push(fallBack);
  }
  matches.sort(byMatchStartIndex);
  return matches;
};
