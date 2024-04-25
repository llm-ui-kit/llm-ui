import { List, Paragraph, Parent, Root, RootContent, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfm } from "micromark-extension-gfm";

export const ZERO_WIDTH_SPACE = "\u200b";

// enclosing symbols: _a_ __a__ *a* **a** ~a~ ~~a~~
// _'s behave differently to * and ~.
const ENCLOSING_START_REGEX = /(\*{1,3}|(^|\s|\n)_{1,3}|~{1,3})(\S|$)/;

// Matches:
// [
// [a
// [ab]
// [ab](
// [abc](ht
// [abc](https://
// [abc](https://a.com
// [abc](https://a.com)
const LINK_REGEX = /(\[$|\[[^\]]+$|\[[^\]]+\]$|\[[^\]]+\]\(.*$)/;

const isEmptyList = (list: List): boolean => {
  return (
    list.children.length === 1 &&
    list.children[0].type === "listItem" &&
    list.children[0].children.length === 0
  );
};

const isListCharacterLength = (list: List, length: number): boolean => {
  return Boolean(
    list.position &&
      list.position.start.line === list.position.end.line &&
      list.position.end.column &&
      list.position.start.column &&
      list.position.end.column - list.position.start.column === length,
  );
};

const markdownToAst = (markdown: string): Root => {
  const ast = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  // remarkTrailingWhitespace(ast);
  return ast;
};

const astToMarkdown = (markdownAst: Root): string => {
  return toMarkdown(markdownAst, { extensions: [gfmToMarkdown()] });
};

const afterLastNewline = (markdown: string): string => {
  const lastNewlineIndex = markdown.lastIndexOf("\n");
  return markdown.slice(lastNewlineIndex + 1);
};

const replaceTrailingSpaces = (text: string): string => {
  // return text;
  return text.replace(/\s$/, ` ${ZERO_WIDTH_SPACE}`);
};

const removeRegexesFromParagraph = (
  root: Root,
  paragraph: Paragraph,
  regexes: RegExp[],
) => {
  regexes.forEach((regex) => {
    if (removeRegexFromParagraph(root, paragraph, regex)) {
      return;
    }
  });
};

const removeRegexFromParagraph = (
  root: Root,
  paragraph: Paragraph,
  regex: RegExp,
): boolean => {
  const partialAmbiguousEnclosingSymbolsIndex = paragraph.children.findIndex(
    (child) => {
      return child.type === "text" && regex.test(afterLastNewline(child.value));
    },
  );
  if (partialAmbiguousEnclosingSymbolsIndex !== -1) {
    const match = paragraph.children[
      partialAmbiguousEnclosingSymbolsIndex
    ] as Text;
    const matchText = match.value;
    const matchIndex = regex.exec(matchText)!.index;

    if (matchIndex > 0) {
      paragraph.children[partialAmbiguousEnclosingSymbolsIndex] = {
        type: "text",
        value: matchText.slice(0, matchIndex),
      };
      paragraph.children.splice(partialAmbiguousEnclosingSymbolsIndex + 1); // keep the updated text node, remove the rest
    } else {
      paragraph.children.splice(partialAmbiguousEnclosingSymbolsIndex); // delete the text node and the rest
    }
    // remove the 'lastChild' if it no longer has any children
    if (paragraph.children.length === 0) {
      root.children.splice(-1);
    }
  }
  return partialAmbiguousEnclosingSymbolsIndex !== -1;
};

// mutates the ast
const removePartialAmbiguousMarkdownFromAst = (root: Root): void => {
  if (root.children.length === 0) {
    return;
  }
  const lastChild = root.children[root.children.length - 1];
  if (lastChild.type === "paragraph") {
    removeRegexesFromParagraph(root, lastChild, [
      ENCLOSING_START_REGEX,
      LINK_REGEX,
    ]);
  } else if (
    // if there is an empty list item at the end, remove it
    lastChild.type === "list" &&
    isEmptyList(lastChild) &&
    isListCharacterLength(lastChild, 1) // '*' is deleted, '* ' is not deleted.
  ) {
    root.children.splice(-1);
  } else if (lastChild.type === "thematicBreak") {
    root.children.splice(-1);
  }
};

