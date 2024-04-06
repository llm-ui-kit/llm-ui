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
  component: component1,
  isFullMatch: noMatch,
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
    match: target,
  };
};

const fullMatchComponent = (
  component: LLMOutputReactComponent,
  target: string,
): LLMOutputComponent => {
  return {
    component,
    isFullMatch: (output) => matchString(output, target),
    isPartialMatch: noMatch,
    partialComponent: component1,
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
      name: "no components is full fallback match",
      llmOutput: "helloWorld",
      components: [],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 0,
        },
      ],
    },
    {
      name: "no matching components is full fallback match",
      llmOutput: "helloWorld",
      components: [neverMatchComponent],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 1,
        },
      ],
    },
    {
      name: "first component full matches whole input",
      llmOutput: "helloWorld",
      components: [
        {
          component: component1,
          isFullMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 0,
        },
      ],
    },
    {
      name: "first component full matches begginning of input",
      llmOutput: "helloWorld world",
      components: [
        {
          component: component1,
          isFullMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: { match: " world", startIndex: 10, endIndex: 16 },
          priority: 1,
        },
      ],
    },
    {
      name: "first component full matches end of input",
      llmOutput: "helloWorld world",
      components: [
        {
          component: component1,
          isFullMatch: (output) => matchString(output, " world"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 1,
        },
        {
          component: component1,
          match: { match: " world", startIndex: 10, endIndex: 16 },
          priority: 0,
        },
      ],
    },
    {
      name: "first component full matches middle of input",
      llmOutput: "helloWorld world",
      components: [
        {
          component: component1,
          isFullMatch: (output) => matchString(output, "oWo"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: { match: "hell", startIndex: 0, endIndex: 4 },
          priority: 1,
        },
        {
          component: component1,
          match: { match: "oWo", startIndex: 4, endIndex: 7 },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: { match: "rld world", startIndex: 7, endIndex: 16 },
          priority: 1,
        },
      ],
    },
    {
      name: "second component full matches begginning of input",
      llmOutput: "helloWorld world",
      components: [
        neverMatchComponent,
        {
          component: component3,
          isFullMatch: (output) => matchString(output, "helloWorld"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component3,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 1,
        },
        {
          component: fallbackComponent,
          match: { match: " world", startIndex: 10, endIndex: 16 },
          priority: 2,
        },
      ],
    },
    {
      name: "first full match takes priority over second identical full match",
      llmOutput: "helloWorld",
      components: [
        {
          component: component1,
          isFullMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
        {
          component: component3,
          isFullMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: { match: "hello", startIndex: 0, endIndex: 5 },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: { match: "World", startIndex: 5, endIndex: 10 },
          priority: 2,
        },
      ],
    },
    {
      name: "first full match takes priority over second overlapping full match",
      llmOutput: "helloWorld",
      components: [
        {
          component: component1,
          isFullMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component2,
        },
        {
          component: component3,
          isFullMatch: (output) => matchString(output, "ell"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component1,
          match: { match: "hello", startIndex: 0, endIndex: 5 },
          priority: 0,
        },
        {
          component: fallbackComponent,
          match: { match: "World", startIndex: 5, endIndex: 10 },
          priority: 2,
        },
      ],
    },
    {
      name: "first component partial matches whole input",
      llmOutput: "helloWorld",
      components: [
        {
          component: component1,
          isFullMatch: noMatch,
          isPartialMatch: (output) => matchString(output, "helloWorld"),
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component2,
          match: { match: "helloWorld", startIndex: 0, endIndex: 10 },
          priority: 0,
        },
      ],
    },
    {
      name: "first component partial matches end of input",
      llmOutput: "helloWorld",
      components: [
        {
          component: component1,
          isFullMatch: noMatch,
          isPartialMatch: (output) => matchString(output, "World"),
          partialComponent: component2,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: fallbackComponent,
          match: { match: "hello", startIndex: 0, endIndex: 5 },
          priority: 1,
        },
        {
          component: component2,
          match: { match: "World", startIndex: 5, endIndex: 10 },
          priority: 0,
        },
      ],
    },
    {
      name: "partial match after full matches",
      llmOutput: "helloWorld",
      components: [
        {
          component: component1,
          isFullMatch: noMatch,
          isPartialMatch: (output) => matchString(output, "World"),
          partialComponent: component2,
        },
        {
          component: component3,
          isFullMatch: (output) => matchString(output, "hello"),
          isPartialMatch: noMatch,
          partialComponent: component4,
        },
      ],
      fallbackComponent,
      expected: [
        {
          component: component3,
          match: { match: "hello", startIndex: 0, endIndex: 5 },
          priority: 1,
        },
        {
          component: component2,
          match: { match: "World", startIndex: 5, endIndex: 10 },
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
