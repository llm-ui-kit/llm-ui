import { describe, expect, it } from "vitest";
import {
  ZERO_WIDTH_SPACE,
  markdownToVisibleText,
  markdownWithVisibleChars,
  removePartialAmbiguousMarkdown,
} from "./markdownParser";

// test markdown rendering / edge cases with https://dillinger.io/

describe("removePartialAmbiguousMarkdown", () => {
  const testCases: {
    markdown: string;
    expected: string;
  }[] = [
    { markdown: "hello", expected: "hello\n" },
    { markdown: "hello world", expected: "hello world\n" },
    { markdown: "*abc*", expected: "*abc*\n" },
    { markdown: "**abc*", expected: "" },
    { markdown: "*a*", expected: "*a*\n" },
    { markdown: "*a", expected: "" },
    { markdown: "a*", expected: "a\n" },
    { markdown: "def*a", expected: "def\n" },
    { markdown: "*_abc_*", expected: "**abc**\n" },
    { markdown: "* abc", expected: "* abc\n" }, // bullet point
    { markdown: "*abc*def", expected: "*abc*def\n" },
    { markdown: "*abc*def*", expected: "*abc*def\n" },
    { markdown: "*abc*def*abc*", expected: "*abc*def*abc*\n" },
    { markdown: "*abc*def*abc*a", expected: "*abc*def*abc*a\n" },
    { markdown: "*abc*def*abc*abc*", expected: "*abc*def*abc*abc\n" },
    { markdown: "*abc", expected: "" },
    { markdown: "*", expected: "" },
    { markdown: "*hello* *abc", expected: "*hello*&#x20;\n" },
    { markdown: "abc\n*", expected: "abc\n" },
    { markdown: "abc\n", expected: "abc\n" },
    // spaces inside
    { markdown: "*b a c*", expected: "*b a c*\n" },
    // weird incorrect syntax (*a should be * a)

    { markdown: "*abc\n", expected: "" },
    { markdown: "*abc\n\n", expected: "" },
    { markdown: "*abc\n\ndef", expected: "\\*abc\n\ndef\n" },
    { markdown: "*abc\ndef", expected: "\\*abc\ndef\n" },
    { markdown: "*abc\ndef*", expected: "*abc\ndef*\n" },
    { markdown: "*abc\n**def*", expected: "" },
    { markdown: "abc\n*abc", expected: "abc\n" },
    { markdown: "abc\n*abc*abc", expected: "abc\n*abc*abc\n" },
    { markdown: "abc\n*abc*abc*", expected: "abc\n*abc*abc\n" },
    { markdown: "**abc**", expected: "**abc**\n" },
    { markdown: "**abc**def", expected: "**abc**def\n" }, //working up to here
    { markdown: "**abc**def**", expected: "**abc**def\n" },
    { markdown: "**abc**def**abc**", expected: "**abc**def**abc**\n" },
    { markdown: "**abc**def**abc**a", expected: "**abc**def**abc**a\n" },
    { markdown: "**abc**def**abc**abc**", expected: "**abc**def**abc**abc\n" },
    { markdown: "**abc", expected: "" },
    { markdown: "**", expected: "" },
    { markdown: "**hello** **abc", expected: "**hello**&#x20;\n" },
    { markdown: "abc\n**", expected: "abc\n" },
    { markdown: "abc\n**abc", expected: "abc\n" },
    { markdown: "abc\n**abc**abc", expected: "abc\n**abc**abc\n" },
    { markdown: "abc\n**abc**abc**", expected: "abc\n**abc**abc\n" },
    { markdown: "_abc_", expected: "*abc*\n" },
    { markdown: "_abc_ def", expected: "*abc* def\n" },
    { markdown: "_abc_def_", expected: "*abc\\_def*\n" },
    { markdown: "_abc_ def_", expected: "*abc* def\\_\n" },
    { markdown: "_abc_def_abc_", expected: "*abc\\_def\\_abc*\n" },
    { markdown: "_abc_ def _abc_", expected: "*abc* def *abc*\n" },
    { markdown: "_abc_ def _abc_ abc_", expected: "*abc* def *abc* abc\\_\n" },
    { markdown: "_abc", expected: "" },
    { markdown: "_", expected: "" },
    { markdown: "_hello_ _abc", expected: "*hello*\n" },
    { markdown: "abc\n_", expected: "abc\n" },
    { markdown: "abc\n_abc", expected: "abc\n" },
    { markdown: "abc\n_abc_abc", expected: "abc\n" }, // _ edge case
    { markdown: "abc\n_abc_abc_", expected: "abc\n*abc\\_abc*\n" },
    { markdown: "___abc___", expected: "***abc***\n" },
    { markdown: "___abc___def", expected: "" }, // _ edge case
    { markdown: "___abc___ def___", expected: "***abc*** def\\_\\_\\_\n" },
    {
      markdown: "___abc___ def ___abc___",
      expected: "***abc*** def ***abc***\n",
    },
    {
      markdown: "___abc___ def ___abc___ a",
      expected: "***abc*** def ***abc*** a\n",
    },
    {
      markdown: "___abc___ def ___abc___ abc___",
      expected: "***abc*** def ***abc*** abc\\_\\_\\_\n",
    },
    { markdown: "___abc", expected: "" },

    { markdown: "___hello___ ___abc", expected: "***hello***\n" },
    { markdown: "abc\n___abc", expected: "abc\n" },
    { markdown: "abc\n___abc___ abc", expected: "abc\n***abc*** abc\n" },
    {
      markdown: "abc\n___abc___abc___",
      expected: "abc\n***abc\\_\\_\\_abc***\n", // this is how mdast works
    },
    { markdown: "abc\n***abc***abc***", expected: "abc\n***abc***abc\n" },
    { markdown: "*__abc__**", expected: "***abc***\n" },
    { markdown: "*__abc__**abc*", expected: "***abc**\\*\\*abc*\n" },
    { markdown: "*__abc__* *abc*", expected: "***abc*** *abc*\n" },
    {
      markdown: "*nested **important** text*\n",
      expected: "*nested **important** text*\n",
    },
    {
      markdown: "*nested **impor",
      expected: "",
    },
    {
      markdown:
        "# heading\n\n*abc*\n*nested [abc](https://something.com) **impor",
      expected: "# heading\n\n*abc*\n",
    },
    {
      markdown:
        "# heading\n\n*abc*\n*nested [abc](https://something.com) **impor** something*",
      expected:
        "# heading\n\n*abc*\n*nested [abc](https://something.com) **impor** something*\n",
    },

    // thematic breaks
    { markdown: "___", expected: "" },
    { markdown: "___\na", expected: "***\n\na\n" },
    { markdown: "***", expected: "" },
    { markdown: "***\nabc", expected: "***\n\nabc\n" },
    { markdown: "abc\n___", expected: "abc\n" },
    { markdown: "abc\n***", expected: "abc\n" },

    // headers
    // headers are not ambiguous, so we don't need to remove them
    { markdown: "#", expected: "#\n" },
    { markdown: "# ", expected: "#\n" },
    { markdown: "# a", expected: "# a\n" },

    { markdown: "##", expected: "##\n" },
    { markdown: "## ", expected: "##\n" },
    { markdown: "## a", expected: "## a\n" },

    { markdown: "###", expected: "###\n" },
    { markdown: "### ", expected: "###\n" },
    { markdown: "### a", expected: "### a\n" },

    { markdown: "####", expected: "####\n" },
    { markdown: "#### ", expected: "####\n" },
    { markdown: "#### a", expected: "#### a\n" },

    { markdown: "#####", expected: "#####\n" },
    { markdown: "##### ", expected: "#####\n" },
    { markdown: "##### a", expected: "##### a\n" },

    { markdown: "######", expected: "######\n" },
    { markdown: "###### ", expected: "######\n" },
    { markdown: "###### a", expected: "###### a\n" },

    // list items
    { markdown: "* abc", expected: "* abc\n" },
    { markdown: "* abc\n  * def", expected: "* abc\n  * def\n" },
    { markdown: "*", expected: "" },
    { markdown: "* ", expected: "*\n" },
    { markdown: "* def ", expected: "* def\n" },
    { markdown: "* **abc**", expected: "* **abc**\n" },
    { markdown: "* abc def", expected: "* abc def\n" }, // spaces

    // numbered list items
    { markdown: "1. abc", expected: "1. abc\n" },
    { markdown: "1. abc\n2. def", expected: "1. abc\n2. def\n" },
    { markdown: "1.", expected: "1.\n" },
    { markdown: "2. ", expected: "2.\n" },
    { markdown: "1. **abc**", expected: "1. **abc**\n" },

    // links
    { markdown: "[", expected: "" },
    { markdown: "[a", expected: "" },
    { markdown: "[ab]", expected: "" },
    { markdown: "[ab](", expected: "" },
    { markdown: "[ab](h", expected: "" },
    { markdown: "[abc](ht", expected: "" },
    { markdown: "[abc](https://", expected: "" },
    { markdown: "[abc](https://a.com", expected: "" },
    { markdown: "abc[abc](https://a.com", expected: "abc\n" },
    { markdown: "abc [abc](https://a.com", expected: "abc&#x20;\n" },
    {
      markdown: "[abc](https://a.com)",
      expected: "[abc](https://a.com)\n",
    },

    // inline code blocks
    { markdown: "`", expected: "\\`\n" },
    { markdown: "`a", expected: "\\`a\n" },
    { markdown: "`a`", expected: "`a`\n" },
  ];

  testCases.forEach(({ markdown, expected }) => {
    it(`should convert "${markdown}" to "${expected}"`, () => {
      expect(removePartialAmbiguousMarkdown(markdown)).toBe(expected);
    });
  });
});
// we need some ~ examples above ^^^

