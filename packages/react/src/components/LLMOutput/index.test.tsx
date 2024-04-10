import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, test } from "vitest";
import { useMatches } from "./index";
import {
  LLMOutputFallbackComponent,
  LLMOutputReactComponent,
  LookBackFunction,
} from "./types";

// todo: extract these:
const returnParamsLookBack: LookBackFunction = ({
  output,
  isComplete,
  isStreamFinished,
  visibleTextLengthTarget,
}) => ({
  output: `${output} isComplete:${isComplete} visibleTextLengthTarget:${visibleTextLengthTarget === Number.MAX_SAFE_INTEGER ? "inf" : visibleTextLengthTarget} isStreamFinished:${isStreamFinished}`,
  visibleText: output.slice(0, visibleTextLengthTarget),
});

const fallbackReactComponent: LLMOutputReactComponent = () => (
  <div>fallback</div>
);

const fallbackComponent: LLMOutputFallbackComponent = {
  component: fallbackReactComponent,
  lookBack: returnParamsLookBack,
};

const noThrottle = () => ({ visibleTextLengthTarget: 0, skip: false });

describe("useMatches Hook", () => {
  test("should initialize with an empty matches array", () => {
    const { result } = renderHook(() =>
      useMatches({
        llmOutput: "",
        isFinished: false,
        components: [],
        fallbackComponent: fallbackComponent,
        throttle: noThrottle,
      }),
    );

    expect(result.current.matches).toEqual([]);
  });
  test("test 2", () => {
    const { result } = renderHook(() =>
      useMatches({
        llmOutput: "h",
        isFinished: false,
        components: [],
        fallbackComponent: fallbackComponent,
        throttle: noThrottle,
      }),
    );

    expect(result.current.matches).toEqual([]);
  });

  // Add more tests here...
});
