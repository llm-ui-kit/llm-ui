import { SetOptional } from "type-fest";
import { matchCompleteCodeBlock, matchPartialCodeBlock } from "../matchers";
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
    isCompleteMatch: matchCompleteCodeBlock(),
    isPartialMatch: matchPartialCodeBlock(),
    completeComponent: buildShikiCompleteCodeBlock(shikiProps),
    partialComponent: buildShikiPartialCodeBlock(shikiProps),
  };
};
