import { stringToTokenArray, type TokenWithDelay } from "llm-ui/hooks";
import { defaultExampleProbs } from "./contants";

export const ctaExample = `### [Docs](https://llm-ui.com/docs)

**Install**:
\`\`\`bash
pnpm add llm-ui @llm-ui/markdown @llm-ui/code-block
\`\`\`

- *italic*, **bold**, ~strikethrough~,
`;

export const markdownExample = `### Header
[links](https://llm-ui.com)
1. Ordered list
2. ~strikethrough~
3. *italic*
4. **bold**
5. *nested **important** text*
6. \`inline code\`

\`\`\``;

export const codeBlockExample = `#### Python
\`\`\`python
def hello_llm_ui():
    print("Hello llm-ui")
\`\`\`

#### Typescript
\`\`\`ts
const helloLlmUi = () => {
  console.log("Hello llm-ui")
}
\`\`\`

#### Haskell
\`\`\`haskell
main = putStrLn "Hello llm-ui"
\`\`\``;

export const customComponentExample = `### Custom Component

Quick actions:

<buttons>
  <button>Option 1</button>
  <button>Option 2</button>
</buttons>
`;

const throttleBeforePause = `### Throttling

A pause is coming in 3...2...1`;

const throttleAfterPause = `and now we resume smoothly 🚀`;

export const throttleExample: TokenWithDelay[] = [
  ...stringToTokenArray(throttleBeforePause, defaultExampleProbs),
  { token: " ", delayMs: 5000 },
  ...stringToTokenArray(throttleAfterPause, defaultExampleProbs),
];