describe("markdownToVisibleText", () => {
  const testCases: {
    input: string;
    isFinished: boolean;
    expected: string;
  }[] = [
    { input: "hello", isFinished: false, expected: "hello" },
    { input: "~hello~", isFinished: false, expected: "hello" }, // needs gfm
    { input: "_a_", isFinished: false, expected: "a" },
    { input: "hello *world*", isFinished: false, expected: "hello world" },
    {
      input: "hello *world* *world*",
      isFinished: false,
      expected: "hello world world",
    },
    {
      input: "hello _*world*_ *world*",
      isFinished: false,
      expected: "hello world world",
    },
    {
      input: "hello *world* **world**",
      isFinished: false,
      expected: "hello world world",
    },
    {
      input: "~~hello~~ *world* **world**",
      isFinished: false,
      expected: "hello world world",
    },
    {
      input: "~~hello~~ *world* **world***",
      isFinished: false,
      expected: "hello world world",
    },
    // spaces inside
    { input: "*b a c*", isFinished: false, expected: "b a c" },
    // we insert zero width spaces into emphasis to preserve trailing whitespace, but zero width spaces should not be in visible text
    {
      input: `*b a c ${ZERO_WIDTH_SPACE}*`,
      isFinished: false,
      expected: "b a c ",
    },
    {
      input: `*b a c  ${ZERO_WIDTH_SPACE}*`,
      isFinished: false,
      expected: "b a c  ",
    },
    {
      input: `*b a c  ${ZERO_WIDTH_SPACE}*`,
      isFinished: false,
      expected: "b a c  ",
    },
    // spaces inside
    { input: "**b a c**", isFinished: false, expected: "b a c" },
    // we insert zero width spaces into emphasis to preserve trailing whitespace, but zero width spaces should not be in visible text
    {
      input: `**b a c ${ZERO_WIDTH_SPACE}**`,
      isFinished: false,
      expected: "b a c ",
    },
    {
      input: `**b a c  ${ZERO_WIDTH_SPACE}**`,
      isFinished: false,
      expected: "b a c  ",
    },

    // spaces inside
    { input: "***b a c***", isFinished: false, expected: "b a c" },
    // we insert zero width spaces into emphasis to preserve trailing whitespace, but zero width spaces should not be in visible text
    {
      input: `***b a c ${ZERO_WIDTH_SPACE}***`,
      isFinished: false,
      expected: "b a c ",
    },
    {
      input: `***b a c  ${ZERO_WIDTH_SPACE}***`,
      isFinished: false,
      expected: "b a c  ",
    },

    // spaces inside
    { input: "~b a c~", isFinished: false, expected: "b a c" },
    // we insert zero width spaces into emphasis to preserve trailing whitespace, but zero width spaces should not be in visible text
    {
      input: `~b a c ${ZERO_WIDTH_SPACE}~`,
      isFinished: false,
      expected: "b a c ",
    },
    {
      input: `~b a c  ${ZERO_WIDTH_SPACE}~`,
      isFinished: false,
      expected: "b a c  ",
    },

    // ambiguous so we don't show it yet.
    { input: "*", isFinished: false, expected: "" },
    { input: "abc\n*", isFinished: false, expected: "abc" },
    { input: "*abc", isFinished: false, expected: "" },
    { input: "__abc", isFinished: false, expected: "" },
    { input: "~~~abc", isFinished: false, expected: "" },
    // weird incorrect syntax (*a should be * a)
    { input: "*abc\n", isFinished: false, expected: "" },
    { input: "*abc\ndef", isFinished: false, expected: "*abcdef" },
    { input: "*abc\ndef*", isFinished: false, expected: "abcdef" },
    { input: "*abc\n**def*", isFinished: false, expected: "" }, // broken
    // ambiguous, but isFinished true so we don't hide things
    { input: "*", isFinished: true, expected: "*" },
    { input: "*abc", isFinished: true, expected: "*abc" },
    { input: "*abc\n", isFinished: true, expected: "*abc" },
    { input: "*abc\ndef", isFinished: true, expected: "*abcdef" },
    { input: "*abc\n**def**", isFinished: true, expected: "*abcdef" },
    { input: "*abc\ndef*", isFinished: true, expected: "abcdef" }, // weird syntax edge case
    { input: "*abc* *def*", isFinished: true, expected: "abc def" },

    // thematic breaks
    { input: "___", isFinished: false, expected: "" },
    { input: "___", isFinished: true, expected: "_" },
    { input: "___\nabc", isFinished: true, expected: "_abc" },
    { input: "___\nabc", isFinished: false, expected: "_abc" },
    { input: "***", isFinished: false, expected: "" },
    { input: "***", isFinished: true, expected: "_" },
    { input: "***\nabc", isFinished: true, expected: "_abc" },
    { input: "***\nabc", isFinished: false, expected: "_abc" },
    { input: "a\n***", isFinished: false, expected: "a" },
    { input: "a\n***", isFinished: true, expected: "a_" },
    { input: "a\n___", isFinished: false, expected: "a" },
    { input: "a\n___", isFinished: true, expected: "a_" },

    // headers
    { input: "#", isFinished: false, expected: "" },
    { input: "# ", isFinished: false, expected: "" },
    { input: "# a", isFinished: false, expected: "a" },
    { input: "# a\nabc", isFinished: false, expected: "aabc" },
    { input: "abc\n# a", isFinished: false, expected: "abca" },

    { input: "##", isFinished: false, expected: "" },
    { input: "## ", isFinished: false, expected: "" },
    { input: "## a", isFinished: false, expected: "a" },

    { input: "###", isFinished: false, expected: "" },
    { input: "### ", isFinished: false, expected: "" },
    { input: "### a", isFinished: false, expected: "a" },

    { input: "####", isFinished: false, expected: "" },
    { input: "#### ", isFinished: false, expected: "" },
    { input: "#### a", isFinished: false, expected: "a" },

    { input: "#####", isFinished: false, expected: "" },
    { input: "##### ", isFinished: false, expected: "" },
    { input: "##### a", isFinished: false, expected: "a" },

    { input: "######", isFinished: false, expected: "" },
    { input: "###### ", isFinished: false, expected: "" },
    { input: "###### a", isFinished: false, expected: "a" },

    // paragraphs

    { input: "abc\n", isFinished: false, expected: "abc" },
    { input: "abc\ndef", isFinished: false, expected: "abcdef" }, // mdast seems to see this as a single paragraph in the ast
    { input: "abc\n\ndef", isFinished: false, expected: "abcdef" },

    // list items
    { input: "* abc", isFinished: false, expected: "*abc" }, // since "* " is rendered as a bullet point, but "*" isn't, so it's 1 char
    { input: "*", isFinished: true, expected: "*" },
    { input: "*", isFinished: false, expected: "" },
    { input: "* ", isFinished: false, expected: "*" },
    { input: "* ", isFinished: true, expected: "*" },
    {
      input: "* abc\n  * def",
      isFinished: false,
      expected: "*abc*def",
    },
    { input: "* **abc**", isFinished: false, expected: "*abc" }, // since "* " is rendered as a bullet point, but "*" isn't, so it's 1 char
    { input: "* xyz ", isFinished: false, expected: "*xyz" },
    { input: "* abc def", isFinished: false, expected: "*abc def" }, // space

    // numbered list items
    { input: "1. abc", isFinished: false, expected: "*abc" },
    { input: "1.", isFinished: true, expected: "*" },
    { input: "1. ", isFinished: false, expected: "*" },
    { input: "1. ", isFinished: true, expected: "*" },
    {
      input: "2. abc\n3. def",
      isFinished: false,
      expected: "*abc*def",
    },
    { input: "1. **abc**", isFinished: false, expected: "*abc" },

    // links
    { input: "[", isFinished: false, expected: "" },
    { input: "[a", isFinished: false, expected: "" },
    { input: "[ab]", isFinished: false, expected: "" },
    { input: "[ab](", isFinished: false, expected: "" },
    { input: "[ab](h", isFinished: false, expected: "" },
    { input: "[abc](ht", isFinished: false, expected: "" },
    { input: "[abc](https://", isFinished: false, expected: "" },
    { input: "[abc](https://a.com", isFinished: false, expected: "" },
    {
      input: "[abc](https://a.com)",
      isFinished: false,
      expected: "abc",
    },
    {
      input: "def [abc](https://a.com)",
      isFinished: false,
      expected: "def abc",
    },
    {
      input: "def [abc](https://a.com) ghi",
      isFinished: false,
      expected: "def abc ghi",
    },

    // inline code blocks
    { input: "`abc`", isFinished: true, expected: "abc" },
    { input: "a `abc` b", isFinished: false, expected: "a abc b" },
  ];
  testCases.forEach(({ input, isFinished, expected }) => {
    it(`should convert "${input}" isFinished:${isFinished} to "${expected}"`, () => {
      expect(markdownToVisibleText(input, isFinished)).toBe(expected);
    });
  });
});

