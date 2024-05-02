import { LookBack } from "@llm-ui/react/core";
import { describe, expect, it } from "vitest";
import { buttonsLookBack } from "./lookBack";

type TestCase = {
  name: string;
  buttonsBlock: string;
  visibleTextLengthTarget: number;
  expected: LookBack;
};

describe("buttonsLookBack", () => {
  const testCases: TestCase[] = [
    {
      name: "single button",
      buttonsBlock: "<buttons><button>hello</button></buttons>",
      visibleTextLengthTarget: 5,
      expected: {
        output: "<buttons><button>hello</button></buttons>",
        visibleText: "hello",
      },
    },
    {
      name: "single button target: 3",
      buttonsBlock: "<buttons><button>hello</button></buttons>",
      visibleTextLengthTarget: 3,
      expected: {
        output: "<buttons><button>hel</button></buttons>",
        visibleText: "hel",
      },
    },
    {
      name: "single button target: 1",
      buttonsBlock: "<buttons><button>hello</button></buttons>",
      visibleTextLengthTarget: 1,
      expected: {
        output: "<buttons><button>h</button></buttons>",
        visibleText: "h",
      },
    },
    {
      name: "single button with newlines",
      buttonsBlock: "<buttons>\n  <button>hello</button>\n\n</buttons>",
      visibleTextLengthTarget: 5,
      expected: {
        output: "<buttons><button>hello</button></buttons>",
        visibleText: "hello",
      },
    },
    {
      name: "multiple buttons",
      buttonsBlock:
        "<buttons><button>hello</button><button>world</button></buttons>",
      visibleTextLengthTarget: 10,
      expected: {
        output:
          "<buttons><button>hello</button><button>world</button></buttons>",
        visibleText: "hello world",
      },
    },
    {
      name: "multiple buttons target: 1",
      buttonsBlock:
        "<buttons><button>hello</button><button>world</button></buttons>",
      visibleTextLengthTarget: 1,
      expected: {
        output: "<buttons><button>h</button></buttons>",
        visibleText: "h",
      },
    },
    {
      name: "multiple buttons target: 5",
      buttonsBlock:
        "<buttons><button>hello</button><button>world</button></buttons>",
      visibleTextLengthTarget: 5,
      expected: {
        output: "<buttons><button>hello</button></buttons>",
        visibleText: "hello",
      },
    },
    {
      name: "multiple buttons target: 6",
      buttonsBlock:
        "<buttons><button>hello</button><button>world</button></buttons>",
      visibleTextLengthTarget: 6,
      expected: {
        output: "<buttons><button>hello</button><button>w</button></buttons>",
        visibleText: "hello w",
      },
    },
    {
      name: "multiple buttons with newlines",
      buttonsBlock:
        "<buttons>\n\n<button>hello</button>\n\n<button>world</button>\n\n </buttons>",
      visibleTextLengthTarget: 10,
      expected: {
        output:
          "<buttons><button>hello</button><button>world</button></buttons>",
        visibleText: "hello world",
      },
    },
  ];

  testCases.forEach(
    ({ name, buttonsBlock, visibleTextLengthTarget, expected }) => {
      it(name, () => {
        const result = buttonsLookBack()({
          isComplete: false,
          isStreamFinished: false,
          output: buttonsBlock,
          visibleTextLengthTarget,
        });
        expect(result).toEqual(expected);
      });
    },
  );
});
