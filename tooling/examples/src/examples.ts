import { codeNextJs, codeVite } from "./code";
import { csvNextJs, csvVite } from "./csv";
import { jsonNextJs, jsonVite } from "./json";
import { markdownNextJs, markdownVite } from "./markdown";
import { openaiNextJs, openaiVite } from "./openai";
import { vercelAiNextJs } from "./vercel-ai";

export const examples = [
  csvNextJs,
  csvVite,
  vercelAiNextJs,
  markdownNextJs,
  markdownVite,
  jsonNextJs,
  jsonVite,
  codeNextJs,
  codeVite,
  openaiNextJs,
  openaiVite,
];
