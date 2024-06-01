import { shikiConfig } from "@/components/shikiConfig";
import { cn } from "@/lib/utils";
import { useCodeToHtml, type CodeToHtmlOptions } from "@llm-ui/code";
import parseHtml from "html-react-parser";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CopyButton } from "./CopyButton";

export const CodeBlockContainer: React.FC<{
  className?: string;
  code?: string;
  children: ReactNode;
}> = ({ className, code, children }) => {
  const [codeState, setCodeState] = useState("");
  const codeToCopy = code ?? codeState;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const codeElement = containerRef.current.querySelector("code");
      if (codeElement) {
        setCodeState(codeElement.innerText);
      }
    }
  }, [children]);

  return (
    <div ref={containerRef} className={cn(className, "relative group w-full")}>
      <CopyButton
        size={"sm"}
        variant={"secondary"}
        className="absolute top-3 end-3 min-w-24 opacity-0 !transition-opacity !ease-in !duration-150 group-hover:opacity-100"
        toCopy={codeToCopy}
      />
      {children}
    </div>
  );
};

const ShikiOrFallback: React.FC<{ html: string; code: string }> = ({
  html,
  code,
}) => {
  if (!html) {
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    );
  }
  return <>{parseHtml(html)}</>;
};

export const CodeBlock: React.FC<{
  className?: string;
  code: string;
  codeToHtmlOptions?: Partial<CodeToHtmlOptions>;
}> = ({ className, code, codeToHtmlOptions = {} }) => {
  const html = useCodeToHtml({
    code,
    highlighter: shikiConfig.highlighter,
    codeToHtmlOptions: {
      ...shikiConfig.codeToHtmlOptions,
      ...codeToHtmlOptions,
    },
  });
  return (
    <CodeBlockContainer className={className}>
      <ShikiOrFallback html={html} code={code} />
    </CodeBlockContainer>
  );
};
