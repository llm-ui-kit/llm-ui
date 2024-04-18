import { LLMOutputComponent, LookBackFunction } from "../core";
import { LLMOutputFallbackBlock } from "../core/useLLMOutput/types";

export const returnParamsLookBack: LookBackFunction = ({
  output,
  isComplete,
  isStreamFinished,
  visibleTextLengthTarget,
}) => ({
  output: `${output} isComplete:${isComplete} visibleTextLengthTarget:${visibleTextLengthTarget === Number.MAX_SAFE_INTEGER ? "inf" : visibleTextLengthTarget} isStreamFinished:${isStreamFinished}`,
  visibleText: output.slice(0, visibleTextLengthTarget),
});

const fallbackComponent: LLMOutputComponent = () => <div>fallback</div>;

export const fallbackBlock: LLMOutputFallbackBlock = {
  component: fallbackComponent,
  lookBack: returnParamsLookBack,
};
