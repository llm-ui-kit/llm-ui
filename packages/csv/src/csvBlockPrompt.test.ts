import { describe, expect, it } from "vitest";
import { csvBlockPrompt } from "./csvBlockPrompt";

describe("csvBlockPrompt", () => {
  it("simple", () => {
    expect(
      csvBlockPrompt({
        name: "simple",
        options: { type: "buttons" },
        examples: [["abc"]],
      }),
    ).toMatchInlineSnapshot(`
      "You can respond with a simple component using the following , delimited syntax: ⦅buttons,⦆

      Examples: 
      ⦅buttons,abc⦆"
    `);
  });

  it("complex", () => {
    expect(
      csvBlockPrompt({
        name: "complex",
        options: { type: "buttons" },
        examples: [
          ["abc", "def"],
          ["ghi", "jkl"],
        ],
      }),
    ).toMatchInlineSnapshot(`
      "You can respond with a complex component using the following , delimited syntax: ⦅buttons,⦆

      Examples: 
      ⦅buttons,abc,def⦆
      ⦅buttons,ghi,jkl⦆"
    `);
  });

  it("custom delimiter", () => {
    expect(
      csvBlockPrompt({
        name: "complex",
        options: { type: "buttons", delimiter: ";" },
        examples: [
          ["abc", "def"],
          ["ghi", "jkl"],
        ],
      }),
    ).toMatchInlineSnapshot(`
      "You can respond with a complex component using the following ; delimited syntax: ⦅buttons;⦆

      Examples: 
      ⦅buttons;abc;def⦆
      ⦅buttons;ghi;jkl⦆"
    `);
  });
  it("custom start and end chars", () => {
    expect(
      csvBlockPrompt({
        name: "complex",
        options: { type: "type", startChar: "x", endChar: "y" },
        examples: [
          ["abc", "def"],
          ["ghi", "jkl"],
        ],
      }),
    ).toMatchInlineSnapshot(`
      "You can respond with a complex component using the following , delimited syntax: xtype,y

      Examples: 
      xtype,abc,defy
      xtype,ghi,jkly"
    `);
  });
});
