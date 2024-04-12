import { RenderResult } from "@testing-library/react-hooks";
import { UseStreamResponse } from "./types";

export type ResultArray = {
  output: string[];
  isStarted: boolean[];
  isFinished: boolean[];
  loopIndex: number[];
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
      acc.isStarted.push(r.isStreamStarted);
      acc.isFinished.push(r.isStreamFinished);
      acc.loopIndex.push(r.loopIndex);
      return acc;
    },
    {
      output: [],
      isStarted: [],
      isFinished: [],
      loopIndex: [],
    } as ResultArray,
  );
};
