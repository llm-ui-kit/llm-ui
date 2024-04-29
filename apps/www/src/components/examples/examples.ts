import {
  stringToTokenArray,
  type TokenWithDelay,
} from "@llm-ui/react/examples";
import { defaultExampleProbs } from "./contants";

export const ctaExample = `### Install
\`\`\`bash
pnpm add @llm-ui/react @llm-ui/markdown
\`\`\`

[Docs](/docs)

- *italic*, **bold**, ~strikethrough~
`;

export const markdownExample = `### Header


~abc~


**bold**


*italic*


***bold and italic***

[Link](https://llm-ui.com/docs)

---

- bullet 1
2. ordered list
3. three
`;

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

Sometimes model outputs stop for a couple of seconds. llm-ui can throttle the output to make it look more natural.


Pausing in 3...2...1`;

const throttleAfterPause = `and now we resume smoothly 🚀`;

export const throttleExample: TokenWithDelay[] = [
  ...stringToTokenArray(throttleBeforePause, defaultExampleProbs),
  { token: " ", delayMs: 1500 },
  ...stringToTokenArray(throttleAfterPause, defaultExampleProbs),
];
