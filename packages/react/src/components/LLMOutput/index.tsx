import { matchComponents } from "./helper";
import { LLMOutputComponent, LLMOutputReactComponent } from "./types";

export type LLMOutputProps = {
  llmOutput: string;
  components: LLMOutputComponent[];
  fallbackComponent: LLMOutputReactComponent;
};

export const LLMOutput: React.FC<LLMOutputProps> = ({
  llmOutput,
  components,
  fallbackComponent,
}) => {
  const matches = matchComponents(llmOutput, components, fallbackComponent);
  return (
    <>
      {matches.map(({ component: Component, match }, index) => {
        return <Component key={index} llmOutput={match.output} />;
      })}
    </>
  );
};
