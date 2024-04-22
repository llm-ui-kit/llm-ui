import { Parent, Root, RootContent, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfm } from "micromark-extension-gfm";
// enclosing symbols: _a_ __a__ *a* **a** ~a~ ~~a~~

// matches: *abc$, _abc$, __abc$, ~~~abc$ etc.
// \S{0,1} handles single char case e.g. *a*
const ENCLOSING_STARTED_END_MATCH = /[\*_~]{1,3}(\S.*?\S{0,1})$/gm;

// matches: *abc*, __abc__, etc.
const ENCLOSING_MATCH = /([\*_~]{1,3})(\S.*?\S{0,1})\1/g;

// matches: *abc*$, __abc__$, etc. where $ is end of line
const ENCLOSING_MATCH_END = /([\*_~]{1,3})(\S.*?\S{0,1})\1$/g;

// matches: *$, _$, __$, ~~~$ (where $ is end of line)
const ENCLOSING_START_END_MATCH = /[\*_~]{1,3}$/;

// _'s behave differently to * and ~.
const ENCLOSING_START = /(\*{1,3}|(^|\s|\n)_{1,3}|~{1,3})(\S|$)/;

const findLastEnclosingMatchIndex = (markdown: string): number => {
  const start = markdown.match(/([*_~]{1,3})\S{0,1}/);
  if (!start) {
    return 0;
  }
  const startEnclosingString = start[1];
  const startEnclosingEndIndex = start.index! + startEnclosingString.length;
  const rest = markdown.slice(startEnclosingEndIndex);
  const endRegex = new RegExp(`\\S([\\*_~]{${startEnclosingString.length}})`);
  const end = rest.match(endRegex);
  if (!end) {
    return 0;
  }
  const endEnclosingString = end[1];
  const endIndex =
    startEnclosingEndIndex + end.index! + endEnclosingString.length + 1;
  return findLastEnclosingMatchIndex(markdown.slice(endIndex)) + endIndex;
};

const splitStringByLastEnclosingSymbol = (markdown: string) => {
  const lastEnclosingMatchIndex = findLastEnclosingMatchIndex(markdown);
  const before = markdown.slice(0, lastEnclosingMatchIndex);
  const after = markdown.slice(lastEnclosingMatchIndex);
  return { before, after };
};

const lastCharIsUnmatchedStar = (markdown: string) => {
  const { after } = splitStringByLastEnclosingSymbol(markdown);
  const match = after.match(ENCLOSING_START_END_MATCH);
  return match ? match[0] : undefined;
};

const removePartialAmbiguousEnclosingSymbols = (markdown: string): string => {
  const lastCharsUnmatched = lastCharIsUnmatchedStar(markdown);
  if (lastCharsUnmatched) {
    return removePartialAmbiguousEnclosingSymbols(
      markdown.slice(0, -1 * lastCharsUnmatched.length),
    );
  }
  if (ENCLOSING_STARTED_END_MATCH.test(markdown)) {
    const { before, after } = splitStringByLastEnclosingSymbol(markdown);
    return `${before}${after.replace(ENCLOSING_STARTED_END_MATCH, "")}`;
  }
  return markdown;
};

const markdownToAst = (markdown: string): Root => {
  return fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
};

const astToMarkdown = (markdownAst: Root): string => {
  return toMarkdown(markdownAst, { extensions: [gfmToMarkdown()] });
};

const afterLastNewline = (markdown: string): string => {
  const lastNewlineIndex = markdown.lastIndexOf("\n");
  return markdown.slice(lastNewlineIndex + 1);
};

