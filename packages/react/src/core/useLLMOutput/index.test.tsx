import { renderHook } from "@testing-library/react-hooks";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fallbackBlock } from "../../test/utils";
import { useLLMOutput } from "./index";
import { ThrottleFunction } from "./types";

const noThrottle: ThrottleFunction = () => ({
  visibleTextIncrement: 100,
});

const callRenderLoop = ({ times }: { times: number }) => {
  let count = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
    count++;
    if (count < times) {
      callback();
    }
    return 1;
  });
};

describe("useLLMOutput Hook", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("should initialize with an empty matches array", () => {
    callRenderLoop({ times: 1 });

    const { result } = renderHook(() =>
      useLLMOutput({
        llmOutput: "",
        isStreamFinished: false,
        blocks: [],
        fallbackBlock: fallbackBlock,
        throttle: noThrottle,
      }),
    );

    expect(result.current.blockMatches).toEqual([]);
  });

  test("matches fallback", () => {
    const { result } = renderHook(() => {
      callRenderLoop({ times: 2 });
      return useLLMOutput({
        llmOutput: "hello",
        isStreamFinished: false,
        blocks: [],
        fallbackBlock: fallbackBlock,
        throttle: noThrottle,
      });
    });
    expect(result.current.blockMatches).toEqual([
      {
        block: fallbackBlock,
        startIndex: 0,
        endIndex: 5,
        output:
          "hello isComplete:false visibleTextLengthTarget:100 isStreamFinished:false",
        outputRaw: "hello",
        visibleText: "hello",
        isVisible: true,
        priority: 0,
        llmOutput: "hello",
        isComplete: false,
      },
    ]);
  });
});
