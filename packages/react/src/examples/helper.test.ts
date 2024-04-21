import { omit } from "remeda";
import { afterEach, describe, expect, it } from "vitest";
import { cumulativeProbability, stringToTokenArray } from "./helper";
import { Probability, UseStreamWithProbabilitiesOptions } from "./types";

const withoutProbs = (probs: Probability[]) =>
  probs.map((p: Probability) => omit(p, ["prob"]));

describe("cumulativeProbability", () => {
  const testCases = [
    {
      input: [{ prob: 0.1 }, { prob: 0.2 }, { prob: 0.3 }],
      expected: [{ prob: 0.1 }, { prob: 0.3 }, { prob: 0.6 }],
    },
    {
      input: [
        { prob: 0.1, something: "else" },
        { prob: 0.2, something: "else" },
        { prob: 0.3, something: "else" },
      ],
      expected: [
        { prob: 0.1, something: "else" },
        { prob: 0.3, something: "else" },
        { prob: 0.6, something: "else" },
      ],
    },
    {
      input: [{ prob: 0.1 }, { prob: 0.2 }, { prob: 0.3 }, { prob: 0.4 }],
      expected: [{ prob: 0.1 }, { prob: 0.3 }, { prob: 0.6 }, { prob: 1 }],
    },
  ];
  testCases.forEach(({ input, expected }) => {
    it(`should return ${JSON.stringify(expected)} for ${JSON.stringify(input)}`, () => {
      const result = cumulativeProbability(input);
      for (const [index, { prob }] of result.entries()) {
        expect(prob).closeTo(expected[index].prob, 0.0001);
      }
      expect(withoutProbs(result)).toEqual(withoutProbs(expected));
    });
  });
});

describe("stringToTokenArray", () => {
  const testCases: {
    name: string;
    input: string;
    options: Pick<
      UseStreamWithProbabilitiesOptions,
      "delayMsProbabilities" | "tokenCharsProbabilities"
    >;
    random: number;
    expected: unknown;
  }[] = [
    {
      name: "token chars 1 delay 1",
      input: "hi",
      options: {
        tokenCharsProbabilities: [{ tokenChars: 1, prob: 1 }],
        delayMsProbabilities: [{ delayMs: 10, prob: 1 }],
      },
      random: 0,
      expected: [
        { token: "h", delayMs: 10 },
        { token: "i", delayMs: 10 },
      ],
    },
    {
      name: "token chars 2 delay 1",
      input: "hi",
      options: {
        tokenCharsProbabilities: [{ tokenChars: 2, prob: 1 }],
        delayMsProbabilities: [{ delayMs: 10, prob: 1 }],
      },
      random: 0,
      expected: [{ token: "hi", delayMs: 10 }],
    },
    {
      name: "token chars 2 delay 1",
      input: "hi",
      options: {
        tokenCharsProbabilities: [
          { tokenChars: 1, prob: 0.5 },
          { tokenChars: 2, prob: 0.5 },
        ],
        delayMsProbabilities: [
          { delayMs: 10, prob: 0.5 },
          { delayMs: 20, prob: 0.5 },
        ],
      },
      random: 0.6,
      expected: [{ token: "hi", delayMs: 20 }],
    },
  ];
  const originalRandom = Math.random;
  testCases.forEach(({ name, input, options, random, expected }) => {
    it(name, () => {
      Math.random = () => random;
      const result = stringToTokenArray(
        input,
        options as UseStreamWithProbabilitiesOptions,
      );
      expect(result).toEqual(expected);
    });
  });
  afterEach(() => {
    Math.random = originalRandom;
  });
});
