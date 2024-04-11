import { RenderResult, act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, test } from "vitest";
import { UseStreamResponse, useStreamWithProbabilities } from ".";
import { delay } from "../../lib/delay";

const options = {
  autoStart: true,
  loop: false,
  delayMsProbabilities: [{ delayMs: 0, prob: 1 }],
  tokenCharsProbabilities: [
    {
      tokenChars: 100,
      prob: 1,
    },
  ],
};

type ResultArray = {
  output: string[];
  isStarted: boolean[];
  isFinished: boolean[];
};

const resultToArrays = (
  result: RenderResult<UseStreamResponse>,
): ResultArray => {
  return result.all.reduce(
    (acc, r) => {
      if (r instanceof Error) {
        throw r;
      }
      acc.output.push(r.output);
      acc.isStarted.push(r.isStarted);
      acc.isFinished.push(r.isFinished);
      return acc;
    },
    {
      output: [],
      isStarted: [],
      isFinished: [],
    } as ResultArray,
  );
};

describe("useStreamExample", () => {
  test("all at once", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamWithProbabilities("Hello", options),
    );
    await waitFor(() => {
      expect(result.current.output).toEqual("Hello");
      expect(result.current.isStarted).toBe(true);
      expect(result.current.isFinished).toBe(true);
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

  test("auto start off", () => {
    const { result } = renderHook(() =>
      useStreamWithProbabilities("Hello", { ...options, autoStart: false }),
    );

    expect(result.current.output).toBe("");
    expect(result.current.isStarted).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  test("start", () => {
    const { result } = renderHook(() =>
      useStreamWithProbabilities("Hello", { ...options, autoStart: false }),
    );
    act(() => result.current.start());
    expect(result.current.output).toBe("Hello");
    expect(result.current.isStarted).toBe(true);
    expect(result.current.isFinished).toBe(true);
  });

  test("reset", () => {
    const { result } = renderHook(() =>
      useStreamWithProbabilities("Hello", options),
    );
    act(() => result.current.reset());
    expect(result.current.output).toBe("");
    expect(result.current.isStarted).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  test("loop", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamWithProbabilities("Hello", { ...options, loop: true }),
    );
    await delay(30);
    act(() => result.current.pause());
    await waitFor(() => {
      const { output, isStarted, isFinished } = resultToArrays(result);
      console.log({ output, isStarted, isFinished });
      expect(output).toEqual(["", "Hello", "", "Hello"]);
      expect(isStarted).toEqual([false, true, false, true]);
      expect(isFinished).toEqual([false, true, false, true]);
    });
  });
});
