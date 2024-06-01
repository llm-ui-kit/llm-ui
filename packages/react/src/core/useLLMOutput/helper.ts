import {
  BlockMatch,
  BlockMatchNoLookback,
  LLMOutputBlock,
  LLMOutputFallbackBlock,
  LLMOutputMatch,
} from "./types";

const completeMatchesForBlock = ({
  llmOutput,
  block,
  priority,
}: {
  llmOutput: string;
  block: LLMOutputBlock;
  priority: number;
}): BlockMatchNoLookback[] => {
  const matches: BlockMatchNoLookback[] = [];
  let index = 0;
  while (index < llmOutput.length) {
    const nextMatch = block.findCompleteMatch(llmOutput.slice(index));
    if (nextMatch) {
      matches.push({
        block,
        match: {
          outputRaw: nextMatch.outputRaw,
          startIndex: index + nextMatch.startIndex,
          endIndex: index + nextMatch.endIndex,
        },
        llmOutput,
        isComplete: true,
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
  matches: BlockMatchNoLookback[],
): BlockMatchNoLookback[] => {
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
  match1: BlockMatchNoLookback,
  match2: BlockMatchNoLookback,
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
  blocks,
  currentIndex,
}: {
  llmOutput: string;
  currentIndex: number;
  blocks: LLMOutputBlock[];
}): BlockMatchNoLookback | undefined => {
  for (const [priority, block] of Array.from(blocks.entries())) {
    const outputRaw = llmOutput.slice(currentIndex);
    const partialMatch = block.findPartialMatch(outputRaw);
    if (partialMatch) {
      return {
        block: block,
        match: {
          outputRaw: partialMatch.outputRaw,
          startIndex: partialMatch.startIndex + currentIndex,
          endIndex: partialMatch.endIndex + currentIndex,
        },
        llmOutput,
        isComplete: true,
        priority,
      };
    }
  }
  return undefined;
};

export type FallbacksInGapsParams = {
  blockMatches: BlockMatchNoLookback[];
  llmOutput: string;
  fallbackPriority: number;
  fallbackBlock: LLMOutputFallbackBlock;
};
const fallbacksInGaps = ({
  blockMatches,
  llmOutput,
  fallbackPriority,
  fallbackBlock,
}: FallbacksInGapsParams): BlockMatchNoLookback[] => {
  const fallbacks = blockMatches
    .map((match, index) => {
      const previousMatchEndIndex =
        index === 0 ? 0 : blockMatches[index - 1].match.endIndex;
      if (previousMatchEndIndex < match.match.startIndex) {
        const outputRaw = llmOutput.slice(
          previousMatchEndIndex,
          match.match.startIndex,
        );

        return {
          block: fallbackBlock,
          match: {
            startIndex: previousMatchEndIndex,
            endIndex: match.match.startIndex,
            outputRaw,
          },
          priority: fallbackPriority,
          llmOutput,
          isComplete: true,
        } satisfies BlockMatchNoLookback;
      }
      return undefined;
    })
    .filter((match) => match !== undefined) as BlockMatchNoLookback[];

  // Add last fallback that reaches to end of output
  const lastMatchEndIndex =
    blockMatches.length > 0
      ? blockMatches[blockMatches.length - 1].match.endIndex
      : 0;

  if (lastMatchEndIndex < llmOutput.length) {
    const outputRaw = llmOutput.slice(lastMatchEndIndex, llmOutput.length);

    fallbacks.push({
      block: fallbackBlock,
      match: {
        startIndex: lastMatchEndIndex,
        endIndex: llmOutput.length,
        outputRaw,
      },
      priority: fallbackPriority,
      llmOutput,
      isComplete: false,
    });
  }
  return fallbacks;
};

const matchesWithLookback = ({
  llmOutputRaw,
  matches,
  visibleTextLengthTarget,
  isStreamFinished,
}: {
  llmOutputRaw: string;
  matches: BlockMatchNoLookback[];
  visibleTextLengthTarget: number;
  isStreamFinished: boolean;
}): BlockMatch[] => {
  return matches.reduce((acc, match, index) => {
    const visibleTextSoFar = acc
      .map((m) => m.visibleText.length)
      .reduce((a, b) => a + b, 0);
    const localVisibleTextLengthTarget = Math.max(
      visibleTextLengthTarget - visibleTextSoFar,
      0,
    );

    const isLastMatch = index === matches.length - 1;
    const isComplete = !isLastMatch || isStreamFinished;
    const { output, visibleText } = match.block.lookBack({
      isComplete,
      visibleTextLengthTarget: localVisibleTextLengthTarget,
      isStreamFinished: isStreamFinished,
      output: match.match.outputRaw,
    });
    if (
      visibleText.length > localVisibleTextLengthTarget &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        `Visible text length exceeded target for: ${visibleText} has length ${visibleText.length} target: ${localVisibleTextLengthTarget}. Raw output: ${llmOutputRaw}`,
      );
    }
    const matchWithLookback: BlockMatch = {
      ...match.match,
      isComplete,
      block: match.block,
      priority: match.priority,
      llmOutput: match.llmOutput,
      output,
      visibleText,
      isVisible: visibleText.length > 0,
    };

    return [...acc, matchWithLookback];
  }, [] as BlockMatch[]);
};

export type MatchBlocksParams = {
  llmOutput: string;
  blocks: LLMOutputBlock[];
  fallbackBlock: LLMOutputFallbackBlock;
  isStreamFinished: boolean;
  visibleTextLengthTarget?: number;
};

export const matchBlocks = ({
  llmOutput,
  blocks,
  fallbackBlock,
  isStreamFinished,
  visibleTextLengthTarget = Number.MAX_SAFE_INTEGER,
}: MatchBlocksParams): BlockMatch[] => {
  const allCompleteMatches = blocks.flatMap((block, priority) =>
    completeMatchesForBlock({
      llmOutput,
      block,
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
        blocks,
      })
    : undefined;

  if (partialMatch) {
    matches.push(partialMatch);
  }
  const fallBacks = fallbacksInGaps({
    blockMatches: matches,
    llmOutput,
    fallbackPriority: blocks.length,
    fallbackBlock,
  });

  for (const fallBack of fallBacks) {
    matches.push(fallBack);
  }
  matches.sort(byMatchStartIndex);
  return matchesWithLookback({
    llmOutputRaw: llmOutput,
    matches,
    isStreamFinished,
    visibleTextLengthTarget,
  });
};
