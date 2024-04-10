import { renderHook } from "@testing-library/react-hooks";
import { afterEach, describe, expect, test, vi } from "vitest";
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

const noThrottle = () => ({ visibleTextLengthTarget: 100, skip: false });

const callRenderLoop = ({ times }: { times: number }) => {
  let count = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
    console.log("count", count, "times", times);
    count++;
    if (count < times) {
      callback();
    }
    return 1;
  });
};

describe("useMatches Hook", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("should initialize with an empty matches array", () => {
    callRenderLoop({ times: 1 });

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

  test("matches fallback", () => {
    const { result } = renderHook(() => {
      callRenderLoop({ times: 2 });
      return useMatches({
        llmOutput: "hello",
        isFinished: false,
        components: [],
        fallbackComponent: fallbackComponent,
        throttle: noThrottle,
      });
    });
    expect(result.current.matches).toEqual([
      {
        component: {
          component: fallbackReactComponent,
          lookBack: returnParamsLookBack,
        },
        match: {
          startIndex: 0,
          endIndex: 5,
          outputAfterLookback:
            "hello isComplete:false visibleTextLengthTarget:100 isStreamFinished:false",
          outputRaw: "hello",
          visibleText: "hello",
        },
        priority: 0,
      },
    ]);
  });
});
