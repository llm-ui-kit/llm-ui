import { markdownComponent, markdownQuickStart } from "./quickStart";

export const markdownGithubExampleUrl =
  "https://github.com/llm-ui-kit/llm-ui/blob/main/examples/nextjs/src/app/examples/markdown/page.tsx";

export const getLlmUiOutputUsage = (step1Replace: string = "") =>
  `const example = \`
## Example

**Hello llm-ui!** this is [markdown](https://markdownguide.org)
\`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [],
    fallbackBlock: {
      component: MarkdownComponent, STEP1
      lookBack: markdownLookBack(),
    },
    isStreamFinished,
  });

  return (
    <div>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example`.replaceAll("STEP1", step1Replace);

const step2Imports = `import {
  useLLMOutput,
} from "@llm-ui/react";
import { markdownLookBack } from "@llm-ui/markdown";
import { useStreamExample } from "@llm-ui/react";
`;

export const markdownStep1 = markdownQuickStart;

export const markdownStep2 = `${step2Imports}\n\n${getLlmUiOutputUsage("// from Step 1")}`;

export const fullImports = `import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent
} from "@llm-ui/react";
import { markdownLookBack } from "@llm-ui/markdown";`;

const step1Comment = "// -------Step 1: Create a markdown component-------";
const step2Comment = "// -------Step 2: Render markdown with llm-ui-------";

export const fullMarkdownQuickStart = `${fullImports}\n\n${step1Comment}\n\n${markdownComponent}\n\n${step2Comment}\n\n${getLlmUiOutputUsage()}`;
