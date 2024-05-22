import { Message as MessageComponent } from "@/components/demo/message/Message";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { nanoid, type Message } from "ai";
import { useChat } from "ai/react";
import * as React from "react";

const ChatMessage: React.FC<{
  message: Message;
  isStreamFinished: boolean;
}> = ({ message, isStreamFinished }) => {
  return (
    <div>
      <p>{message.role}</p>
      <MessageComponent
        message={message.content}
        isStreamFinished={isStreamFinished}
      />
    </div>
  );
};

export const Chat = () => {
  const [currentApiKey, setCurrentApiKey] = React.useState<string>("");
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: nanoid(),
          role: "system",
          content: "You are a helpful assistant.",
        },
      ],
      body: {
        apiKey: currentApiKey,
      },
    });

  const handleUpdateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setCurrentApiKey(newApiKey);
  };

  const messagesWithoutSystem = messages.slice(1);
  return (
    <div>
      <form autoComplete="off" onSubmit={handleSubmit} className="space-y-8">
        <label>Enter Your API Key</label>
        <Input value={currentApiKey} onChange={handleUpdateApiKey} />
        {messagesWithoutSystem.map((message, index) => {
          const isStreamFinished =
            ["user", "system"].includes(message.role) ||
            index < messagesWithoutSystem.length - 1 ||
            !isLoading;
          return (
            <ChatMessage
              key={message.id}
              message={message}
              isStreamFinished={isStreamFinished}
            />
          );
        })}
        <Textarea
          placeholder="What would you like to know?"
          value={input}
          onChange={handleInputChange}
          className="mb-2"
        />
        <Button disabled={isLoading} type="submit">
          Start
        </Button>
      </form>
    </div>
  );
};
