import { useEffect, useState } from "react";
import { HighlighterCore } from "shiki/core";
import { LLMUIHighlighter } from "../types";

// Starts loading the highlighter immediately, hopefully it loads before it's needed
// we can get the highlighter sync using getHighlighter and async using highlighterPromise
export const loadHighlighter = (
  highlighter: Promise<HighlighterCore>,
): LLMUIHighlighter => {
  let highlighterInstance: HighlighterCore | undefined;
  return {
    getHighlighter: () => highlighterInstance,
    highlighterPromise: highlighter.then((h) => {
      highlighterInstance = h;
      return h;
    }),
  };
};

export const useLoadHighlighter = ({
  getHighlighter,
  highlighterPromise,
}: LLMUIHighlighter) => {
  const [highlighter, setHighlighter] = useState<HighlighterCore | undefined>(
    getHighlighter(),
  );

  useEffect(() => {
    if (!highlighter) {
      if (getHighlighter()) {
        setHighlighter(getHighlighter());
      } else {
        (async () => {
          setHighlighter(await highlighterPromise);
        })();
      }
    }
  }, []);
  return highlighter;
};
