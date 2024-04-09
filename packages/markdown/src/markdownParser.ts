// enclosing symbols: _a_ __a__ *a* **a** ~a~ ~~a~~

// matches: *abc, _abc, __abc, ~~~abc etc.
const ENCLOSING_STARTED_MATCH = /([\*_~]{1,3})(\S.*?\S)/g;
// matches: *abc$, _abc$, __abc$, ~~~abc$ etc.
const ENCLOSING_STARTED_END_MATCH = /[\*_~]{1,3}(\S.*?\S)$/gm;

// matches: *abc*, __abc__, etc.
const ENCLOSING_MATCH = /([\*_~]{1,3})(\S.*?\S)\1/g;
// matches: *$, _$, __$, ~~~$ (where $ is end of line)
const ENCLOSING_START_END_MATCH = /[\*_~]{1,3}$/;

const enclosingMatchRegex = (repeats: number) =>
  new RegExp(`([\\*_~]{${repeats}})(\\S.*?\\S)\\1`, "g");

const findEnclosingMatches = (markdown: string) => {
  return Array.from(markdown.matchAll(ENCLOSING_MATCH)).map((match) => {
    const startIndex = match.index!;
    const endIndex = startIndex + match[0].length;
    return {
      startIndex,
      endIndex,
      // match: match[0],
      // before: markdown.slice(0, endIndex),
      // after: markdown.slice(endIndex),
    };
  });
};

const splitStringByLastEnclosingSymbol = (markdown: string) => {
  const enclosingMatches = findEnclosingMatches(markdown);
  console.log("boldMatches", enclosingMatches);
  const lastBoldMatch = enclosingMatches[enclosingMatches.length - 1];
  if (lastBoldMatch) {
    const before = markdown.slice(0, lastBoldMatch.endIndex);
    const after = markdown.slice(lastBoldMatch.endIndex);
    return { before, after };
  }
  return { before: "", after: markdown };
};

const lastCharIsUnmatchedStar = (markdown: string) => {
  const { after } = splitStringByLastEnclosingSymbol(markdown);
  console.log("after", after);
  const match = after.match(ENCLOSING_START_END_MATCH);
  return match ? match[0] : undefined;
};

const removePartialAmbiguousEnclosingSymbols = (markdown: string): string => {
  const lastCharsUnmatched = lastCharIsUnmatchedStar(markdown);
  if (lastCharsUnmatched) {
    return markdown.slice(0, -lastCharsUnmatched.length);
  }
  if (ENCLOSING_STARTED_END_MATCH.test(markdown)) {
    const { before, after } = splitStringByLastEnclosingSymbol(markdown);
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
  console.log(`markdown ${markdown}.`, markdown);
  return markdown.replace(ENCLOSING_MATCH, "$2");
};

export const markdownRemoveChars = (
  markdown: string,
  maxCharsToRemove: number,
): string => {
  const boldMatches = Array.from(markdown.matchAll(ENCLOSING_MATCH));

  if (boldMatches && boldMatches.length > 0) {
    // console.log("boldMatches", boldMatches);
    const lastMatch = boldMatches[boldMatches.length - 1];

    const isEndOfString =
      lastMatch.index! + lastMatch[0].length === markdown.length;
    if (isEndOfString) {
      // console.log("lastMatch", lastMatch, lastMatch.index!);
      const before = markdown.slice(0, lastMatch.index!);
      const after = markdown
        .slice(lastMatch.index!)
        .replace(/(\*)(\S.*?\S{0,1})\*$/gm, (_match, p1, p2) => {
          // console.log("match 1", { match, p1, p2, maxCharsToRemove });
          // Check if p2 length is more than 2 to avoid negative substr length
          if (p2.length > maxCharsToRemove) {
            return `${p1}${p2.slice(0, -1 * maxCharsToRemove)}${p1}`; // Return the modified string with the original markers
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
  isEnd: boolean,
): string => {
  let counter = 0;
  markdown = isEnd ? markdown : removePartialAmbiguousMarkdown(markdown);
  let charsToRemove =
    markdownToVisibleText(markdown, isEnd).length - visibleChars;
  // console.log("zzz", { markdown, visibleChars, charsToRemove });
  while (charsToRemove > 0 && counter < 10000) {
    // console.log(`zzz markdown before: "${markdown}"`);
    markdown = markdownRemoveChars(markdown, charsToRemove);
    // console.log(`zzz visible text "${markdownToVisibleText(markdown, isEnd)}"`);
    charsToRemove =
      markdownToVisibleText(markdown, isEnd).length - visibleChars;
    // console.log(`zzz markdown after: "${markdown}"`, charsToRemove);
    counter++;
  }
  if (counter >= 10000) {
    console.error("markdownWithVisibleChars: infinite loop detected");
  }
  return markdown;
};
