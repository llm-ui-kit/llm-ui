import { shikiConfig } from "@/components/shikiConfig";
import { cn } from "@/lib/utils";
import {
  ShikiOrFallback,
  loadHighlighter,
  useCodeToHtml,
  type CodeToHtmlProps,
  type ShikiProps,
} from "@llm-ui/code-block";
import {
  allLangs,
  allLangsAlias,
} from "@llm-ui/code-block/shikiBundles/allLangs";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { getHighlighterCore } from "shiki/core";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";
import { Button } from "../Button";

const shikiProps: ShikiProps = {
  highlighter: loadHighlighter(
    getHighlighterCore({
      langs: allLangs,
      langAlias: allLangsAlias,
      themes: [githubLight, githubDark],
      loadWasm: getWasm,
    }),
  ),
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

const CodeBlockContainer: React.FC<{
  code: string;
  children: ReactNode;
}> = ({ code, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const Icon = isCopied ? Check : Copy;
  const text = isCopied ? "Copied" : "Copy";
  return (
    <div className="relative group my-4">
      <Button
        className={cn(
          "absolute top-3 end-3 min-w-24 !transition-opacity !ease-in !duration-150 group-hover:opacity-100 ",
          isCopied ? "opacity-100" : "opacity-0",
        )}
        size={"sm"}
        variant={"secondary"}
        onClick={() => {
          navigator.clipboard.writeText(code);
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1400);
        }}
      >
        <Icon className="mr-2 h-4 w-4" />
        {text}
      </Button>
      {children}
    </div>
  );
};

export const CodeBlock: React.FC<{
  code: string;
  codeToHtmlProps?: Partial<CodeToHtmlProps>;
}> = ({ code, codeToHtmlProps = {} }) => {
  const html = useCodeToHtml({
    code,
    highlighter: shikiProps.highlighter,
    codeToHtmlProps: {
      ...shikiConfig.codeToHtmlProps,
      ...codeToHtmlProps,
    },
  });
  return (
    <CodeBlockContainer code={code}>
      <ShikiOrFallback html={html} code={code} />
    </CodeBlockContainer>
  );
};
