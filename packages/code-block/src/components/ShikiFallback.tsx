import parseHtml from "html-react-parser";
import { useCodeToHtml } from "../hooks/useCodeToHtml";
import { ShikiProps } from "../types";

const ShikiPreFallback: React.FC<{ code: string }> = ({ code }) => (
  <pre className="shiki">
    <code>{code}</code>
  </pre>
);

// this component uses parseHtml to prevent react from rerendering the entire shiki html
// <pre> every render.
export const ShikiOrFallback: React.FC<{
  html: string | undefined;
  code: string;
}> = ({ html, code }) =>
  html ? <>{parseHtml(html)}</> : <ShikiPreFallback code={code} />;

export const ShikiCode: React.FC<ShikiProps & { code: string }> = ({
  highlighter,
  codeToHtmlProps,
  code,
}) => {
  const html = useCodeToHtml({
    code,
    highlighter,
    codeToHtmlProps,
  });
  return <ShikiOrFallback html={html} code={code} />;
};