describe("markdownWithVisibleChars", () => {
  const testCases: {
    markdown: string;
    visibleChars: number;
    isFinished: boolean;
    expected: string;
  }[] = [
    {
      markdown: "hello",
      visibleChars: 4,
      isFinished: false,
      expected: "hell\n",
    },
    { markdown: "hello", visibleChars: 2, isFinished: false, expected: "he\n" },
    {
      markdown: "hello",
      visibleChars: 5,
      isFinished: false,
      expected: "hello\n",
    },
    {
      markdown: "hello",
      visibleChars: 6,
      isFinished: false,
      expected: "hello\n",
    },
    {
      markdown: "hello ",
      visibleChars: 5,
      isFinished: false,
      expected: "hello\n",
    },
    {
      markdown: "hello ",
      visibleChars: 6,
      isFinished: false,
      expected: "hello\n",
    },
    {
      markdown: "*abc*",
      visibleChars: 3,
      isFinished: false,
      expected: "*abc*\n",
    },
    {
      markdown: "*abc*",
      visibleChars: 2,
      isFinished: false,
      expected: "*ab*\n",
    },
    {
      markdown: "*abc*",
      visibleChars: 1,
      isFinished: false,
      expected: "*a*\n",
    },
    { markdown: "*abc*", visibleChars: 0, isFinished: false, expected: "" },
    {
      markdown: "*abc* ",
      visibleChars: 3,
      isFinished: false,
      expected: "*abc*\n",
    },
    {
      markdown: "_abc_ ",
      visibleChars: 3,
      isFinished: false,
      expected: "*abc*\n",
    },
    {
      markdown: "*a*",
      visibleChars: 1,
      isFinished: false,
      expected: "*a*\n",
    },
    {
      markdown: "*a*",
      visibleChars: 0,
      isFinished: false,
      expected: "",
    },
    {
      markdown: "*abc* *def*",
      visibleChars: 7,
      isFinished: false,
      expected: "*abc* *def*\n",
    },
    {
      markdown: "*abc* *def*",
      visibleChars: 6,
      isFinished: false,
      expected: "*abc* *de*\n",
    },
    {
      markdown: "*abc* *def*",
      visibleChars: 5,
      isFinished: false,
      expected: "*abc* *d*\n",
    },
    {
      markdown: "*abc* *def*",
      visibleChars: 4,
      isFinished: false,
      expected: "*abc*&#x20;\n",
    },
    {
      markdown: "**tyr def**",
      visibleChars: 4,
      isFinished: false,
      expected: `**tyr ${ZERO_WIDTH_SPACE}**\n`,
    },
    {
      markdown: "~str def~",
      visibleChars: 4,
      isFinished: false,
      expected: `~~str ${ZERO_WIDTH_SPACE}~~\n`,
    },
    {
      markdown: "*abc  def*",
      visibleChars: 3,
      isFinished: false,
      expected: "*abc*\n",
    },
    {
      markdown: "*abc  def*",
      visibleChars: 4,
      isFinished: false,
      expected: `*abc ${ZERO_WIDTH_SPACE}*\n`,
    },
    {
      markdown: "*abc  def*",
      visibleChars: 5,
      isFinished: false,
      expected: `*abc  ${ZERO_WIDTH_SPACE}*\n`,
    },
    {
      markdown: "*abc* *def*",
      visibleChars: 2,
      isFinished: false,
      expected: "*ab*\n",
    },
    {
      markdown: "*",
      visibleChars: 2,
      isFinished: false,
      expected: "",
    },

    // thematic breaks
    { markdown: "___", visibleChars: 10, isFinished: false, expected: "" },
    { markdown: "___", visibleChars: 10, isFinished: true, expected: "***\n" },
    { markdown: "___", visibleChars: 2, isFinished: true, expected: "***\n" },
    { markdown: "___", visibleChars: 1, isFinished: true, expected: "***\n" },
    {
      markdown: "___\nabc",
      visibleChars: 10,
      isFinished: true,
      expected: "***\n\nabc\n",
    },
    {
      markdown: "___\nabc",
      visibleChars: 10,
      isFinished: false,
      expected: "***\n\nabc\n",
    },
    { markdown: "***", visibleChars: 10, isFinished: false, expected: "" },
    { markdown: "***", visibleChars: 10, isFinished: true, expected: "***\n" },
    {
      markdown: "***\nabc",
      visibleChars: 2,
      isFinished: true,
      expected: "***\n\na\n",
    },
    {
      markdown: "***\nabc",
      visibleChars: 1,
      isFinished: false,
      expected: "***\n",
    },
    { markdown: "a\n***", visibleChars: 1, isFinished: false, expected: "a\n" },
    {
      markdown: "a\n***",
      visibleChars: 2,
      isFinished: true,
      expected: "a\n\n***\n",
    },
    {
      markdown: "a\n___",
      visibleChars: 1,
      isFinished: false,
      expected: "a\n",
    },
    {
      markdown: "a\n___",
      visibleChars: 1,
      isFinished: true,
      expected: "a\n",
    },

    // Headers
    { markdown: "#", isFinished: false, visibleChars: 1, expected: "#\n" },
    { markdown: "# ", isFinished: false, visibleChars: 1, expected: "#\n" },
    { markdown: "# a", isFinished: false, visibleChars: 1, expected: "# a\n" },
    {
      markdown: "# a\nabc",
      isFinished: false,
      visibleChars: 1,
      expected: "# a\n",
    },
    {
      markdown: "# a\nabc",
      isFinished: false,
      visibleChars: 2,
      expected: "# a\n\na\n",
    },
    {
      markdown: "# a\nabc",
      isFinished: false,
      visibleChars: 4,
      expected: "# a\n\nabc\n",
    },
    {
      markdown: "# a\nabc",
      isFinished: false,
      visibleChars: 5,
      expected: "# a\n\nabc\n",
    },
    {
      markdown: "abcd\n#",
      isFinished: false,
      visibleChars: 4,
      expected: "abcd\n\n#\n",
    },
    {
      markdown: "abcd\n# header1",
      isFinished: false,
      visibleChars: 6,
      expected: "abcd\n\n# he\n",
    },
    {
      markdown: "abcd\n# header1\nsomething",
      isFinished: false,
      visibleChars: 6,
      expected: "abcd\n\n# he\n",
    },
    {
      markdown: "abcd\n# header1\nsomething",
      isFinished: false,
      visibleChars: 21,
      expected: "abcd\n\n# header1\n\nsomething\n",
    },

    // list items
    {
      markdown: "* abc",
      isFinished: false,
      visibleChars: 4,
      expected: "* abc\n",
    },
    {
      markdown: "* abc",
      isFinished: false,
      visibleChars: 3,
      expected: "* ab\n",
    },
    {
      markdown: "* abc",
      isFinished: false,
      visibleChars: 1,
      expected: "*\n",
    },
    {
      markdown: "*",
      isFinished: false,
      visibleChars: 1,
      expected: "",
    },
    {
      markdown: "* ",
      isFinished: false,
      visibleChars: 1,
      expected: "*\n",
    },
    {
      markdown: "* abc\n  * def",
      isFinished: false,
      visibleChars: 6,
      expected: "* abc\n  * d\n",
    },
    {
      markdown: "* **abc**",
      isFinished: false,
      visibleChars: 4,
      expected: "* **abc**\n",
    },
    {
      markdown: "* **abc**",
      isFinished: false,
      visibleChars: 4,
      expected: "* **abc**\n",
    },
    // spaces in bullet
    {
      markdown: "* abc def",
      isFinished: false,
      visibleChars: 4,
      expected: "* abc\n",
    },
    {
      markdown: "* abc def",
      isFinished: false,
      visibleChars: 5,
      expected: `* abc&#x20;\n`,
    },
    {
      markdown: "* abc def",
      isFinished: false,
      visibleChars: 6,
      expected: "* abc d\n",
    },
    {
      markdown: "* abc ",
      isFinished: false,
      visibleChars: 6,
      expected: "* abc\n",
    },

    // links
    { markdown: "[", isFinished: false, visibleChars: 1, expected: "" },
    {
      markdown: "[abc](https://a.com)",
      isFinished: false,
      visibleChars: 1,
      expected: "[a](https://a.com)\n",
    },
    {
      markdown: "[abc](https://a.com)",
      isFinished: false,
      visibleChars: 2,
      expected: "[ab](https://a.com)\n",
    },
    {
      markdown: "[abc](https://a.com)",
      isFinished: false,
      visibleChars: 3,
      expected: "[abc](https://a.com)\n",
    },
    {
      markdown: "def [abc](https://a.com)",
      isFinished: false,
      visibleChars: 4,
      expected: "def&#x20;\n",
    },
    {
      markdown: "def [abc](https://a.com)",
      isFinished: false,
      visibleChars: 5,
      expected: "def [a](https://a.com)\n",
    },

    // inline code blocks
    {
      markdown: "`abc`",
      isFinished: true,
      visibleChars: 3,
      expected: "`abc`\n",
    },
    {
      markdown: "`abc`",
      isFinished: true,
      visibleChars: 2,
      expected: "`ab`\n",
    },

    // trailing newlines
    {
      markdown: "abc\nd",
      isFinished: false,
      visibleChars: 3,
      expected: "abc\n",
    },
    {
      markdown: "abc\nd",
      isFinished: false,
      visibleChars: 4,
      expected: "abc\nd\n",
    },
  ];

  testCases.forEach(({ markdown, visibleChars, isFinished, expected }) => {
    it(`should convert "${markdown}" visibleChars:${visibleChars} isFinished:${isFinished} to "${expected}"`, () => {
      expect(markdownWithVisibleChars(markdown, visibleChars, isFinished)).toBe(
        expected,
      );
    });
  });

  testCases.forEach(({ markdown, visibleChars, isFinished }) => {
    it(`markdownWithVisibleChars & markdownToVisibleText "${markdown}" visibleChars:${visibleChars} isFinished:${isFinished} lengths equal"`, () => {
      const output = markdownWithVisibleChars(
        markdown,
        visibleChars,
        isFinished,
      );
      const originalVisibleText = markdownToVisibleText(markdown, isFinished);
      const visibleText = markdownToVisibleText(output, true); // isFinished true, because ambiguous syntax is already removed by markdownWithVisibleChars
      const expectedVisibleChars = Math.min(
        visibleChars,
        originalVisibleText.length,
      );
      try {
        expect(visibleText.length).toBe(expectedVisibleChars);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        e.message = `${e.message} visibleText: ${visibleText}`;
        throw e;
      }
    });
  });
});