export const removePartialAmbiguousMarkdown = (markdown: string): string => {
  const markdownAst = markdownToAst(markdown);
  removePartialAmbiguousMarkdownFromAst(markdownAst);
  return astToMarkdown(markdownAst);
};

type WithChildren<T> = T extends Parent ? T : never;

type RootContentWithChildren = WithChildren<RootContent> | Root;

const THEMATIC_BREAK_VISIBLE = "_";
const LIST_ITEM_VISIBLE = "*";

const markdownAstToVisibleTextHelper = (
  markdownAst: RootContentWithChildren,
): string => {
  return markdownAst.children
    .map((child) => {
      if (child.type === "text") {
        return child.value;
      }
      if (child.type === "thematicBreak") {
        return THEMATIC_BREAK_VISIBLE;
      }
      if (child.type === "heading") {
        return markdownAstToVisibleTextHelper(child);
      }

      if (child.type === "paragraph") {
        return markdownAstToVisibleTextHelper(child);
      }

      if (child.type === "listItem") {
        return LIST_ITEM_VISIBLE + markdownAstToVisibleTextHelper(child);
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
  return markdownAstToVisibleTextHelper(markdownAst).replaceAll(
    ZERO_WIDTH_SPACE,
    "",
  );
};

export const markdownToVisibleText = (
  markdown: string,
  isFinished: boolean,
): string => {
  const markdownAst = markdownToAst(markdown);
  return markdownAstToVisibleText(markdownAst, isFinished);
};

const removeVisibleCharsFromAstHelper = (
  node: RootContent | Root,
  visibleCharsToRemove: number,
): { charsRemoved: number; toDelete: boolean } => {
  if (node.type === "text") {
    if (node.value.length <= visibleCharsToRemove) {
      return { charsRemoved: node.value.length, toDelete: true };
    } else {
      node.value = replaceTrailingSpaces(
        node.value.slice(0, -1 * visibleCharsToRemove),
      );
      return { charsRemoved: visibleCharsToRemove, toDelete: false };
    }
  }
  if (node.type === "thematicBreak") {
    return { charsRemoved: THEMATIC_BREAK_VISIBLE.length, toDelete: true };
  }

  let removedCharsCount = 0;
  if ("children" in node) {
    // traverse children right to left
    let index = node.children.length - 1;
    while (index >= 0 && removedCharsCount < visibleCharsToRemove) {
      const child = node.children[index];

      const { charsRemoved, toDelete } = removeVisibleCharsFromAstHelper(
        child,
        visibleCharsToRemove - removedCharsCount,
      );
      removedCharsCount += charsRemoved;
      if (toDelete) {
        node.children.splice(index, 1); // delete the child
      }
      index--;
    }

    if (node.type === "listItem") {
      const shouldDeleteListItem =
        node.children.length === 0 &&
        visibleCharsToRemove - removedCharsCount > 0;
      return {
        charsRemoved:
          removedCharsCount +
          (shouldDeleteListItem ? LIST_ITEM_VISIBLE.length : 0),
        toDelete: shouldDeleteListItem,
      };
    }

    return {
      charsRemoved: removedCharsCount,
      toDelete: node.children.length === 0,
    };
  }

  return { charsRemoved: 0, toDelete: false };
};

const removeVisibleCharsFromAst = (
  node: Root,
  visibleCharsToRemove: number,
): void => {
  const { toDelete } = removeVisibleCharsFromAstHelper(
    node,
    visibleCharsToRemove,
  );

  if (toDelete) {
    node.children = [];
  }
};

export const markdownWithVisibleChars = (
  markdown: string,
  visibleChars: number,
  isFinished: boolean,
): string => {
  const markdownAst = markdownToAst(markdown);
  if (!isFinished) {
    removePartialAmbiguousMarkdownFromAst(markdownAst);
  }
  const visibleText = markdownAstToVisibleText(markdownAst, isFinished);

  const charsToRemove = visibleText.length - visibleChars;
  removeVisibleCharsFromAst(markdownAst, charsToRemove);
  return astToMarkdown(markdownAst);
};
