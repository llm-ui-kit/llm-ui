import { describe, expect, it } from "vitest";
import { removePartialAmbiguousMarkdown } from "./markdownParser";

// test markdown rendering / edge cases with https://dillinger.io/

describe("removePartialAmbiguousMarkdown", () => {
  const testCases: {
    markdown: string;
    expected: string;
  }[] = [
    // { markdown: "hello", expected: "hello" },
    // { markdown: "*abc*", expected: "*abc*" },
    { markdown: "**abc*", expected: "" },
    // { markdown: "*_abc_*", expected: "*_abc_*" },
    // { markdown: "*abc*def", expected: "*abc*def" },
    // { markdown: "*abc*def*", expected: "*abc*def" },
    // { markdown: "*abc*def*abc*", expected: "*abc*def*abc*" },
    // { markdown: "*abc*def*abc*a", expected: "*abc*def*abc*a" },
    // { markdown: "*abc*def*abc*abc*", expected: "*abc*def*abc*abc" },
    // { markdown: "*abc", expected: "" },
    // { markdown: "*", expected: "" },
    // { markdown: "*hello* *abc", expected: "*hello* " },
    // { markdown: "abc\n*", expected: "abc\n" },
    // { markdown: "abc\n", expected: "abc\n" },
    // { markdown: "*abc\n", expected: "*abc\n" },
    // { markdown: "abc\n*abc", expected: "abc\n" },
    // { markdown: "abc\n*abc*abc", expected: "abc\n*abc*abc" },
    // { markdown: "abc\n*abc*abc*", expected: "abc\n*abc*abc" },
    // { markdown: "**abc**", expected: "**abc**" },
    // { markdown: "**abc**def", expected: "**abc**def" },
    // { markdown: "**abc**def**", expected: "**abc**def" },
    // { markdown: "**abc**def**abc**", expected: "**abc**def**abc**" },
    // { markdown: "**abc**def**abc**a", expected: "**abc**def**abc**a" },
    // { markdown: "**abc**def**abc**abc**", expected: "**abc**def**abc**abc" },
    // { markdown: "**abc", expected: "" },
    // { markdown: "**", expected: "" },
    // { markdown: "**hello** **abc", expected: "**hello** " },
    // { markdown: "abc\n**", expected: "abc\n" },
    // { markdown: "abc\n**abc", expected: "abc\n" },
    // { markdown: "abc\n**abc**abc", expected: "abc\n**abc**abc" },
    // { markdown: "abc\n**abc**abc**", expected: "abc\n**abc**abc" },
    // { markdown: "_abc_", expected: "_abc_" },
    // { markdown: "_abc_def", expected: "_abc_def" },
    // { markdown: "_abc_def_", expected: "_abc_def" },
    // { markdown: "_abc_def_abc_", expected: "_abc_def_abc_" },
    // { markdown: "_abc_def_abc_a", expected: "_abc_def_abc_a" },
    // { markdown: "_abc_def_abc_abc_", expected: "_abc_def_abc_abc" },
    // { markdown: "_abc", expected: "" },
    // { markdown: "_", expected: "" },
    // { markdown: "_hello_ _abc", expected: "_hello_ " },
    // { markdown: "abc\n_", expected: "abc\n" },
    // { markdown: "abc\n_abc", expected: "abc\n" },
    // { markdown: "abc\n_abc_abc", expected: "abc\n_abc_abc" },
    // { markdown: "abc\n_abc_abc_", expected: "abc\n_abc_abc" },
    // { markdown: "___abc___", expected: "___abc___" },
    // { markdown: "___abc___def", expected: "___abc___def" },
    // { markdown: "___abc___def___", expected: "___abc___def" },
    // { markdown: "___abc___def___abc___", expected: "___abc___def___abc___" },
    // { markdown: "___abc___def___abc___a", expected: "___abc___def___abc___a" },
    // {
    //   markdown: "___abc___def___abc___abc___",
    //   expected: "___abc___def___abc___abc",
    // },
    // { markdown: "___abc", expected: "" },
    // { markdown: "___", expected: "" },
    // { markdown: "___hello___ ___abc", expected: "___hello___ " },
    // { markdown: "abc\n___", expected: "abc\n" },
    // { markdown: "abc\n___abc", expected: "abc\n" },
    // { markdown: "abc\n___abc___abc", expected: "abc\n___abc___abc" },
    // { markdown: "abc\n___abc___abc___", expected: "abc\n___abc___abc" },
    // { markdown: "abc\n***abc***abc***", expected: "abc\n***abc***abc" },
    // { markdown: "*__abc__**", expected: "*__abc__*" },
    // { markdown: "*__abc__**abc*", expected: "*__abc__**abc*" },
    // { markdown: "*__abc__* *abc*", expected: "*__abc__* *abc*" },
  ];

  testCases.forEach(({ markdown, expected }) => {
    it(`should convert "${markdown}" to "${expected}"`, () => {
      expect(removePartialAmbiguousMarkdown(markdown)).toBe(expected);
    });
  });
});

