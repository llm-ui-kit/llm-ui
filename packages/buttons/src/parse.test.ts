import { describe, expect, it } from "vitest";
import { Buttons, parseCompleteButtons } from "./parse";

type TestCase = {
  name: string;
  buttonsBlock: string;
  expected: Buttons;
};

describe("parseCompleteButtons", () => {
  const testCases: TestCase[] = [
    {
      name: "empty string",
      buttonsBlock: "",
      expected: undefined,
    },
    {
      name: "invalid xml",
      buttonsBlock: "<buttons></buttons>",
      expected: undefined,
    },
    {
      name: "single button",
      buttonsBlock: "<buttons><button>hello</button></buttons>",
      expected: ["hello"],
    },
    {
      name: "single button whitespace",
      buttonsBlock: "<buttons>\n  <button>hello</button>\n\n\n</buttons>",
      expected: ["hello"],
    },
    {
      name: "multiple buttons",
      buttonsBlock:
        "<buttons><button>hello</button><button>world</button></buttons>",
      expected: ["hello", "world"],
    },
    {
      name: "multiple buttons whitespace",
      buttonsBlock:
        "<buttons>\n\n<button>hello</button>\n\n\n<button>world</button>\n\n</buttons>",
      expected: ["hello", "world"],
    },
    {
      name: "empty button",
      buttonsBlock: "<buttons><button></button></buttons>",
      expected: undefined,
    },
    {
      name: "empty button and text",
      buttonsBlock: "<buttons><button></button>hello</buttons>",
      expected: undefined,
    },
    {
      name: "empty button and text 2",
      buttonsBlock: "<buttons>hello<button></button></buttons>",
      expected: undefined,
    },
  ];

  testCases.forEach(({ name, buttonsBlock, expected }) => {
    it(name, () => {
      const result = parseCompleteButtons(buttonsBlock);
      expect(result).toEqual(expected);
    });
  });
});
