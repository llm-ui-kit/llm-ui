import { SetOptional } from "type-fest";
import {
  matchCompleteMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "../matchers";
import {
  ShikiProps,
  buildShikiCompleteCodeBlock,
  buildShikiPartialCodeBlock,
} from "../shikiComponent";

export const allShikiDefaultProps = {
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

export const buildShikiComponent = (
  userShikiProps: SetOptional<ShikiProps, "codeToHtmlProps">,
) => {
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
