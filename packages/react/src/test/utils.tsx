import { LLMOutputReactComponent, LookBackFunction } from "../components";
import { LLMOutputFallbackComponent } from "../components/LLMOutput/types";

export const returnParamsLookBack: LookBackFunction = ({
  output,
  isComplete,
  isStreamFinished,
  visibleTextLengthTarget,
}) => ({
  output: `${output} isComplete:${isComplete} visibleTextLengthTarget:${visibleTextLengthTarget === Number.MAX_SAFE_INTEGER ? "inf" : visibleTextLengthTarget} isStreamFinished:${isStreamFinished}`,
  visibleText: output.slice(0, visibleTextLengthTarget),
});

const fallbackReactComponent: LLMOutputReactComponent = () => (
  <div>fallback</div>
);

export const fallbackComponent: LLMOutputFallbackComponent = {
  component: fallbackReactComponent,
  lookBack: returnParamsLookBack,
};
