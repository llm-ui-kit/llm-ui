import { describe, expect, test } from "vitest";
import { fallbackBlock, returnParamsLookBack } from "../../test/utils";
import { BlockMatch, matchBlocks } from "./helper";
import {
  LLMOutputBlock,
  LLMOutputFallbackBlock,
  MaybeLLMOutputMatch,
} from "./types";

const component1 = () => <div>1</div>;
const component2 = () => <div>2</div>;

const noMatch = () => undefined;

const neverMatchBlock: LLMOutputBlock = {
  component: component1,
  isCompleteMatch: noMatch,
  isPartialMatch: noMatch,
  lookBack: returnParamsLookBack,
};

const matchString = (
  inputString: string,
  target: string,
): MaybeLLMOutputMatch => {
  const startIndex = inputString.indexOf(target);
  if (startIndex === -1) {
    return undefined;
  }
  return {
    startIndex,
    endIndex: startIndex + target.length,
    outputRaw: target,
  };
};

const completeMatchesString = (
  target: string,
  lookBack = returnParamsLookBack,
): LLMOutputBlock => ({
  component: component1,
  isCompleteMatch: (output) => matchString(output, target),
  isPartialMatch: noMatch,
  lookBack: lookBack,
});

const partialMatchesString = (
  target: string,
  lookBack = returnParamsLookBack,
): LLMOutputBlock => ({
  component: component2,
  isCompleteMatch: noMatch,
  isPartialMatch: (output) => matchString(output, target),
  lookBack: lookBack,
});

type TestCase = {
  name: string;
  llmOutput: string;
  blocks: LLMOutputBlock[];
  fallbackBlock: LLMOutputFallbackBlock;
  isStreamFinished: boolean;
  visibleTextLengthTarget: number;
  expected: BlockMatch[];
};

