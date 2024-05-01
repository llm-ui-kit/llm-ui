import {
  stringToTokenArray,
  type TokenWithDelay,
} from "@llm-ui/react/examples";
import { defaultExampleProbs } from "./contants";

const ctaBeforePause = `# llm-ui

### Removes broken markdown syntax

It renders **bold**, *italic*, and ~strikethrough~ without showing any markdown syntax.

Here's a link to the [docs](https://llm-ui.com/docs).

### Custom components

Add your own custom components to your LLM output.

Lets add some buttons:

<buttons><button>Something</button><button>Else</button></buttons>

This works by telling the LLM to reply with buttons like this:

\`\`\`xml
<buttons>
  <button>See raw LLM output</button>
  <button>Fire confetti</button>
</buttons>
\`\`\`

^^^ It also has code blocks with syntax highlighting for over 100 languages with [Shiki](https://shiki.style/).

### Matches your display's frame rate
This text is streaming tokens which are 3 characters long, but llm-ui smooths this out by rendering characters at the native frame rate of your display.

### Removes pauses

It can also smooth out pauses in the LLM's response

Like this one: in 3...2...1`;

const ctaAfterPause = `without users noticing.`;
export const ctaExample: TokenWithDelay[] = [
  ...stringToTokenArray(ctaBeforePause, defaultExampleProbs),
  { token: " ", delayMs: 1500 },
  ...stringToTokenArray(ctaAfterPause, defaultExampleProbs),
];
