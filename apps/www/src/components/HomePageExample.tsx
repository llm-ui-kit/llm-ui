import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { shikiFull } from "@llm-ui/code-block/shikiFull";
import { MarkdownComponent } from "@llm-ui/markdown";
import {
  LLMOutput,
  type LLMOutputComponent,
  type LLMOutputReactComponent,
} from "llm-ui/components";
import type { ShikiCodeBlockComponent } from "node_modules/@llm-ui/code-block/src/shikiComponent";

const example = `
# llm-ui

> Markdown support

Links: [llm-ui.com](https://llm-ui.com), ~strikethrough~, *italic*, **bold**

#### Code block
\`\`\`typescript
import { LLMOutput } from "llm-ui/components";

console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
\`\`\`
`;

const Markdown: LLMOutputReactComponent = ({ llmOutput }) => {
  return (
    <MarkdownComponent
      llmOutput={llmOutput}
      className={"prose dark:prose-invert"}
    />
  );
};

const ShikiComplete: ShikiCodeBlockComponent = (props) => (
  <shikiFull.completeComponent className="py-4" {...props} />
);

const ShikiPartial: ShikiCodeBlockComponent = (props) => (
  <shikiFull.partialComponent className="py-4" {...props} />
);

const exampleShikiFull: LLMOutputComponent = {
  ...shikiFull,
  completeComponent: ShikiComplete,
  partialComponent: ShikiPartial,
};

export const HomePageExample = () => {
  const { output } = useStreamFastSmooth(example, {
    loop: false,
    autoStart: true,
    loopDelayMs: 3000,
  });

  return (
    <LLMOutput
      components={[exampleShikiFull]}
      fallbackComponent={Markdown}
      llmOutput={output}
    />
  );
};
