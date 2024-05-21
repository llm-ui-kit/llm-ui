---
"@llm-ui/react": minor
---

- `useLLMOutput` only starts streaming when llmOutput is not empty.
  - This fixes bugs where the streamed output is slow
- `useLLMOutput` reset its state if `llmOutput` is later set to `""`.
  - This allows `useLLMOutput` to be reused more than once
