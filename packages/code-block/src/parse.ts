import { getStartEndGroup } from "./shared";

export type CodeBlock = {
  language: string | undefined;
  metaString: string | undefined;
  code: string | undefined;
};

export type ParseMarkdownCodeBlockOptions = {
  startEndChars: string[];
};

export const defaultOptions: ParseMarkdownCodeBlockOptions = {
  startEndChars: ["```"],
};

const getOptions = (userOptions?: Partial<ParseMarkdownCodeBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};

const parseMarkdownCodeBlock = (
  codeBlock: string,
  startGroup: string,
  endGroup: string,
) => {
  const lines = codeBlock.split("\n");
  let language: string | undefined;
  let metaString: string | undefined;
  let code: string | undefined;
  if (lines.length > 1) {
    lines[0];
    const regex = new RegExp(`${startGroup}([a-zA-Z0-9_-]*) *(.*)`);
    const match = lines[0].match(regex);
    if (match) {
      language = match[2].length > 0 ? match[2] : undefined;
      metaString = match[3].length > 0 ? match[3] : undefined;
    }
  }
  const regex = new RegExp(`${startGroup}.*\n([\\s\\S]*)${endGroup}`);
  const match = codeBlock.match(regex);
  if (match) {
    code = match[2];
  }
  return {
    language,
    metaString,
    code,
  };
};

export type ParseFunction = (
  codeBlock: string,
  options?: ParseMarkdownCodeBlockOptions,
) => CodeBlock;

export const parsePartialMarkdownCodeBlock: ParseFunction = (
  codeBlock,
  userOptions,
) => {
  const options = getOptions(userOptions);
  const startEndGroup = getStartEndGroup(options.startEndChars);
  return parseMarkdownCodeBlock(codeBlock, startEndGroup, "");
};

export const parseFullMarkdownCodeBlock: ParseFunction = (
  codeBlock,
  userOptions,
) => {
  const options = getOptions(userOptions);
  const startEndGroup = getStartEndGroup(options.startEndChars);
  return parseMarkdownCodeBlock(codeBlock, startEndGroup, `\n${startEndGroup}`);
};
