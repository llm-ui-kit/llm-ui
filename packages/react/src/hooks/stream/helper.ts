import { Probability, ProbabilityOptions, TokenWithDelay } from "./types";

export const cumulativeProbability = <T extends Probability>(
  probs: T[],
): T[] => {
  return probs.reduce((acc, curr) => {
    const previousProb = acc.length === 0 ? 0 : acc[acc.length - 1].prob;
    return [
      ...acc,
      {
        ...curr,
        prob: previousProb + curr.prob,
      },
    ];
  }, [] as T[]);
};

export const stringToTokenArray = (
  llmOutput: string,
  { tokenCharsProbabilities, delayMsProbabilities }: ProbabilityOptions,
): TokenWithDelay[] => {
  const tokenCharsProbabilitiesCum = cumulativeProbability(
    tokenCharsProbabilities,
  );
  const delayProbsCum = cumulativeProbability(delayMsProbabilities);
  let index = 0;
  const tokensWithDelay: TokenWithDelay[] = [];
  while (index < llmOutput.length) {
    const tokenSizeRand = Math.random();
    const delayRand = Math.random();
    const remainingChars = llmOutput.length - index;

    const tokenSize = Math.min(
      tokenCharsProbabilitiesCum.find((tp) => tp.prob > tokenSizeRand)
        ?.tokenChars ?? 1,
      remainingChars,
    );

    const token = llmOutput.slice(index, index + tokenSize);
    const delay =
      delayProbsCum.find((dp) => dp.prob > delayRand)?.delayMs ?? 10;

    tokensWithDelay.push({ token, delayMs: delay });
    index += tokenSize;
  }
  return tokensWithDelay;
};
