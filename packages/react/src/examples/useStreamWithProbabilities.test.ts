import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, test } from "vitest";
import { resultToArrays } from "./testUtils";
import { UseStreamWithProbabilitiesOptions } from "./types";
import { useStreamWithProbabilities } from "./useStreamWithProbabilities";

type HookProps = {
  example: string;
  userOptions: Partial<UseStreamWithProbabilitiesOptions>;
};

const options: UseStreamWithProbabilitiesOptions = {
  autoStart: true,
  delayMsProbabilities: [{ delayMs: 0, prob: 1 }],
  delayMultiplier: 0,
  autoStartDelayMs: 0,
  startIndex: 0,
  tokenCharsProbabilities: [
    {
      tokenChars: 100,
      prob: 1,
    },
  ],
};

describe("useStreamWithProbabilities", () => {
  test("all at once", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamWithProbabilities("Hello", options),
    );
    await waitFor(() => {
      expect(result.current.output).toEqual("Hello");
      expect(result.current.isStreamStarted).toBe(true);
      expect(result.current.isStreamFinished).toBe(true);
    });
  });

  test("2 chars at a time", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamWithProbabilities("Hello", {
        ...options,
        tokenCharsProbabilities: [
          {
            tokenChars: 2,
            prob: 1,
          },
        ],
      }),
    );
    await waitFor(() => {
      const { output, isStarted, isFinished } = resultToArrays(result);

      expect(output).toEqual(["", "He", "Hell", "Hello"]);
      expect(isStarted).toEqual([false, true, true, true]);
      expect(isFinished).toEqual([false, false, false, true]);
    });
  });

  test("autoStart: false", () => {
    const { result } = renderHook(() =>
      useStreamWithProbabilities("Hello", { ...options, autoStart: false }),
    );

    expect(result.current.output).toBe("");
    expect(result.current.isStreamStarted).toBe(false);
    expect(result.current.isStreamFinished).toBe(false);
  });

  test("start()", () => {
    const { result } = renderHook(() =>
      useStreamWithProbabilities("Hello", { ...options, autoStart: false }),
    );
    act(() => result.current.start());
    expect(result.current.output).toBe("Hello");
    expect(result.current.isStreamStarted).toBe(true);
    expect(result.current.isStreamFinished).toBe(true);
  });

  test("reset()", () => {
    const { result } = renderHook(() =>
      useStreamWithProbabilities("Hello", options),
    );
    act(() => result.current.reset());
    expect(result.current.output).toBe("");
    expect(result.current.isStreamStarted).toBe(false);
    expect(result.current.isStreamFinished).toBe(false);
  });

  test("rerenders", async () => {
    const { result, waitFor, rerender } = renderHook(
      ({ example, userOptions }: HookProps) => {
        return useStreamWithProbabilities(example, userOptions);
      },
      {
        initialProps: {
          example: "Hello",
          userOptions: {
            ...options,
            tokenCharsProbabilities: [{ tokenChars: 2, prob: 1 }],
          },
        },
      },
    );

    rerender({
      example: "Hello",
      userOptions: {
        ...options,
        tokenCharsProbabilities: [{ tokenChars: 1, prob: 1 }],
      },
    });

    await waitFor(() => {
      expect(result.current.output).toBe("Hello");
    });
  });
});
