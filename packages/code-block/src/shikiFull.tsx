import { defaultOptions } from "./defaultShikiOptions";
import {
  matchCompleteMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "./matchers";
import {
  ShikiCodeBlockComponent,
  ShikiCodeBlockProps,
  ShikiCompleteCodeBlock,
  ShikiPartialCodeBlock,
} from "./shikiComponent";

const shikiProps: ShikiCodeBlockProps = {
  highlighterOptions: defaultOptions,
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

const ShikiCompleteComponent: ShikiCodeBlockComponent = (props) => {
  return <ShikiCompleteCodeBlock {...shikiProps} {...props} />;
};

const ShikiPartialComponent: ShikiCodeBlockComponent = (props) => {
  return <ShikiPartialCodeBlock {...shikiProps} {...props} />;
};

export const shikiFull = {
  isFullMatch: matchCompleteMarkdownCodeBlock(),
  isPartialMatch: matchPartialMarkdownCodeBlock(),
  component: ShikiCompleteComponent,
  partialComponent: ShikiPartialComponent,
};
