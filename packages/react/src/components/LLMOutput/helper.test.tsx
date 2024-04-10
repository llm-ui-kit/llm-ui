import { describe, expect, test } from "vitest";
import { fallbackComponent, returnParamsLookBack } from "../../test/utils";
import { ComponentMatch, matchComponents } from "./helper";
import {
  LLMOutputComponent,
  LLMOutputFallbackComponent,
  MaybeLLMOutputMatch,
} from "./types";

const component1 = () => <div>1</div>;
const component2 = () => <div>2</div>;

const noMatch = () => undefined;

const neverMatchComponent: LLMOutputComponent = {
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
): LLMOutputComponent => ({
  component: component1,
  isCompleteMatch: (output) => matchString(output, target),
  isPartialMatch: noMatch,
  lookBack: lookBack,
});

const partialMatchesString = (
  target: string,
  lookBack = returnParamsLookBack,
): LLMOutputComponent => ({
  component: component2,
  isCompleteMatch: noMatch,
  isPartialMatch: (output) => matchString(output, target),
  lookBack: lookBack,
});

type TestCase = {
  name: string;
  llmOutput: string;
  components: LLMOutputComponent[];
  fallbackComponent: LLMOutputFallbackComponent;
  isStreamFinished: boolean;
  visibleTextLengthTarget: number;
  expected: ComponentMatch[];
};

describe("matchComponents", () => {
  const testCases: (TestCase | (() => TestCase))[] = [
    {
      name: "no components is complete fallback match",
      llmOutput: "helloWorld",
      components: [],
      fallbackComponent,
      isStreamFinished: true,
      visibleTextLengthTarget: 100,
      expected: [
        {
          component: fallbackComponent,
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
      name: "no matching components is complete fallback match",
      llmOutput: "helloWorld",
      components: [neverMatchComponent],
      fallbackComponent,
      isStreamFinished: true,
      visibleTextLengthTarget: 100,
      expected: [
        {
          component: fallbackComponent,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "first component complete matches whole input",
        llmOutput: "helloWorld",
        components: [component],
        isStreamFinished: true,
        visibleTextLengthTarget: 99,
        fallbackComponent,
        expected: [
          {
            component: component,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "first component complete matches whole input - short visibleTarget",
        llmOutput: "helloWorld",
        components: [component],
        isStreamFinished: true,
        visibleTextLengthTarget: 3,
        fallbackComponent,
        expected: [
          {
            component: component,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "first component complete matches input twice - but short visibleTarget",
        llmOutput: "helloWorldhelloWorld",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 3,
        expected: [
          {
            component: component,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "first component complete matches input twice",
        llmOutput: "helloWorldhelloWorld",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component,
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
            component: component,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "first component complete matches input twice with fallback in between",
        llmOutput: "helloWorldfallbackhelloWorld",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component,
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
            component: fallbackComponent,
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
            component: component,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "first component complete matches beginning of input",
        llmOutput: "helloWorld world",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component,
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
            component: fallbackComponent,
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
      const component = completeMatchesString(" world");
      return {
        name: "first component complete matches end of input",
        llmOutput: "helloWorld world",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: fallbackComponent,
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
            component: component,
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
      const component = completeMatchesString(" world");
      return {
        name: "first component complete matches end of input - short visibleTarget",
        llmOutput: "helloWorld world",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 3,
        expected: [
          {
            component: fallbackComponent,
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
      const component = completeMatchesString("oWo");
      return {
        name: "first component complete matches middle of input",
        llmOutput: "helloWorld world",
        components: [component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: fallbackComponent,
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
            component: component,
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
            component: fallbackComponent,
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
      const component = completeMatchesString("helloWorld");
      return {
        name: "second component complete matches begginning of input",
        llmOutput: "helloWorld world",
        components: [neverMatchComponent, component],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component,
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
            component: fallbackComponent,
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
      const component1 = completeMatchesString("hello");
      const component2 = completeMatchesString("hello");
      return {
        name: "first complete match takes priority over second identical complete match",
        llmOutput: "helloWorld",
        components: [component1, component2],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component1,
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
            component: fallbackComponent,
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
      const component1 = completeMatchesString("hello");
      const component2 = completeMatchesString("ell");
      return {
        name: "first complete match takes priority over second overlapping complete match",
        llmOutput: "helloWorld",
        components: [component1, component2],
        fallbackComponent,
        isStreamFinished: true,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component1,
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
            component: fallbackComponent,
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
      const component = partialMatchesString("helloWorld");
      return {
        name: "first component partial matches whole input - isStreamFinished: false",
        llmOutput: "helloWorld",
        components: [component],
        fallbackComponent,
        isStreamFinished: false,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: component,
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
      const component = partialMatchesString("helloWorld");
      return {
        name: "first component partial matches whole input - short visibleTarget, isStreamFinished: false",
        llmOutput: "helloWorld",
        components: [component],
        fallbackComponent,
        isStreamFinished: false,
        visibleTextLengthTarget: 3,
        expected: [
          {
            component: component,
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
      const component = partialMatchesString("World");
      return {
        name: "first component partial matches end of input - isStreamFinished: false",
        llmOutput: "helloWorld",
        components: [component],
        fallbackComponent,
        isStreamFinished: false,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: fallbackComponent,
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
            component: component,
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
      const partialComponent = partialMatchesString("World");
      const completeComponent = completeMatchesString("hello");
      return {
        name: "partial match after complete matches",
        llmOutput: "helloWorld",
        components: [partialComponent, completeComponent],
        fallbackComponent,
        isStreamFinished: false,
        visibleTextLengthTarget: 100,
        expected: [
          {
            component: completeComponent,
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
            component: partialComponent,
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
      components,
      fallbackComponent,
      isStreamFinished,
      visibleTextLengthTarget,
      expected,
    } = testCase;
    test(name, () => {
      const matches = matchComponents({
        isStreamFinished,
        visibleTextLengthTarget,
        llmOutput,
        components,
        fallbackComponent,
      });
      expect(matches).toEqual(expected);
    });
  });
});
