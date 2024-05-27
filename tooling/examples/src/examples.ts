import { codeNextJs, codeVite } from "./code";
// import { jsonNextJs, jsonVite } from "./json";
import { markdownNextJs, markdownVite } from "./markdown";
import { openaiNextJs, openaiVite } from "./openai";
import { vercelAiNextJs } from "./vercel-ai";

export const examples = [
  vercelAiNextJs,
  markdownNextJs,
  markdownVite,
  // jsonNextJs,
  // jsonVite,
  codeNextJs,
  codeVite,
  openaiNextJs,
  openaiVite,
];
