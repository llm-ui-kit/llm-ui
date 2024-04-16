import { useCodeToHtml } from "../hooks/useCodeToHtml";
import { ShikiProps } from "../types";
import { ShikiOrFallback } from "./ShikiFallback";

export const ShikiCode: React.FC<ShikiProps & { code: string }> = ({
  highlighter: llmuiHighlighter,
  codeToHtmlProps,
  code,
}) => {
  const html = useCodeToHtml({
    code,
    highlighter: llmuiHighlighter,
    codeToHtmlProps,
  });
  return <ShikiOrFallback html={html} code={code} />;
};
