import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, test } from "vitest";
import { useStreamExample } from ".";

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

describe("useStreamExample", () => {
  test("all at once", () => {
    const { result } = renderHook(() => useStreamExample("Hello", options));

    expect(result.current.output).toBe("Hello");
  });

  test("auto start off", () => {
    const { result } = renderHook(() =>
      useStreamExample("Hello", { ...options, autoStart: false }),
    );

    expect(result.current.output).toBe("");
  });

  test("start", () => {
    const { result } = renderHook(() =>
      useStreamExample("Hello", { ...options, autoStart: false }),
    );
    act(() => result.current.start());
    expect(result.current.output).toBe("Hello");
  });

  test("reset", () => {
    const { result } = renderHook(() => useStreamExample("Hello", options));
    act(() => result.current.reset());
    expect(result.current.output).toBe("");
  });
});
