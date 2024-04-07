import { LLMOutputComponent } from "llm-ui/components";
import {
  matchCompleteMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "../matchers";
import {
  ShikiProps,
  buildShikiCompleteCodeBlock,
  buildShikiPartialCodeBlock,
} from "../shikiComponent";
import { allHighlighterOptions } from "./allShikiOptions";

export const allShikiDefaultProps: ShikiProps = {
  highlighterOptions: allHighlighterOptions,
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

export const buildShikiComponent = (userShikiProps: Partial<ShikiProps>) => {
  const shikiProps: ShikiProps = {
    ...allShikiDefaultProps,
    ...userShikiProps,
  };
  return {
    isCompleteMatch: matchCompleteMarkdownCodeBlock(),
    isPartialMatch: matchPartialMarkdownCodeBlock(),
    completeComponent: buildShikiCompleteCodeBlock(shikiProps),
    partialComponent: buildShikiPartialCodeBlock(shikiProps),
  };
};

export const shikiGithubComponent: LLMOutputComponent = buildShikiComponent({});
