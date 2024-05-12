---
"@llm-ui/code": minor
"@llm-ui/react": minor
---

@llm-ui/react/{core,examples,throttle} -> @llm-ui/react
@llm-ui/code/{shikiBundles/allLangs,shikiBundles/allThemes} -> @llm-ui/code

Removes exports more than one level deep (e.g. @llm-ui/react/core) since they don't work with older moduleResolution settings in TypeScript (which react-script uses by default).
