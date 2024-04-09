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

// const findLastEnclosingMatch = (
//   markdown: string,
//   repeatSize = 3,
// ): { startIndex: number; endIndex: number } | undefined => {
//   if (repeatSize <= 0) {
//     return undefined;
//   }
//   console.log("regex", enclosingMatchRegex(repeatSize));
//   const matches = Array.from(
//     markdown.matchAll(enclosingMatchRegex(repeatSize)),
//   ).map((match) => {
//     const startIndex = match.index!;
//     const endIndex = startIndex + match[0].length;
//     return {
//       startIndex,
//       endIndex,
//       // match: match[0],
//       // before: markdown.slice(0, endIndex),
//       // after: markdown.slice(endIndex),
//     };
//   });
//   console.log("matches", matches);
//   const lastMatch = matches[matches.length - 1];
//   const rest = markdown.slice(lastMatch ? lastMatch.endIndex : 0);
//   console.log("zzz", { matches, lastMatch, rest });
//   return findLastEnclosingMatch(rest, repeatSize - 1) ?? lastMatch;
// };

const findLastEnclosingMatchIndex = (markdown: string): number => {
  const start = markdown.match(/([*_~]{1,3})\S/);
  console.log("start", start);
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
  console.log({ endIndex, again: markdown.slice(endIndex) });
  return findLastEnclosingMatchIndex(markdown.slice(endIndex)) + endIndex;
};

// const findLastEnclosingMatch = (
//   markdown: string,
// ): { startIndex: number; endIndex: number } | undefined => {
//   console.log("regex", enclosingMatchRegex(1));
//   const matches = [1, 2, 3]
//     .flatMap((repeat) =>
//       Array.from(markdown.matchAll(enclosingMatchRegex(repeat))),
//     )
//     .map((match) => {
//       const startIndex = match.index!;
//       const endIndex = startIndex + match[0].length;
//       let matchString = match[0];
//       const encloserChar = matchString[0];

//       console.log("match", { match, encloserChar });
//       while (
//         encloserChar[0] === matchString[matchString.length - 1] &&
//         matchString.length > 1
//       ) {
//         matchString = matchString.slice(1, -1);
//       }
//       if (matchString.includes(encloserChar)) {
//         return undefined;
//       }
//       return {
//         startIndex,
//         endIndex,
//         match: match[0],
//         // before: markdown.slice(0, endIndex),
//         // after: markdown.slice(endIndex),
//       };
//     })
//     .filter((m) => m !== undefined) as {
//     startIndex: number;
//     endIndex: number;
//   }[];

//   matches.sort((a, b) => b.endIndex - a.endIndex);
//   console.log("matches", matches);
//   const lastMatch = matches[matches.length - 1];
//   const rest = markdown.slice(lastMatch ? lastMatch.endIndex : 0);
//   console.log("zzz", { matches, lastMatch, rest });
//   return lastMatch;
// };

// const splitStringByLastEnclosingSymbol = (markdown: string) => {
//   const lastEnclosingMatch = findLastEnclosingMatchIndex(markdown);
//   console.log("lastEnclosingMatch", lastEnclosingMatch);
//   if (lastEnclosingMatch) {
//     const before = markdown.slice(0, lastEnclosingMatch.endIndex);
//     const after = markdown.slice(lastEnclosingMatch.endIndex);
//     return { before, after };
//   }
//   return { before: "", after: markdown };
// };

const splitStringByLastEnclosingSymbol = (markdown: string) => {
  const lastEnclosingMatchIndex = findLastEnclosingMatchIndex(markdown);
  const before = markdown.slice(0, lastEnclosingMatchIndex);
  const after = markdown.slice(lastEnclosingMatchIndex);
  console.log({ markdown, before, after });
  return { before, after };
};

const lastCharIsUnmatchedStar = (markdown: string) => {
  const { after } = splitStringByLastEnclosingSymbol(markdown);
  const match = after.match(ENCLOSING_START_END_MATCH);
  console.log({ match, after });
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

// const ENCLOSING_SYMBOLS = ["*", "_", "~"];
// const removePartialAmbiguousEnclosingSymbols1 = (markdown: string): string => {
//   const openingTags = [];

//   for (const char of markdown) {
//     if (ENCLOSING_SYMBOLS.includes(char)) {
//       openingTags.push(char);
//     }
//   }
// };

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
        .replace(
          /([\*_~]{1,3})(\S.*?\S{0,1})\1$/g,
          (_match, enclosingOpen, content) => {
            if (content.length > maxCharsToRemove) {
              return `${enclosingOpen}${content.slice(0, -1 * maxCharsToRemove)}${enclosingOpen}`;
            }
            return ``;
          },
        );
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
  while (charsToRemove > 0 && counter < 10000) {
    markdown = markdownRemoveChars(markdown, charsToRemove);
    charsToRemove =
      markdownToVisibleText(markdown, isEnd).length - visibleChars;
    counter++;
  }
  // switch to 'no change' detection?
  if (counter >= 1000000) {
    console.error("markdownWithVisibleChars: infinite loop detected");
  }
  return markdown;
};
