import { codeNextJs, codeVite } from "./code";
// import { customNextJs, customVite } from "./custom";
import { markdownNextJs, markdownVite } from "./markdown";
import { openaiNextJs, openaiVite } from "./openai";
import { vercelAiNextJs } from "./vercel-ai";

export const examples = [
  vercelAiNextJs,
  markdownNextJs,
  markdownVite,
  // customNextJs,
  // customVite,
  codeNextJs,
  codeVite,
  openaiNextJs,
  openaiVite,
];
