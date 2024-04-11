import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, test } from "vitest";
import { resultToArrays } from "./testUtils";
import { TokenWithDelay, UseStreamTokenArrayOptions } from "./types";
import { useStreamTokenArray } from "./useStreamTokenArray";

const options: UseStreamTokenArrayOptions = {
  autoStart: true,
  loop: false,
  autoStartDelayMs: 0,
  delayMultiplier: 0,
  loopDelayMs: 0,
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
      expect(result.current.isStarted).toBe(true);
      expect(result.current.isFinished).toBe(true);
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

      expect(output).toEqual(["", "He", "Hell", "Hello"]);
      expect(isStarted).toEqual([false, true, true, true]);
      expect(isFinished).toEqual([false, false, false, true]);
    });
  });

  test("autoStart: false", () => {
    const { result } = renderHook(() =>
      useStreamTokenArray(allAtOnce, { ...options, autoStart: false }),
    );

    expect(result.current.output).toBe("");
    expect(result.current.isStarted).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  test("start()", () => {
    const { result } = renderHook(() =>
      useStreamTokenArray(allAtOnce, { ...options, autoStart: false }),
    );
    act(() => result.current.start());
    expect(result.current.output).toBe("Hello");
    expect(result.current.isStarted).toBe(true);
    expect(result.current.isFinished).toBe(true);
  });

  test("reset()", () => {
    const { result } = renderHook(() =>
      useStreamTokenArray(allAtOnce, options),
    );
    act(() => result.current.reset());
    expect(result.current.output).toBe("");
    expect(result.current.isStarted).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  test("loop: true", async () => {
    const { result, waitFor } = renderHook(() =>
      useStreamTokenArray(allAtOnce, { ...options, loop: true }),
    );
    await waitFor(() => {
      const { output, isStarted, isFinished } = resultToArrays(result);
      const hellos = output.filter((o) => o === "Hello");
      const empties = output.filter((o) => o === "");
      expect(hellos.length).greaterThan(5);
      expect(empties.length).greaterThan(5);

      expect(isStarted).containSubset([false, true, false, true]);
      expect(isFinished).containSubset([false, true, false, true]);
      expect(isFinished).containSubset([false, true, false, true]);
      expect(result.current.loopIndex).greaterThan(0);
    });
  });
});
