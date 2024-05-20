import { ctaExample } from "@/components/examples/examples";
import { useStreamTokenArray } from "@llm-ui/react";
import { Message } from "./message/Message";

export const HomeDemo = () => {
  const { output, isStreamFinished } = useStreamTokenArray(ctaExample);

  return <Message message={output} isStreamFinished={isStreamFinished} />;
};
