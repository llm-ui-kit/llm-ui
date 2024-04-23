import { stringToTokenArray, type TokenWithDelay } from "llm-ui/examples";
import { defaultExampleProbs } from "./contants";

export const ctaExample = `### [Docs](https://llm-ui.com/docs)

**Install**:
\`\`\`bash
pnpm add llm-ui @llm-ui/markdown
\`\`\`

- *italic*, **bold**, ~strikethrough~,
`;

// export const markdownExample = `### Header
// ~abc~ **bold** *italic* ***something***

// ---

// something else

// # ok lets go
// `;
export const markdownExample = `abc

# def sdlklksdlksld

ghi asdlkasldk sdlksldksd

jkl asdlkasdlklkasd
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

Sometimes models outputs stop for a couple of seconds. llm-ui can throttle the output to make it look more natural.


Pausing in 3...2...1`;

const throttleAfterPause = `and now we resume smoothly 🚀`;

export const throttleExample: TokenWithDelay[] = [
  ...stringToTokenArray(throttleBeforePause, defaultExampleProbs),
  { token: " ", delayMs: 1500 },
  ...stringToTokenArray(throttleAfterPause, defaultExampleProbs),
];