describe("matchBlocks", () => {
  const testCases: (TestCase | (() => TestCase))[] = [
    {
      name: "no blocks is complete fallback match",
      llmOutput: "helloWorld",
      blocks: [],
      fallbackBlock: fallbackBlock,
      isStreamFinished: true,
      visibleTextLengthTarget: 100,
      expected: [
        {
          block: fallbackBlock,
          match: {
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            outputAfterLookback:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "no matching blocks is complete fallback match",
      llmOutput: "helloWorld",
      blocks: [neverMatchBlock],
      fallbackBlock: fallbackBlock,
      isStreamFinished: true,
      visibleTextLengthTarget: 100,
      expected: [
        {
          block: fallbackBlock,
          match: {
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            outputAfterLookback:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 1,
        },
      ],
    },
    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "first block complete matches whole input",
        llmOutput: "helloWorld",
        blocks: [block],
        isStreamFinished: true,
        visibleTextLengthTarget: 99,
        fallbackBlock: fallbackBlock,
        expected: [
          {
            block: block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:99 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "first block complete matches whole input - short visibleTarget",
        llmOutput: "helloWorld",
        blocks: [block],
        isStreamFinished: true,
        visibleTextLengthTarget: 3,
        fallbackBlock: fallbackBlock,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "hel",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:3 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "first block complete matches input twice - but short visibleTarget",
        llmOutput: "helloWorldhelloWorld",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 3,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "hel",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:3 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      } satisfies TestCase;
    },
    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "first block complete matches input twice",
        llmOutput: "helloWorldhelloWorld",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
              startIndex: 10,
              endIndex: 20,
            },
            priority: 0,
          },
        ],
      } satisfies TestCase;
    },

    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "first block complete matches input twice with fallback in between",
        llmOutput: "helloWorldfallbackhelloWorld",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
          {
            block: fallbackBlock,
            match: {
              outputRaw: "fallback",
              visibleText: "fallback",
              outputAfterLookback:
                "fallback isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
              startIndex: 10,
              endIndex: 18,
            },
            priority: 1,
          },
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:82 isStreamFinished:true",
              startIndex: 18,
              endIndex: 28,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "first block complete matches beginning of input",
        llmOutput: "helloWorld world",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
          {
            block: fallbackBlock,
            match: {
              outputRaw: " world",
              visibleText: " world",
              outputAfterLookback:
                " world isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
              startIndex: 10,
              endIndex: 16,
            },
            priority: 1,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString(" world");
      return {
        name: "first block complete matches end of input",
        llmOutput: "helloWorld world",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block: fallbackBlock,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 1,
          },
          {
            block,
            match: {
              outputRaw: " world",
              visibleText: " world",
              outputAfterLookback:
                " world isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
              startIndex: 10,
              endIndex: 16,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString(" world");
      return {
        name: "first block complete matches end of input - short visibleTarget",
        llmOutput: "helloWorld world",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 3,
        expected: [
          {
            block: fallbackBlock,
            match: {
              outputRaw: "helloWorld",
              visibleText: "hel",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:3 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 1,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString("oWo");
      return {
        name: "first block complete matches middle of input",
        llmOutput: "helloWorld world",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block: fallbackBlock,
            match: {
              outputRaw: "hell",
              visibleText: "hell",
              outputAfterLookback:
                "hell isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 4,
            },
            priority: 1,
          },
          {
            block,
            match: {
              outputRaw: "oWo",
              visibleText: "oWo",
              outputAfterLookback:
                "oWo isComplete:true visibleTextLengthTarget:96 isStreamFinished:true",
              startIndex: 4,
              endIndex: 7,
            },
            priority: 0,
          },
          {
            block: fallbackBlock,
            match: {
              outputRaw: "rld world",
              visibleText: "rld world",
              outputAfterLookback:
                "rld world isComplete:true visibleTextLengthTarget:93 isStreamFinished:true",
              startIndex: 7,
              endIndex: 16,
            },
            priority: 1,
          },
        ],
      };
    },
    () => {
      const block = completeMatchesString("helloWorld");
      return {
        name: "second block complete matches begginning of input",
        llmOutput: "helloWorld world",
        blocks: [neverMatchBlock, block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 1,
          },
          {
            block: fallbackBlock,
            match: {
              outputRaw: " world",
              visibleText: " world",
              outputAfterLookback:
                " world isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
              startIndex: 10,
              endIndex: 16,
            },
            priority: 2,
          },
        ],
      };
    },
    () => {
      const block1 = completeMatchesString("hello");
      const block2 = completeMatchesString("hello");
      return {
        name: "first complete match takes priority over second identical complete match",
        llmOutput: "helloWorld",
        blocks: [block1, block2],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block: block1,
            match: {
              outputRaw: "hello",
              visibleText: "hello",
              outputAfterLookback:
                "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 5,
            },
            priority: 0,
          },
          {
            block: fallbackBlock,
            match: {
              outputRaw: "World",
              visibleText: "World",
              outputAfterLookback:
                "World isComplete:true visibleTextLengthTarget:95 isStreamFinished:true",
              startIndex: 5,
              endIndex: 10,
            },
            priority: 2,
          },
        ],
      };
    },
    () => {
      const block1 = completeMatchesString("hello");
      const block2 = completeMatchesString("ell");
      return {
        name: "first complete match takes priority over second overlapping complete match",
        llmOutput: "helloWorld",
        blocks: [block1, block2],
        fallbackBlock: fallbackBlock,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block: block1,
            match: {
              outputRaw: "hello",
              visibleText: "hello",
              outputAfterLookback:
                "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
              startIndex: 0,
              endIndex: 5,
            },
            priority: 0,
          },
          {
            block: fallbackBlock,
            match: {
              outputRaw: "World",
              visibleText: "World",
              outputAfterLookback:
                "World isComplete:true visibleTextLengthTarget:95 isStreamFinished:true",
              startIndex: 5,
              endIndex: 10,
            },
            priority: 2,
          },
        ],
      };
    },
    () => {
      const block = partialMatchesString("helloWorld");
      return {
        name: "first block partial matches whole input - isStreamFinished: false",
        llmOutput: "helloWorld",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: false,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "helloWorld",
              outputAfterLookback:
                "helloWorld isComplete:false visibleTextLengthTarget:100 isStreamFinished:false",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const block = partialMatchesString("helloWorld");
      return {
        name: "first block partial matches whole input - short visibleTarget, isStreamFinished: false",
        llmOutput: "helloWorld",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: false,
        visibleTextLengthTarget: 3,
        expected: [
          {
            block,
            match: {
              outputRaw: "helloWorld",
              visibleText: "hel",
              outputAfterLookback:
                "helloWorld isComplete:false visibleTextLengthTarget:3 isStreamFinished:false",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const block = partialMatchesString("World");
      return {
        name: "first block partial matches end of input - isStreamFinished: false",
        llmOutput: "helloWorld",
        blocks: [block],
        fallbackBlock: fallbackBlock,
        isStreamFinished: false,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block: fallbackBlock,
            match: {
              outputRaw: "hello",
              visibleText: "hello",
              outputAfterLookback:
                "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:false",
              startIndex: 0,
              endIndex: 5,
            },
            priority: 1,
          },
          {
            block,
            match: {
              outputRaw: "World",
              visibleText: "World",
              outputAfterLookback:
                "World isComplete:false visibleTextLengthTarget:95 isStreamFinished:false",
              startIndex: 5,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const partialBlock = partialMatchesString("World");
      const completeBlock = completeMatchesString("hello");
      return {
        name: "partial match after complete matches",
        llmOutput: "helloWorld",
        blocks: [partialBlock, completeBlock],
        fallbackBlock: fallbackBlock,
        isStreamFinished: false,
        visibleTextLengthTarget: 100,
        expected: [
          {
            block: completeBlock,
            match: {
              outputRaw: "hello",
              visibleText: "hello",
              outputAfterLookback:
                "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:false",
              startIndex: 0,
              endIndex: 5,
            },
            priority: 1,
          },
          {
            block: partialBlock,
            match: {
              outputRaw: "World",
              visibleText: "World",
              outputAfterLookback:
                "World isComplete:false visibleTextLengthTarget:95 isStreamFinished:false",
              startIndex: 5,
              endIndex: 10,
            },
            priority: 0,
          },
        ],
      };
    },
  ];

  testCases.forEach((testCase) => {
    if (typeof testCase === "function") {
      testCase = testCase();
    }
    const {
      name,
      llmOutput,
      blocks,
      fallbackBlock,
      isStreamFinished,
      visibleTextLengthTarget,
      expected,
    } = testCase;
    test(name, () => {
      const matches = matchBlocks({
        isStreamFinished,
        visibleTextLengthTarget,
        llmOutput,
        blocks,
        fallbackBlock,
      });
      expect(matches).toEqual(expected);
    });
  });
});
