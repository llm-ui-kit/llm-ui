import {
  stringToTokenArray,
  type TokenWithDelay,
} from "@llm-ui/react/examples";
import { defaultExampleProbs } from "./contants";

const ctaBeforePause = `# llm-ui

### Removes broken markdown syntax

It renders **bold**, *italic*, ~strikethrough~ and [links](https://llm-ui.com/docs) without showing any markdown syntax.

### Custom components

Add your own custom components to your LLM output.

Lets add a custom button:

<buttons>
  <button>Star explosion ⭐</button>
</buttons>

This works by prompting the LLM to let it know it can use buttons by replying like this:
\`\`\`xml
<buttons>
  <button>Star explosion ⭐</button>
</buttons>
\`\`\`

^^^ llm-ui also has code blocks with syntax highlighting for over 100 languages with [Shiki](https://shiki.style/).

### Matches your display's frame rate
This text is streaming tokens which are 3 characters long, but llm-ui smooths this out by rendering characters at the native frame rate of your display.

### Removes pauses

llm-ui smooths out pauses in the LLM's response

Like this one: in 3...2...1`;

const ctaAfterPause = `without users noticing.

<buttons>
  <button>See raw LLM output</button>
</buttons>

^^^ check out the raw LLM output to see the tokens being streamed.
`;
export const ctaExample: TokenWithDelay[] = [
  ...stringToTokenArray(ctaBeforePause, defaultExampleProbs),
  { token: " ", delayMs: 1500 },
  ...stringToTokenArray(ctaAfterPause, defaultExampleProbs),
];
