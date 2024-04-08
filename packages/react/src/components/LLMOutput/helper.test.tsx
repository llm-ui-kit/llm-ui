import { describe, expect, test } from "vitest";
import { matchComponents } from "./helper";
import {
  ComponentMatch,
  LLMOutputComponent,
  LLMOutputReactComponent,
  MaybeLLMOutputMatch,
} from "./types";

const fallbackComponent = () => null;
const component1 = () => <div>1</div>;
const component2 = () => <div>2</div>;
const component3 = () => <div>3</div>;
const component4 = () => <div>4</div>;

const noMatch = () => undefined;

const neverMatchComponent: LLMOutputComponent = {
  completeComponent: component1,
  isCompleteMatch: noMatch,
  isPartialMatch: noMatch,
  partialComponent: component1,
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
    output: target,
    visibleOutput: target,
  };
};

type TestCase = {
  name: string;
  llmOutput: string;
  components: LLMOutputComponent[];
  fallbackComponent: LLMOutputReactComponent;
  expected: ComponentMatch[];
};

describe("matchComponents", () => {
  const testCases: TestCase[] = [
    {
      name: "no components is complete fallback match",
      llmOutput: "helloWorld",
      components: [],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
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
      expected: [
        {
          component: fallbackComponent,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 1,
        },
      ],
    },
    {
      name: "first component complete matches whole input",
      llmOutput: "helloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "first component complete matches input twice",
      llmOutput: "helloWorldhelloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 0,
        },
        {
          component: component1,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 10,
            endIndex: 20,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "first component complete matches input twice with fallback in between",
      llmOutput: "helloWorldfallbackhelloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: {
            output: "fallback",
            visibleOutput: "fallback",
            startIndex: 10,
            endIndex: 18,
          },
          priority: 1,
        },
        {
          component: component1,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 18,
            endIndex: 28,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "first component complete matches begginning of input",
      llmOutput: "helloWorld world",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: {
            output: " world",
            visibleOutput: " world",
            startIndex: 10,
            endIndex: 16,
          },
          priority: 1,
        },
      ],
    },
    {
      name: "first component complete matches end of input",
      llmOutput: "helloWorld world",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, " world"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 1,
        },
        {
          component: component1,
          match: {
            output: " world",
            visibleOutput: " world",
            startIndex: 10,
            endIndex: 16,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "first component complete matches middle of input",
      llmOutput: "helloWorld world",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "oWo"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: {
            output: "hell",
            visibleOutput: "hell",
            startIndex: 0,
            endIndex: 4,
          },
          priority: 1,
        },
        {
          component: component1,
          match: {
            output: "oWo",
            visibleOutput: "oWo",
            startIndex: 4,
            endIndex: 7,
          },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: {
            output: "rld world",
            visibleOutput: "rld world",
            startIndex: 7,
            endIndex: 16,
          },
          priority: 1,
        },
      ],
    },
    {
      name: "second component complete matches begginning of input",
      llmOutput: "helloWorld world",
      components: [
        neverMatchComponent,
        {
          completeComponent: component3,
          isCompleteMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component3,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 1,
        },
        {
          component: fallbackComponent,
          match: {
            output: " world",
            visibleOutput: " world",
            startIndex: 10,
            endIndex: 16,
          },
          priority: 2,
        },
      ],
    },
    {
      name: "first complete match takes priority over second identical complete match",
      llmOutput: "helloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
        {
          completeComponent: component3,
          isCompleteMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: {
            output: "hello",
            visibleOutput: "hello",
            startIndex: 0,
            endIndex: 5,
          },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: {
            output: "World",
            visibleOutput: "World",
            startIndex: 5,
            endIndex: 10,
          },
          priority: 2,
        },
      ],
    },
    {
      name: "first complete match takes priority over second overlapping complete match",
      llmOutput: "helloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
        {
          completeComponent: component3,
          isCompleteMatch: (output) => matchString(output, "ell"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: {
            output: "hello",
            visibleOutput: "hello",
            startIndex: 0,
            endIndex: 5,
          },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: {
            output: "World",
            visibleOutput: "World",
            startIndex: 5,
            endIndex: 10,
          },
          priority: 2,
        },
      ],
    },
    {
      name: "first component partial matches whole input",
      llmOutput: "helloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: noMatch,
          isPartialMatch: (output) => matchString(output, "helloWorld"),
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component2,
          match: {
            output: "helloWorld",
            visibleOutput: "helloWorld",
            startIndex: 0,
            endIndex: 10,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "first component partial matches end of input",
      llmOutput: "helloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: noMatch,
          isPartialMatch: (output) => matchString(output, "World"),
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: {
            output: "hello",
            visibleOutput: "hello",
            startIndex: 0,
            endIndex: 5,
          },
          priority: 1,
        },
        {
          component: component2,
          match: {
            output: "World",
            visibleOutput: "World",
            startIndex: 5,
            endIndex: 10,
          },
          priority: 0,
        },
      ],
    },
    {
      name: "partial match after complete matches",
      llmOutput: "helloWorld",
      components: [
        {
          completeComponent: component1,
          isCompleteMatch: noMatch,
          isPartialMatch: (output) => matchString(output, "World"),
          partialComponent: component2,
        },
        {
          completeComponent: component3,
          isCompleteMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component3,
          match: {
            output: "hello",
            visibleOutput: "hello",
            startIndex: 0,
            endIndex: 5,
          },
          priority: 1,
        },
        {
          component: component2,
          match: {
            output: "World",
            visibleOutput: "World",
            startIndex: 5,
            endIndex: 10,
          },
          priority: 0,
        },
      ],
    },
  ];

  testCases.forEach(
    ({ name, llmOutput, components, fallbackComponent, expected }) => {
      test(name, () => {
        const matches = matchComponents(
          llmOutput,
          components,
          fallbackComponent,
        );
        expect(matches).toEqual(expected);
      });
    },
  );
});
