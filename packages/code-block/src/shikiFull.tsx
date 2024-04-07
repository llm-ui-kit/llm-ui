import { defaultOptions } from "./defaultShikiOptions";
import {
  matchFullMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "./matchers";
import {
  ShikiCodeBlockComponent,
  ShikiCodeBlockProps,
  ShikiFullCodeBlock,
  ShikiPartialCodeBlock,
} from "./shikiComponent";

const shikiProps: ShikiCodeBlockProps = {
  highlighterOptions: defaultOptions,
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

const ShikiFullComponent: ShikiCodeBlockComponent = (props) => {
  return <ShikiFullCodeBlock {...shikiProps} {...props} />;
};

const ShikiPartialComponent: ShikiCodeBlockComponent = (props) => {
  return <ShikiPartialCodeBlock {...shikiProps} {...props} />;
};

export const shikiFull = {
  isFullMatch: matchFullMarkdownCodeBlock(),
  isPartialMatch: matchPartialMarkdownCodeBlock(),
  component: ShikiFullComponent,
  partialComponent: ShikiPartialComponent,
};
