# @llm-ui/react

## 0.13.3

### Patch Changes

- [#264](https://github.com/llm-ui-kit/llm-ui/pull/264) [`7f81520`](https://github.com/llm-ui-kit/llm-ui/commit/7f81520aa8805ec991d37c37b8d4d8ebb959eaed) Thanks [@richardgill](https://github.com/richardgill)! - Performance improvements: use `React.memo` to avoid recalculating blocks

## 0.13.2

### Patch Changes

- [#261](https://github.com/llm-ui-kit/llm-ui/pull/261) [`9360d30`](https://github.com/llm-ui-kit/llm-ui/commit/9360d3049cfa669a133ef673fb5bb220c5823f09) Thanks [@richardgill](https://github.com/richardgill)! - Performance improvement: Only log console warnings in dev

## 0.13.1

## 0.13.0

## 0.12.0

## 0.11.1

## 0.11.0

## 0.10.0

## 0.9.0

## 0.8.0

### Minor Changes

- [#217](https://github.com/llm-ui-kit/llm-ui/pull/217) [`4e17508`](https://github.com/llm-ui-kit/llm-ui/commit/4e175085ec1c352e7a4ebc7db801ce5f74b9378f) Thanks [@richardgill](https://github.com/richardgill)! - - `useLLMOutput` hook now returns all known blocks, it doesn't truncate the blocks based on how much is visible.
  - `isVisible: true|false` added to 'blockMatch' returned from `useLLMOutput` hook.

## 0.7.0

## 0.6.0

## 0.5.0

### Minor Changes

- [#205](https://github.com/llm-ui-kit/llm-ui/pull/205) [`cfc8e84`](https://github.com/llm-ui-kit/llm-ui/commit/cfc8e84d532919440d4ac82f898ab09c8710ac47) Thanks [@richardgill](https://github.com/richardgill)! - - `useLLMOutput` only starts streaming when llmOutput is not empty.
  - This fixes bugs where the streamed output is slow
  - `useLLMOutput` reset its state if `llmOutput` is later set to `""`.
    - This allows `useLLMOutput` to be reused more than once

## 0.4.0

## 0.3.0

## 0.2.0

## 0.1.1

### Patch Changes

- [#174](https://github.com/llm-ui-kit/llm-ui/pull/174) [`836b147`](https://github.com/llm-ui-kit/llm-ui/commit/836b14753b44db41d35d1cd4820834c01cc4b7a2) Thanks [@richardgill](https://github.com/richardgill)! - Basic Throttle: Multiple character per render for fast streams

## 0.1.0

### Minor Changes

- [#168](https://github.com/llm-ui-kit/llm-ui/pull/168) [`999004c`](https://github.com/llm-ui-kit/llm-ui/commit/999004cb10d62ec956e8b6873cae938d76e5fe0d) Thanks [@richardgill](https://github.com/richardgill)! - @llm-ui/react/{core,examples,throttle} -> @llm-ui/react
  @llm-ui/code/shikiBundles/{allLangs,allThemes} -> @llm-ui/code

  Removes exports more than one level deep (e.g. @llm-ui/react/core) since they don't work with older moduleResolution settings in TypeScript (which react-script uses by default).

## 0.0.13

## 0.0.12

### Patch Changes

- [#150](https://github.com/llm-ui-kit/llm-ui/pull/150) [`9634d5c`](https://github.com/llm-ui-kit/llm-ui/commit/9634d5c59105aff912ebee19ce9adf77f7d02a36) Thanks [@richardgill](https://github.com/richardgill)! - MIT License

## 0.0.11

### Patch Changes

- [#144](https://github.com/llm-ui-kit/llm-ui/pull/144) [`c0834d5`](https://github.com/llm-ui-kit/llm-ui/commit/c0834d54d1a048d74b2e70b74391715a385f4b5a) Thanks [@richardgill](https://github.com/richardgill)! - frameLookbackMs -> frameLookBackMs AND windowCount -> windowLookBackMs (breaking but prerelease)

## 0.0.10

## 0.0.9

### Patch Changes

- [#137](https://github.com/llm-ui-kit/llm-ui/pull/137) [`2fc9626`](https://github.com/llm-ui-kit/llm-ui/commit/2fc9626070a8743c531db5ae51fc60a6054e009d) Thanks [@richardgill](https://github.com/richardgill)! - fix require typescript types

## 0.0.8

## 0.0.7

## 0.0.5

### Patch Changes

- [#108](https://github.com/llm-ui-kit/llm-ui/pull/108) [`fc3d785`](https://github.com/llm-ui-kit/llm-ui/commit/fc3d78558ccaa5c7fa08e6ecfa44798abbe38d7d) Thanks [@richardgill](https://github.com/richardgill)! - tsup config fixed

## 0.0.4

### Patch Changes

- [#105](https://github.com/llm-ui-kit/llm-ui/pull/105) [`d735ab7`](https://github.com/llm-ui-kit/llm-ui/commit/d735ab78aa7766cb5fb1414b742fb48433c3deff) Thanks [@richardgill](https://github.com/richardgill)! - README.md updates for npm

## 0.0.3

### Patch Changes

- [#97](https://github.com/llm-ui-kit/llm-ui/pull/97) [`503a51a`](https://github.com/llm-ui-kit/llm-ui/commit/503a51a103b926f7daea123b446cc9b2ce9eac11) Thanks [@richardgill](https://github.com/richardgill)! - npm auto publish setup

## 0.0.2

### Patch Changes

- [#96](https://github.com/llm-ui-kit/llm-ui/pull/96) [`59457cb`](https://github.com/llm-ui-kit/llm-ui/commit/59457cb6ddf91340f03616303fed4ba6c2f15038) Thanks [@richardgill](https://github.com/richardgill)! - fix versions together

- [#95](https://github.com/llm-ui-kit/llm-ui/pull/95) [`9d103a9`](https://github.com/llm-ui-kit/llm-ui/commit/9d103a9ee8ea60945f1b485d4d9c2895d15cba4e) Thanks [@richardgill](https://github.com/richardgill)! - Initial version
