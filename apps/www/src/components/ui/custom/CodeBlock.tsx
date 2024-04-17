import { shikiConfig } from "@/components/shikiConfig";
import { cn } from "@/lib/utils";
import {
  ShikiOrFallback,
  useCodeToHtml,
  type CodeToHtmlProps,
} from "@llm-ui/code-block";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "../Button";

const CodeBlockContainer: React.FC<{
  className?: string;
  code: string;
  children: ReactNode;
}> = ({ className, code, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const Icon = isCopied ? Check : Copy;
  const text = isCopied ? "Copied" : "Copy";
  return (
    <div className={cn(className, "relative group")}>
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
    <CodeBlockContainer className={className} code={code}>
      <ShikiOrFallback html={html} code={code} />
    </CodeBlockContainer>
  );
};