// mutates the ast
const removePartialAmbiguousMarkdownFromAst = (markdownAst: Root): void => {
  if (markdownAst.children.length === 0) {
    return;
  }
  const lastChild = markdownAst.children[markdownAst.children.length - 1];
  // console.log("ast", JSON.stringify(ast, null, 2));
  // console.log("lastChild", JSON.stringify(lastChild, null, 2));

  // todo: not paragraph?
  if (lastChild.type === "paragraph") {
    const partialAmbiguousEnclosingSymbolsIndex = lastChild.children.findIndex(
      (child) => {
        return (
          child.type === "text" &&
          ENCLOSING_START.test(afterLastNewline(child.value))
        );
      },
    );
    console.log(
      "zzz partialAmbiguousEnclosingSymbolsIndex",
      partialAmbiguousEnclosingSymbolsIndex,
    );
    if (partialAmbiguousEnclosingSymbolsIndex !== -1) {
      const match = lastChild.children[
        partialAmbiguousEnclosingSymbolsIndex
      ] as Text;
      const matchText = match.value;
      const matchIndex = ENCLOSING_START.exec(matchText)!.index;
      console.log(
        "matchText",
        matchText,
        matchIndex,
        matchText.slice(0, matchIndex),
      );
      if (matchIndex > 0) {
        lastChild.children[partialAmbiguousEnclosingSymbolsIndex] = {
          type: "text",
          value: matchText.slice(0, matchIndex),
        };
        // console.log("lastChild.children", lastChild.children);
        lastChild.children.splice(partialAmbiguousEnclosingSymbolsIndex + 1);
        // console.log("lastChild.children", lastChild.children);
      } else {
        lastChild.children.splice(partialAmbiguousEnclosingSymbolsIndex);
      }
    }
  } else if (
    // if there is an empty list item at the end, remove it
    lastChild.type === "list" &&
    lastChild.children.length === 1 &&
    lastChild.children[0].type === "listItem" &&
    lastChild.children[0].children.length === 0
  ) {
    markdownAst.children.splice(-1);
  }
};

export const removePartialAmbiguousMarkdown = (markdown: string): string => {
  const markdownAst = markdownToAst(markdown);
  console.log("markdownAst", JSON.stringify(markdownAst, null, 2));
  removePartialAmbiguousMarkdownFromAst(markdownAst);
  console.log("markdownAst", JSON.stringify(markdownAst, null, 2));

  return astToMarkdown(markdownAst);
};
type WithChildren<T> = T extends Parent ? T : never;

type RootContentWithChildren = WithChildren<RootContent> | Root;

const markdownAstToVisibleTextHelper = (
  markdownAst: RootContentWithChildren,
): string => {
  return markdownAst.children
    .map((child) => {
      if (child.type === "text") {
        return child.value;
      }
      if (child.type === "listItem") {
        return "*" + markdownAstToVisibleTextHelper(child);
      }
      if ("children" in child) {
        return markdownAstToVisibleTextHelper(child);
      }
      return "";
    })
    .join("");
};

const markdownAstToVisibleText = (markdownAst: Root, isFinished: boolean) => {
  if (!isFinished) {
    removePartialAmbiguousMarkdownFromAst(markdownAst);
  }

  return markdownAstToVisibleTextHelper(markdownAst);
};

export const markdownToVisibleText = (
  markdown: string,
  isFinished: boolean,
): string => {
  const markdownAst = markdownToAst(markdown);

  return markdownAstToVisibleText(markdownAst, isFinished);
};

const removeVisibleCharsFromAst = (
  markdownAst: RootContent | Root,
  visibleCharsToRemove: number,
): number => {
  console.log("markdownAst", JSON.stringify(markdownAst, null, 2));
  if ("children" in markdownAst) {
    console.log("zzz 1");
    let removedChars = 0;

    for (let index = markdownAst.children.length - 1; index >= 0; index--) {
      console.log("zzz 2", index);

      const child = markdownAst.children[index];
      if (removedChars >= visibleCharsToRemove) {
        break;
      }

      if (child.type === "text") {
        if (child.value.length <= visibleCharsToRemove) {
          markdownAst.children.splice(index, 1); // remove the child
          removedChars += child.value.length;
        } else {
          child.value = child.value.slice(0, -1 * visibleCharsToRemove);
          removedChars += visibleCharsToRemove;
        }
      }
      console.log("markdownAst", JSON.stringify(markdownAst, null, 2));

      removedChars += removeVisibleCharsFromAst(
        child,
        visibleCharsToRemove - removedChars,
      );
      if ("children" in child && child.children.length === 0) {
        markdownAst.children.splice(index, 1);
      }
      console.log("markdownAst", JSON.stringify(markdownAst, null, 2));
    }
    return removedChars;
  }
  return 0;
};

// This function operates on a complete markdown string
export const markdownRemoveChars = (
  markdown: string,
  maxCharsToRemove: number,
): string => {
  const markdownAst = markdownToAst(markdown);
  removeVisibleCharsFromAst(markdownAst, maxCharsToRemove);
  return astToMarkdown(markdownAst);
};

export const markdownWithVisibleChars = (
  markdown: string,
  visibleChars: number,
  isFinished: boolean,
): string => {
  const markdownAst = markdownToAst(markdown);
  removePartialAmbiguousMarkdownFromAst(markdownAst);
  const visibleText = markdownAstToVisibleText(markdownAst, isFinished);

  const charsToRemove = visibleText.length - visibleChars;

  removeVisibleCharsFromAst(markdownAst, charsToRemove);

  return astToMarkdown(markdownAst);
};
