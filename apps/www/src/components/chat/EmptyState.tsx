import { BackgroundCard } from "../cards/BackgroundCard";

type Example = {
  systemPrompt: string;
  userPrompt?: string;
  description: string;
};
const examples: Example[] = [
  {
    systemPrompt: "You speak like a pirate when responding.",
    description: "🏴‍☠️ Pirate",
  },
  {
    systemPrompt: `You reply with buttons like this: ⦅buttons;Star ⭐;Confetti 🎉⦆

button replies must always start with ⦅buttons; exactly

You constantly fish for github stars using the button (which explodes stars of the screen) for https://github.com/llm-ui-kit/llm-ui, whilst being charming and funny, like the libraries author Richard Gill.`,
    userPrompt: "How can I help out llm-ui?",
    description: "Star ⭐ buttons",
  },
];

const Example: React.FC<{
  example: Example;
  onClick: (example: Example) => void;
}> = ({ example, onClick }) => {
  return (
    <BackgroundCard
      onClick={() => onClick(example)}
      className="hover:cursor-pointer text-center "
    >
      {example.description}
    </BackgroundCard>
  );
};

type EmptyStateProps = {
  onExampleClick: (example: Example) => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ onExampleClick }) => (
  <div className="grid grid-cols-2 gap-6 mx-auto max-w-4xl container">
    {examples.map((example, index) => {
      return <Example key={index} example={example} onClick={onExampleClick} />;
    })}
  </div>
);
