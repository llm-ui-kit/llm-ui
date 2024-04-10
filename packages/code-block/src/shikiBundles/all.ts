import { LLMOutputComponent } from "llm-ui/components";
import { SetOptional } from "type-fest";
import { codeBlockLookBack } from "../lookBack";
import { codeBlockCompleteMatcher, codeBlockPartialMatcher } from "../matchers";
import { CodeBlockOptions, getOptions } from "../options";
import { ShikiProps, buildShikiCodeBlock } from "../shikiComponent";

export const allShikiDefaultProps = {
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

export const buildShikiComponent = (
  userShikiProps: SetOptional<ShikiProps, "codeToHtmlProps">,
  userOptions?: Partial<CodeBlockOptions>,
): LLMOutputComponent => {
  const shikiProps: ShikiProps = {
    ...allShikiDefaultProps,
    ...userShikiProps,
  };
  const options = getOptions(userOptions);
  return {
    isCompleteMatch: codeBlockCompleteMatcher(options),
    isPartialMatch: codeBlockPartialMatcher(options),
    component: buildShikiCodeBlock(shikiProps),
    lookBack: codeBlockLookBack(options),
  };
};
