import { shikiConfig } from "@/components/shikiConfig";
import { cn } from "@/lib/utils";
import { useCodeToHtml, type CodeToHtmlProps } from "@llm-ui/code";
import parseHtml from "html-react-parser";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../Button";

export const CodeBlockContainer: React.FC<{
  className?: string;
  children: ReactNode;
}> = ({ className, children }) => {
  const [code, setCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const codeElement = containerRef.current.querySelector("code");
      if (codeElement) {
        setCode(codeElement.innerText);
      }
    }
  }, [children]);

  const Icon = isCopied ? Check : Copy;
  const text = isCopied ? "Copied" : "Copy";

  return (
    <div ref={containerRef} className={cn(className, "relative group")}>
      <Button
        className={cn(
          "absolute top-3 end-3 min-w-24 !transition-opacity !ease-in !duration-150 group-hover:opacity-100",
          isCopied ? "opacity-100" : "opacity-0",
        )}
        size={"sm"}
        variant={"secondary"}
        onClick={() => {
          if (code) {
            navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 1400);
          }
        }}
      >
        <Icon className="mr-2 h-4 w-4" />
        {text}
      </Button>
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
  codeToHtmlProps?: Partial<CodeToHtmlProps>;
}> = ({ className, code, codeToHtmlProps = {} }) => {
  const html = useCodeToHtml({
    code,
    highlighter: shikiConfig.highlighter,
    codeToHtmlProps: {
      ...shikiConfig.codeToHtmlProps,
      ...codeToHtmlProps,
    },
  });
  return (
    <CodeBlockContainer className={className}>
      <ShikiOrFallback html={html} code={code} />
    </CodeBlockContainer>
  );
};
