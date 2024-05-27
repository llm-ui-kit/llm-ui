import { describe, expect, test } from "vitest";
import { fallbackBlock, returnParamsLookBack } from "../../test/utils";
import { matchBlocks } from "./helper";
import {
  BlockMatch,
  LLMOutputBlock,
  LLMOutputFallbackBlock,
  MaybeLLMOutputMatch,
} from "./types";

const component1 = () => <div>1</div>;
const component2 = () => <div>2</div>;

const noMatch = () => undefined;

const neverMatchBlock: LLMOutputBlock = {
  component: component1,
  findCompleteMatch: noMatch,
  findPartialMatch: noMatch,
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
  findCompleteMatch: (output) => matchString(output, target),
  findPartialMatch: noMatch,
  lookBack: lookBack,
});

const partialMatchesString = (
  target: string,
  lookBack = returnParamsLookBack,
): LLMOutputBlock => ({
  component: component2,
  findCompleteMatch: noMatch,
  findPartialMatch: (output) => matchString(output, target),
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
          outputRaw: "helloWorld",
          visibleText: "helloWorld",
          isVisible: true,
          output:
            "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
          startIndex: 0,
          endIndex: 10,
          llmOutput: "helloWorld",
          isComplete: true,
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
          outputRaw: "helloWorld",
          visibleText: "helloWorld",
          isVisible: true,
          output:
            "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
          startIndex: 0,
          endIndex: 10,
          priority: 1,
          llmOutput: "helloWorld",
          isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:99 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "hel",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:3 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "hel",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:3 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorldhelloWorld",
            isComplete: true,
          },
          {
            block,
            outputRaw: "helloWorld",
            visibleText: "",
            isVisible: false,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:0 isStreamFinished:true",
            startIndex: 10,
            endIndex: 20,
            priority: 0,
            llmOutput: "helloWorldhelloWorld",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorldhelloWorld",
            isComplete: true,
          },
          {
            block,
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
            startIndex: 10,
            endIndex: 20,
            priority: 0,
            llmOutput: "helloWorldhelloWorld",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorldfallbackhelloWorld",
            isComplete: true,
          },
          {
            block: fallbackBlock,
            outputRaw: "fallback",
            visibleText: "fallback",
            isVisible: true,
            output:
              "fallback isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
            startIndex: 10,
            endIndex: 18,
            priority: 1,
            llmOutput: "helloWorldfallbackhelloWorld",
            isComplete: true,
          },
          {
            block,
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:82 isStreamFinished:true",
            startIndex: 18,
            endIndex: 28,
            priority: 0,
            llmOutput: "helloWorldfallbackhelloWorld",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld world",
            isComplete: true,
          },
          {
            block: fallbackBlock,
            outputRaw: " world",
            visibleText: " world",
            isVisible: true,
            output:
              " world isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
            startIndex: 10,
            endIndex: 16,
            priority: 1,
            llmOutput: "helloWorld world",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 1,
            llmOutput: "helloWorld world",
            isComplete: true,
          },
          {
            block,
            outputRaw: " world",
            visibleText: " world",
            isVisible: true,
            output:
              " world isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
            startIndex: 10,
            endIndex: 16,
            priority: 0,
            llmOutput: "helloWorld world",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "hel",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:3 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 1,
            llmOutput: "helloWorld world",
            isComplete: true,
          },
          {
            block: block,
            outputRaw: " world",
            visibleText: "",
            isVisible: false,
            output:
              " world isComplete:true visibleTextLengthTarget:0 isStreamFinished:true",
            startIndex: 10,
            endIndex: 16,
            priority: 0,
            llmOutput: "helloWorld world",
            isComplete: true,
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
            outputRaw: "hell",
            visibleText: "hell",
            isVisible: true,
            output:
              "hell isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 4,
            priority: 1,
            llmOutput: "helloWorld world",
            isComplete: true,
          },
          {
            block,
            outputRaw: "oWo",
            visibleText: "oWo",
            isVisible: true,
            output:
              "oWo isComplete:true visibleTextLengthTarget:96 isStreamFinished:true",
            startIndex: 4,
            endIndex: 7,
            priority: 0,
            llmOutput: "helloWorld world",
            isComplete: true,
          },
          {
            block: fallbackBlock,
            outputRaw: "rld world",
            visibleText: "rld world",
            isVisible: true,
            output:
              "rld world isComplete:true visibleTextLengthTarget:93 isStreamFinished:true",
            startIndex: 7,
            endIndex: 16,
            priority: 1,
            llmOutput: "helloWorld world",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 10,
            priority: 1,
            llmOutput: "helloWorld world",
            isComplete: true,
          },
          {
            block: fallbackBlock,
            outputRaw: " world",
            visibleText: " world",
            isVisible: true,
            output:
              " world isComplete:true visibleTextLengthTarget:90 isStreamFinished:true",
            startIndex: 10,
            endIndex: 16,
            priority: 2,
            llmOutput: "helloWorld world",
            isComplete: true,
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
            outputRaw: "hello",
            visibleText: "hello",
            isVisible: true,
            output:
              "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 5,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: true,
          },
          {
            block: fallbackBlock,
            outputRaw: "World",
            visibleText: "World",
            isVisible: true,
            output:
              "World isComplete:true visibleTextLengthTarget:95 isStreamFinished:true",
            startIndex: 5,
            endIndex: 10,
            priority: 2,
            llmOutput: "helloWorld",
            isComplete: true,
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
            outputRaw: "hello",
            visibleText: "hello",
            isVisible: true,
            output:
              "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:true",
            startIndex: 0,
            endIndex: 5,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: true,
          },
          {
            block: fallbackBlock,
            outputRaw: "World",
            visibleText: "World",
            isVisible: true,
            output:
              "World isComplete:true visibleTextLengthTarget:95 isStreamFinished:true",
            startIndex: 5,
            endIndex: 10,
            priority: 2,
            llmOutput: "helloWorld",
            isComplete: true,
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
            outputRaw: "helloWorld",
            visibleText: "helloWorld",
            isVisible: true,
            output:
              "helloWorld isComplete:false visibleTextLengthTarget:100 isStreamFinished:false",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: false,
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
            outputRaw: "helloWorld",
            visibleText: "hel",
            isVisible: true,
            output:
              "helloWorld isComplete:false visibleTextLengthTarget:3 isStreamFinished:false",
            startIndex: 0,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: false,
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
            outputRaw: "hello",
            visibleText: "hello",
            isVisible: true,
            output:
              "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:false",
            startIndex: 0,
            endIndex: 5,
            priority: 1,
            llmOutput: "helloWorld",
            isComplete: true,
          },
          {
            block,
            outputRaw: "World",
            visibleText: "World",
            isVisible: true,
            output:
              "World isComplete:false visibleTextLengthTarget:95 isStreamFinished:false",
            startIndex: 5,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: false,
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
            outputRaw: "hello",
            visibleText: "hello",
            isVisible: true,
            output:
              "hello isComplete:true visibleTextLengthTarget:100 isStreamFinished:false",
            startIndex: 0,
            endIndex: 5,
            priority: 1,
            llmOutput: "helloWorld",
            isComplete: true,
          },
          {
            block: partialBlock,
            outputRaw: "World",
            visibleText: "World",
            isVisible: true,
            output:
              "World isComplete:false visibleTextLengthTarget:95 isStreamFinished:false",
            startIndex: 5,
            endIndex: 10,
            priority: 0,
            llmOutput: "helloWorld",
            isComplete: false,
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
