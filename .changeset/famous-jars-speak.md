---
"@llm-ui/react": minor
---

useLLMOutput only starts streaming when llmOutput is not empty. Resets if llmOutput is later set to empty.

This fixes bugs where the streamed output is slow.
