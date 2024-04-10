import { LLMOutputBlock } from "llm-ui/components";
import { SetOptional } from "type-fest";
import { codeBlockLookBack } from "../lookBack";
import { codeBlockCompleteMatcher, codeBlockPartialMatcher } from "../matchers";
import { CodeBlockOptions, getOptions } from "../options";
import { ShikiProps, buildShikiCodeBlockComponent } from "../shikiComponent";

export const allShikiDefaultProps = {
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

export const buildShikiBlock = (
  userShikiProps: SetOptional<ShikiProps, "codeToHtmlProps">,
  userOptions?: Partial<CodeBlockOptions>,
): LLMOutputBlock => {
  const shikiProps: ShikiProps = {
    ...allShikiDefaultProps,
    ...userShikiProps,
  };
  const options = getOptions(userOptions);
  return {
    isCompleteMatch: codeBlockCompleteMatcher(options),
    isPartialMatch: codeBlockPartialMatcher(options),
    component: buildShikiCodeBlockComponent(shikiProps),
    lookBack: codeBlockLookBack(options),
  };
};
