import { renderHook } from "@testing-library/react-hooks";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fallbackComponent } from "../../test/utils";
import { useMatches } from "./index";

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