describe("markdownToVisibleText", () => {
  const testCases: {
    input: string;
    isFinished: boolean;
    expected: string;
  }[] = [
    { input: "hello", isFinished: false, expected: "hello" },
    { input: "hello *world*", isFinished: false, expected: "hello world" },
    {
      input: "hello *world* *world*",
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

    // // ambiguous so we don't show it yet.
    { input: "*", isFinished: false, expected: "" },
    { input: "abc\n*", isFinished: false, expected: "abc\n" },
    { input: "*abc", isFinished: false, expected: "" },
    { input: "__abc", isFinished: false, expected: "" },
    { input: "~~~abc", isFinished: false, expected: "" },
    { input: "*abc\n", isFinished: false, expected: "*abc\n" },
    { input: "*abc\ndef", isFinished: false, expected: "*abc\ndef" },
    { input: "*abc\ndef*", isFinished: false, expected: "*abc\ndef" },

    // ambiguous, but isFinished true so we don't hide things
    { input: "*", isFinished: true, expected: "*" },
    { input: "*abc", isFinished: true, expected: "*abc" },
    { input: "*abc\n", isFinished: true, expected: "*abc\n" },
    { input: "*abc\ndef", isFinished: true, expected: "*abc\ndef" },
    { input: "*abc\ndef*", isFinished: true, expected: "*abc\ndef*" },
    { input: "*abc\ndef***", isFinished: true, expected: "*abc\ndef***" },
  ];
  //todo: all test cases isFinished: true
  testCases.forEach(({ input, isFinished, expected }) => {
    // it(`should convert "${input}" isFinished:${isFinished} to "${expected}"`, () => {
    //   expect(markdownToVisibleText(input, isFinished)).toBe(expected);
    // });
  });
});

// describe("markdownRemoveChars", () => {
//   const testCases: {
//     markdown: string;
//     maxCharsToRemove: number;
//     expected: string;
//   }[] = [
//     { markdown: "hello", maxCharsToRemove: 1, expected: "hell" },
//     { markdown: "hello", maxCharsToRemove: 2, expected: "hell" },
//     { markdown: "hello", maxCharsToRemove: 5, expected: "hell" },
//     { markdown: "hello", maxCharsToRemove: 5, expected: "hell" },
//     { markdown: "*abc*", maxCharsToRemove: 1, expected: "*ab*" },
//     { markdown: "*abc*", maxCharsToRemove: 2, expected: "*a*" },
//     { markdown: "*abc*", maxCharsToRemove: 3, expected: "" },
//     { markdown: "*abc*", maxCharsToRemove: 4, expected: "" },
//     { markdown: "*abc* ", maxCharsToRemove: 1, expected: "*abc*" },
//     { markdown: "*abc* ", maxCharsToRemove: 2, expected: "*abc*" },
//     { markdown: "*abc**def*", maxCharsToRemove: 2, expected: "*abc**d*" },
//     { markdown: "*abc**def*", maxCharsToRemove: 3, expected: "*abc*" },
//     { markdown: "*abc**def*", maxCharsToRemove: 4, expected: "*abc*" },
//     { markdown: "*abc* *def*", maxCharsToRemove: 4, expected: "*abc* " },
//   ];

//   testCases.forEach(({ markdown, maxCharsToRemove, expected }) => {
//     it(`should convert "${markdown}" maxCharsToRemove:${maxCharsToRemove} to "${expected}"`, () => {
//       expect(markdownRemoveChars(markdown, maxCharsToRemove)).toBe(expected);
//     });
//   });
// });

// describe("markdownWithVisibleChars", () => {
//   const testCases: {
//     markdown: string;
//     visibleChars: number;
//     isFinished: boolean;
//     expected: string;
//   }[] = [
//     { markdown: "hello", visibleChars: 4, isFinished: false, expected: "hell" },
//     { markdown: "hello", visibleChars: 2, isFinished: false, expected: "he" },
//     {
//       markdown: "hello",
//       visibleChars: 5,
//       isFinished: false,
//       expected: "hello",
//     },
//     {
//       markdown: "hello",
//       visibleChars: 6,
//       isFinished: false,
//       expected: "hello",
//     },
//     {
//       markdown: "hello ",
//       visibleChars: 5,
//       isFinished: false,
//       expected: "hello",
//     },

//     {
//       markdown: "*abc*",
//       visibleChars: 3,
//       isFinished: false,
//       expected: "*abc*",
//     },
//     { markdown: "*abc*", visibleChars: 2, isFinished: false, expected: "*ab*" },
//     { markdown: "*abc*", visibleChars: 1, isFinished: false, expected: "*a*" },
//     { markdown: "*abc*", visibleChars: 0, isFinished: false, expected: "" },

//     {
//       markdown: "*abc* ",
//       visibleChars: 3,
//       isFinished: false,
//       expected: "*abc*",
//     },

//     {
//       markdown: "*abc* *def*",
//       visibleChars: 7,
//       isFinished: false,
//       expected: "*abc* *def*",
//     },
//     {
//       markdown: "*abc* *def*",
//       visibleChars: 6,
//       isFinished: false,
//       expected: "*abc* *de*",
//     },
//     {
//       markdown: "*abc* *def*",
//       visibleChars: 5,
//       isFinished: false,
//       expected: "*abc* *d*",
//     },
//     {
//       markdown: "*abc* *def*",
//       visibleChars: 4,
//       isFinished: false,
//       expected: "*abc* ",
//     },
//     {
//       markdown: "*abc* *def*",
//       visibleChars: 3,
//       isFinished: false,
//       expected: "*abc*",
//     },
//     {
//       markdown: "*abc* *def*",
//       visibleChars: 2,
//       isFinished: false,
//       expected: "*ab*",
//     },
//     {
//       markdown: "*",
//       visibleChars: 2,
//       isFinished: false,
//       expected: "",
//     },
//   ]; //todo: add isFinished: true test cases

//   testCases.forEach(({ markdown, visibleChars, isFinished, expected }) => {
//     it(`should convert "${markdown}" visibleChars:${visibleChars} isFinished:${isFinished} to "${expected}"`, () => {
//       expect(markdownWithVisibleChars(markdown, visibleChars, isFinished)).toBe(
//         expected,
//       );
//     });
//   });
// });
