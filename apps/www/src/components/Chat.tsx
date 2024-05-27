import { Message as MessageComponent } from "@/components/demo/message/Message";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Icons } from "@/icons";
import { nanoid, type Message } from "ai";
import { useChat } from "ai/react";
import * as React from "react";
import * as R from "remeda";

const ChatMessage: React.FC<{
  message: Message;
  isStreamFinished: boolean;
}> = ({ message, isStreamFinished }) => {
  const { role, content } = message;
  return (
    <div className="group relative flex items-start m-2">
      <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        {role === "user" ? (
          <Icons.user className="size-4" />
        ) : (
          <Icons.bot className="size-4" />
        )}
      </div>
      <div className="ml-4 flex-1 space-y-2">
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
  const reversedMessagesWithoutSystem = R.reverse(messagesWithoutSystem);
  const isLastElement = (index: number) => index != 0;
  return (
    <div className="bg-muted/50 relative w-full min-h-[calc(100vh-theme(spacing.18))]">
      <div className="absolute top-4 left-4">
        <Input
          value={currentApiKey}
          className="focus-within:border-white"
          placeholder="Enter Your API Key"
          onChange={handleUpdateApiKey}
        />
      </div>
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className="p-2 flex flex-col max-w-2xl mx-auto"
      >
        {reversedMessagesWithoutSystem.length != 0 && (
          <div className="pb-[200px] h-screen pt-4 md:pt-20">
            {/* Col-reverse is used to enable automatic scrolling as content populates the div */}
            <div className="overflow-y-auto flex flex-col-reverse h-full">
              {reversedMessagesWithoutSystem.map((message, index) => {
                const isStreamFinished =
                  ["user", "system"].includes(message.role) ||
                  index > reversedMessagesWithoutSystem.length - 1 ||
                  !isLoading;
                return (
                  <div key={message.id}>
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isStreamFinished={isStreamFinished}
                    />
                    {isLastElement(index) && (
                      <div className="shrink-0 bg-border h-[1px] w-full my-4"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="w-2/3 m-auto inset-x-0 fixed bottom-0">
          <div>
            <div className="bg-background flex flex-col overflow-hidden max-h-60 focus-within:border-white relative px-4 py-2 shadow-lg mb-4 sm:rounded-xl sm:border md:py-4">
              <Textarea
                placeholder="What would you like to know?"
                value={input}
                onChange={handleInputChange}
                className="min-h-[60px] w-[calc(100%-theme(spacing.18))] focus-visible:ring-0 resize-none bg-transparent focus-within:outline-none sm:text-base border-none"
              />
              <Button
                disabled={isLoading || !input}
                className="absolute right-0 bottom-2 sm:right-4"
                type="submit"
              >
                Run <Icons.return className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
