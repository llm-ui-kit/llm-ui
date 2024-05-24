import { Message as MessageComponent } from "@/components/demo/message/Message";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Icons } from "@/icons";
import { nanoid, type Message } from "ai";
import { useChat } from "ai/react";
import * as React from "react";

const ChatMessage: React.FC<{
  message: Message;
  isStreamFinished: boolean;
}> = ({ message, isStreamFinished }) => {
  const { role, content } = message;
  return (
    <div className="group relative flex items-start m-2">
      <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        {role === "user" ? <Icons.user className="size-4" /> : <Icons.bot />}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden">
        <MessageComponent
          message={content}
          isStreamFinished={isStreamFinished}
        />
      </div>
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
    <div className="bg-muted/50 w-full min-h-[calc(100vh-theme(spacing.18))]">
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className="p-2 flex flex-col max-w-2xl mx-auto w-screen"
      >
        <Input
          value={currentApiKey}
          placeholder="Enter Your API Key"
          onChange={handleUpdateApiKey}
        />
        <div className="pb-[200px] pt-4 md:pt-10">
          {messagesWithoutSystem.map((message, index) => {
            const isStreamFinished =
              ["user", "system"].includes(message.role) ||
              index < messagesWithoutSystem.length - 1 ||
              !isLoading;
            return (
              <div key={message.id}>
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreamFinished={isStreamFinished}
                />
                {index != messagesWithoutSystem.length - 1 && (
                  <div className="shrink-0 bg-border h-[1px] w-full my-4"></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="w-full fixed bottom-0">
          <div className="sm:max-w-2xl">
            <div className="border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
              <div className="bg-background relative flex max-h-60 w-full grow flex-col overflow-hidden pr-8 sm:rounded-md sm:border sm:pr-12">
                <Textarea
                  placeholder="What would you like to know?"
                  value={input}
                  onChange={handleInputChange}
                  className="min-h-[60px] w-[calc(100%-theme(spacing.6))] focus-visible:ring-0 resize-none bg-transparent pr-4 py-[1.1rem] focus-within:outline-none sm:text-sm border-none"
                />
                <Button
                  disabled={isLoading || !input}
                  className="absolute right-0 top-[20px] sm:right-4"
                  type="submit"
                >
                  Start
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
