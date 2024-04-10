import { describe, expect, test } from "vitest";
import { ComponentMatch, matchComponents } from "./helper";
import {
  LLMOutputComponent,
  LLMOutputFallbackComponent,
  LookBackFunction,
  MaybeLLMOutputMatch,
} from "./types";

const dummyThottle = async () => ({ visibleTextLengthTarget: 0, skip: false });

const returnParamsLookBack: LookBackFunction = ({
  output,
  isComplete,
  isStreamFinished,
  visibleTextLengthTarget,
}) => ({
  output: `${output} isComplete:${isComplete} visibleTextLengthTarget:${visibleTextLengthTarget === Number.MAX_SAFE_INTEGER ? "inf" : visibleTextLengthTarget} isStreamFinished:${isStreamFinished}`,
  visibleText: output.slice(0, visibleTextLengthTarget),
});

const visibleTextLookBack: LookBackFunction = ({
  output,
  visibleTextLengthTarget,
}) => ({
  output,
  visibleText: "a".repeat(Math.min(visibleTextLengthTarget, 1000)),
});

const fallbackComponent: LLMOutputFallbackComponent = {
  component: () => null,
  lookBack: returnParamsLookBack,
  throttle: dummyThottle,
};

const component1 = () => <div>1</div>;
const component2 = () => <div>2</div>;
const component3 = () => <div>3</div>;
const component4 = () => <div>4</div>;

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
  throttle: dummyThottle,
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
              visibleText: "a".repeat(90),
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
              visibleText: "a".repeat(90),
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
              visibleText: "visibleTextLengthTarget:inf isStreamFinished:true",
              outputAfterLookback: "helloWorld isComplete:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
          {
            component: fallbackComponent,
            match: {
              outputRaw: "fallback",
              visibleText: "visibleTextLengthTarget:100 isStreamFinished:true",
              outputAfterLookback: "fallback isComplete:true",
              startIndex: 10,
              endIndex: 18,
            },
            priority: 1,
          },
          {
            component: component,
            match: {
              outputRaw: "helloWorld",
              visibleText: "visibleTextLengthTarget:inf isStreamFinished:true",
              outputAfterLookback: "helloWorld isComplete:true",
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
              visibleText: "visibleTextLengthTarget:inf isStreamFinished:true",
              outputAfterLookback: "helloWorld isComplete:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 0,
          },
          {
            component: fallbackComponent,
            match: {
              outputRaw: " world",
              visibleText: "visibleTextLengthTarget:100 isStreamFinished:true",
              outputAfterLookback: " world isComplete:true",
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
              visibleText: "visibleTextLengthTarget:100 isStreamFinished:true",
              outputAfterLookback: "helloWorld isComplete:true",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 1,
          },
          {
            component: component,
            match: {
              outputRaw: " world",
              visibleText: "visibleTextLengthTarget:inf isStreamFinished:true",
              outputAfterLookback: " world isComplete:true",
              startIndex: 10,
              endIndex: 16,
            },
            priority: 0,
          },
        ],
      };
    },
    () => {
      const component = completeMatchesString(" world", visibleTextLookBack);
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
              visibleText: "aaa",
              outputAfterLookback: "helloWorld isComplete:false",
              startIndex: 0,
              endIndex: 10,
            },
            priority: 1,
          },
          // {
          //   component: component,
          //   match: {
          //     outputRaw: " world",
          //     visibleText: "visibleTextLengthTarget:inf isStreamFinished:true",
          //     outputAfterLookback: " world isComplete:true",
          //     startIndex: 10,
          //     endIndex: 16,
          //   },
          //   priority: 0,
          // },
        ],
      };
    },
    // {
    //   name: "first component complete matches end of input",
    //   llmOutput: "helloWorld world",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: (output) => matchString(output, " world"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component2,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: "helloWorld",
    //         visibleOutput: "helloWorld",
    //         startIndex: 0,
    //         endIndex: 10,
    //       },
    //       priority: 1,
    //     },
    //     {
    //       component: component1,
    //       match: {
    //         output: " world",
    //         visibleOutput: " world",
    //         startIndex: 10,
    //         endIndex: 16,
    //       },
    //       priority: 0,
    //     },
    //   ],
    // },
    // {
    //   name: "first component complete matches middle of input",
    //   llmOutput: "helloWorld world",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: (output) => matchString(output, "oWo"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component2,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: "hell",
    //         visibleOutput: "hell",
    //         startIndex: 0,
    //         endIndex: 4,
    //       },
    //       priority: 1,
    //     },
    //     {
    //       component: component1,
    //       match: {
    //         output: "oWo",
    //         visibleOutput: "oWo",
    //         startIndex: 4,
    //         endIndex: 7,
    //       },
    //       priority: 0,
    //     },
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: "rld world",
    //         visibleOutput: "rld world",
    //         startIndex: 7,
    //         endIndex: 16,
    //       },
    //       priority: 1,
    //     },
    //   ],
    // },
    // {
    //   name: "second component complete matches begginning of input",
    //   llmOutput: "helloWorld world",
    //   components: [
    //     neverMatchComponent,
    //     {
    //       completeComponent: component3,
    //       isCompleteMatch: (output) => matchString(output, "helloWorld"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component4,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: component3,
    //       match: {
    //         output: "helloWorld",
    //         visibleOutput: "helloWorld",
    //         startIndex: 0,
    //         endIndex: 10,
    //       },
    //       priority: 1,
    //     },
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: " world",
    //         visibleOutput: " world",
    //         startIndex: 10,
    //         endIndex: 16,
    //       },
    //       priority: 2,
    //     },
    //   ],
    // },
    // {
    //   name: "first complete match takes priority over second identical complete match",
    //   llmOutput: "helloWorld",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: (output) => matchString(output, "hello"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component2,
    //     },
    //     {
    //       completeComponent: component3,
    //       isCompleteMatch: (output) => matchString(output, "hello"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component4,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: component1,
    //       match: {
    //         output: "hello",
    //         visibleOutput: "hello",
    //         startIndex: 0,
    //         endIndex: 5,
    //       },
    //       priority: 0,
    //     },
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: "World",
    //         visibleOutput: "World",
    //         startIndex: 5,
    //         endIndex: 10,
    //       },
    //       priority: 2,
    //     },
    //   ],
    // },
    // {
    //   name: "first complete match takes priority over second overlapping complete match",
    //   llmOutput: "helloWorld",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: (output) => matchString(output, "hello"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component2,
    //     },
    //     {
    //       completeComponent: component3,
    //       isCompleteMatch: (output) => matchString(output, "ell"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component4,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: component1,
    //       match: {
    //         output: "hello",
    //         visibleOutput: "hello",
    //         startIndex: 0,
    //         endIndex: 5,
    //       },
    //       priority: 0,
    //     },
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: "World",
    //         visibleOutput: "World",
    //         startIndex: 5,
    //         endIndex: 10,
    //       },
    //       priority: 2,
    //     },
    //   ],
    // },
    // {
    //   name: "first component partial matches whole input",
    //   llmOutput: "helloWorld",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: noMatch,
    //       isPartialMatch: (output) => matchString(output, "helloWorld"),
    //       partialComponent: component2,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: component2,
    //       match: {
    //         output: "helloWorld",
    //         visibleOutput: "helloWorld",
    //         startIndex: 0,
    //         endIndex: 10,
    //       },
    //       priority: 0,
    //     },
    //   ],
    // },
    // {
    //   name: "first component partial matches end of input",
    //   llmOutput: "helloWorld",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: noMatch,
    //       isPartialMatch: (output) => matchString(output, "World"),
    //       partialComponent: component2,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: fallbackComponent,
    //       match: {
    //         output: "hello",
    //         visibleOutput: "hello",
    //         startIndex: 0,
    //         endIndex: 5,
    //       },
    //       priority: 1,
    //     },
    //     {
    //       component: component2,
    //       match: {
    //         output: "World",
    //         visibleOutput: "World",
    //         startIndex: 5,
    //         endIndex: 10,
    //       },
    //       priority: 0,
    //     },
    //   ],
    // },
    // {
    //   name: "partial match after complete matches",
    //   llmOutput: "helloWorld",
    //   components: [
    //     {
    //       completeComponent: component1,
    //       isCompleteMatch: noMatch,
    //       isPartialMatch: (output) => matchString(output, "World"),
    //       partialComponent: component2,
    //     },
    //     {
    //       completeComponent: component3,
    //       isCompleteMatch: (output) => matchString(output, "hello"),
    //       isPartialMatch: noMatch,
    //       partialComponent: component4,
    //     },
    //   ],
    //   fallbackComponent,
    //   expected: [
    //     {
    //       component: component3,
    //       match: {
    //         output: "hello",
    //         visibleOutput: "hello",
    //         startIndex: 0,
    //         endIndex: 5,
    //       },
    //       priority: 1,
    //     },
    //     {
    //       component: component2,
    //       match: {
    //         output: "World",
    //         visibleOutput: "World",
    //         startIndex: 5,
    //         endIndex: 10,
    //       },
    //       priority: 0,
    //     },
    //   ],
    // },
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
