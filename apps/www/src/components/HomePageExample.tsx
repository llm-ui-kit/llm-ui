import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { shikiFull } from "@llm-ui/code-block/shikiFull";
import { MarkdownComponent } from "@llm-ui/markdown";
import { LLMOutput, type LLMOutputReactComponent } from "llm-ui/components";
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

// todo: full overloaded
const ShikiFull: ShikiCodeBlockComponent = (props) => (
  <shikiFull.component className="py-4" {...props} />
);

const ShikiPartial: ShikiCodeBlockComponent = (props) => (
  <shikiFull.partialComponent className="py-4" {...props} />
);

const exampleShikiFull = {
  ...shikiFull,
  component: ShikiFull,
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
