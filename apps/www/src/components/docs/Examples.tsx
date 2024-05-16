import { examples } from "@llm-ui/examples";
export const Examples = () => {
  return (
    <div>
      {examples.map((example) => (
        <div key={example.folder}>
          <h2 className="text-4xl">{example.exampleName}</h2>
        </div>
      ))}
    </div>
  );
};
