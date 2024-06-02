import { jsonBlockPrompt } from "@llm-ui/json";
import { stringToTokenArray, type TokenWithDelay } from "@llm-ui/react";
import { buttonsSchema } from "./buttonsSchema";
import { HIDDEN_CHAR, defaultExampleProbs } from "./constants";

const ctaBeforePause = `# llm-ui

### Removes broken markdown syntax

It renders **bold**, *italic*, ~strikethrough~ and [links](https://llm-ui.com/docs) without showing any markdown syntax.

### Custom components

Add your own custom components to your LLM output.

Lets add a custom button:

【{type:"buttons",buttons:[{text:"Star ⭐"}, {text:"Confetti 🎉"}]}】

This works by prompting the LLM to let it know it can use buttons by replying like this:
\`\`\`plain
【{type:"${HIDDEN_CHAR}buttons",buttons:[{text:"Star ⭐"}, {text:"Confetti 🎉"}]}】
\`\`\`

^^^ llm-ui also has code blocks with syntax highlighting for over 100 languages with [Shiki](https://shiki.style/).

### Matches your display's frame rate
This text is streaming tokens which are 3 characters long, but llm-ui smooths this out by rendering characters at the native frame rate of your display.

### Removes pauses

llm-ui smooths out pauses in the LLM's response

Like this one: in 3...2...1`;

const ctaAfterPause = `without users noticing.

【{type:"buttons",buttons:[{text:"See raw LLM output"}]}】

^^^ check out the raw LLM output to see the tokens being streamed.
`;
export const ctaExample: TokenWithDelay[] = [
  ...stringToTokenArray(ctaBeforePause, defaultExampleProbs),
  { token: " ", delayMs: 1500 },
  ...stringToTokenArray(ctaAfterPause, defaultExampleProbs),
];

const beforePause =
  `Sure, here's "llm-ui" repeated 99 times: \n\n${"llm-ui ".repeat(10)}`.slice(
    0,
    -1,
  );

const afterPause = `llm-ui `.repeat(90);

export const presentationPauseExample: TokenWithDelay[] = [
  ...stringToTokenArray(beforePause, defaultExampleProbs),
  { token: " ", delayMs: 600 },
  ...stringToTokenArray(afterPause, defaultExampleProbs),
];

export const buttonJsonPrompt = jsonBlockPrompt({
  name: "Button",
  schema: buttonsSchema,
  examples: [
    { type: "buttons", buttons: [{ text: "Button 1" }, { text: "Button 2" }] },
  ],
  options: {
    type: "buttons",
  },
});
