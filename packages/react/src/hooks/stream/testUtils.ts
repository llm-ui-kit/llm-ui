import { RenderResult } from "@testing-library/react-hooks";
import { UseStreamResponse } from "./types";

export type ResultArray = {
  output: string[];
  isStarted: boolean[];
  isFinished: boolean[];
};

export const resultToArrays = (
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
