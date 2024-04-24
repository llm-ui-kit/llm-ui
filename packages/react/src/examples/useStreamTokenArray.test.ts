import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, test } from "vitest";
import { resultToArrays } from "./testUtils";
import { TokenWithDelay, UseStreamTokenArrayOptions } from "./types";
import { useStreamTokenArray } from "./useStreamTokenArray";

const options: UseStreamTokenArrayOptions = {
  autoStart: true,
  autoStartDelayMs: 0,
  delayMultiplier: 0,
  startIndex: 0,
};

const allAtOnce: TokenWithDelay[] = [
  {
    token: "Hello",
    delayMs: 0,
  },
];

describe("useStreamTokenArray", () => {
  test("all at once", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(allAtOnce, options),
    );
    await waitFor(() => {
      expect(result.current.output).toEqual("Hello");
      expect(result.current.isStreamStarted).toBe(true);
      expect(result.current.isStreamFinished).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  test("2 chars at a time", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(
        [
          {
            token: "He",
            delayMs: 0,
          },
          {
            token: "ll",
            delayMs: 0,
          },
          {
            token: "o",
            delayMs: 0,
          },
        ],
        options,
      ),
    );
    await waitFor(() => {
      const { output, isStarted, isFinished } = resultToArrays(result);
      expect(output.slice(0, -1)).toEqual(["", "He", "Hell", "Hello"]);
      expect(isStarted.slice(0, -1)).toEqual([false, true, true, true]);
      expect(isFinished.slice(0, -1)).toEqual([false, false, false, true]);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  test("autoStart: false", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(allAtOnce, { ...options, autoStart: false }),
    );
    waitFor(() => {
      expect(result.current.output).toBe("");
      expect(result.current.isStreamStarted).toBe(false);
      expect(result.current.isStreamFinished).toBe(false);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  test("start()", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(allAtOnce, { ...options, autoStart: false }),
    );
    act(() => result.current.start());

    await waitFor(() => {
      expect(result.current.output).toBe("Hello");
      expect(result.current.isStreamStarted).toBe(true);
      expect(result.current.isStreamFinished).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  test("reset()", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(allAtOnce, options),
    );
    act(() => result.current.reset());
    await waitFor(() => {
      expect(result.current.output).toBe("");
      expect(result.current.isStreamStarted).toBe(false);
      expect(result.current.isStreamFinished).toBe(false);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  test("startIndex: 20", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(allAtOnce, { ...options, startIndex: 20 }),
    );
    waitFor(() => {
      const { output } = resultToArrays(result);

      expect(output[0]).toBe("Hello");
    });
  });
});
