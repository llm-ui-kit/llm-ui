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
  console.log({ lastCharsUnmatched });
  if (lastCharsUnmatched) {
    return removePartialAmbiguousEnclosingSymbols(
      markdown.slice(0, -1 * lastCharsUnmatched.length),
    );
  }
  if (ENCLOSING_STARTED_END_MATCH.test(markdown)) {
    const { before, after } = splitStringByLastEnclosingSymbol(markdown);
    console.log({ before, after });
    return `${before}${after.replace(ENCLOSING_STARTED_END_MATCH, "")}`;
  }
  return markdown;
};

export const removePartialAmbiguousMarkdown = (markdown: string): string => {
  const lines = markdown.split("\n");
  const beginningLines = lines.slice(0, -1);
  const lastLine = lines[lines.length - 1];
  const newLines = [
    ...beginningLines,
    removePartialAmbiguousEnclosingSymbols(lastLine),
  ];
  console.log("lines", { lines, beginningLines, lastLine, newLines });
  return newLines.join("\n");
};

export const markdownToVisibleText = (
  markdown: string,
  isFinished: boolean,
): string => {
  markdown = isFinished ? markdown : removePartialAmbiguousMarkdown(markdown);
  return markdown
    .replace(ENCLOSING_MATCH, "$2")
    .replace(ENCLOSING_MATCH, "$2") // handles: _*a*_
    .replace(ENCLOSING_MATCH, "$2"); // again for good luck
};

// This function operates on a complete markdown string
export const markdownRemoveChars = (
  markdown: string,
  maxCharsToRemove: number,
): string => {
  const enclosingMatches = Array.from(markdown.matchAll(ENCLOSING_MATCH));

  if (enclosingMatches && enclosingMatches.length > 0) {
    const lastMatch = enclosingMatches[enclosingMatches.length - 1];
    const lastMatchStartIndex = lastMatch.index!;
    const lastMatchEndIndex = lastMatchStartIndex + lastMatch[0].length;
    const isEndOfString = lastMatchEndIndex === markdown.length;
    if (isEndOfString) {
      const before = markdown.slice(0, lastMatchStartIndex);
      const after = markdown
        .slice(lastMatchStartIndex)
        .replace(ENCLOSING_MATCH_END, (_match, enclosingOpen, content) => {
          if (content.length > maxCharsToRemove) {
            return `${enclosingOpen}${content.slice(0, -1 * maxCharsToRemove)}${enclosingOpen}`;
          }
          return ``;
        });
      return `${before}${after}`;
    }
  }
  return markdown.slice(0, -1);
};

export const markdownWithVisibleChars = (
  markdown: string,
  visibleChars: number,
  isFinished: boolean,
): string => {
  markdown = isFinished ? markdown : removePartialAmbiguousMarkdown(markdown);
  let charsToRemove =
    markdownToVisibleText(markdown, isFinished).length - visibleChars;
  let prevMarkdown;
  while (charsToRemove > 0 && prevMarkdown != markdown) {
    prevMarkdown = markdown;
    markdown = markdownRemoveChars(markdown, charsToRemove);
    charsToRemove =
      markdownToVisibleText(markdown, isFinished).length - visibleChars;
  }
  if (prevMarkdown === markdown) {
    console.error("markdownWithVisibleChars: infinite loop detected");
  }
  return markdown;
};
