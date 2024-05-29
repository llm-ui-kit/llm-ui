import { Message as MessageComponent } from "@/components/demo/message/Message";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { Icons } from "@/icons";
import { cn } from "@/lib/utils";
import { nanoid, type Message } from "ai";
import { useChat } from "ai/react";
import * as React from "react";
import * as R from "remeda";
import { AutosizeTextarea } from "./ui/custom/AutosizeTextarea";

const IS_SERVER = typeof window === "undefined";
const CHAT_OPENAI_API_KEY = "CHAT_OPENAI_API_KEY";
const CHAT_GPT_MODELS = ["gpt-3.5-turbo", "gpt-4-turbo", "gpt-4o"];

const ChatMessage: React.FC<{
  message: Message;
  isStreamFinished: boolean;
  className?: string;
}> = ({ message, isStreamFinished, className }) => {
  const { role, content } = message;
  return (
    <div className={cn("group relative flex gap-4 items-start m-2", className)}>
      {role === "assistant" && (
        <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
          <Icons.bot className="size-4" />
        </div>
      )}
      <div
        className={cn(
          "space-y-2 overflow-x-hidden",
          role === "user" && "bg-black rounded-lg px-4 py-1",
        )}
      >
        <MessageComponent
          message={content}
          isStreamFinished={isStreamFinished}
        />
      </div>
    </div>
  );
};

export const Chat = () => {
  const storage = !IS_SERVER ? window.localStorage : null;
  const [currentApiKey, setCurrentApiKey] = React.useState<string>(
    storage?.getItem(CHAT_OPENAI_API_KEY) ?? "",
  );
  const [selectedChatGptModel, setSelectedChatGptModel] =
    React.useState<string>(CHAT_GPT_MODELS[0]);
  const [systemMessage, setSystemMessage] = React.useState<string>("");
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: nanoid(),
          role: "system",
          content:
            systemMessage.length !== 0
              ? systemMessage
              : "You are a helpful assistant",
        },
      ],
      body: {
        apiKey: currentApiKey,
        model: selectedChatGptModel,
      },
    });

  const handleUpdateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setCurrentApiKey(newApiKey);
  };

  const handleUpdateChatGptModel = (value: string) => {
    setSelectedChatGptModel(value);
  };

  const messagesWithoutSystem = messages.slice(1);
  const reversedMessagesWithoutSystem = R.reverse(messagesWithoutSystem);
  return (
    <div className="flex bg-muted/50 relative overflow-y-hidden w-full h-[calc(100vh-theme(spacing.18)-2px)]">
      <div className="absolute top-4 left-4">
        <Select onValueChange={handleUpdateChatGptModel}>
          <SelectTrigger className="w-[180px] mb-4">
            {selectedChatGptModel}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {CHAT_GPT_MODELS.map((model: string) => {
                return (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          value={currentApiKey}
          className="focus-within:border-white"
          placeholder="Enter Your API Key"
          onChange={handleUpdateApiKey}
        />
      </div>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          storage?.setItem(CHAT_OPENAI_API_KEY, currentApiKey);
          handleSubmit(e);
        }}
        className="flex flex-col flex-1"
      >
        {/* Col-reverse is used to enable automatic scrolling as content populates the div */}
        <div className="flex flex-1 flex-col-reverse overflow-y-auto pt-4 pb-3">
          {/* This div takes up all the remaining space so the messages start at the top */}
          <div className="flex flex-1" />
          {reversedMessagesWithoutSystem.map((message, index) => {
            const { role } = message;
            const isStreamFinished =
              ["user", "system"].includes(role) ||
              index > reversedMessagesWithoutSystem.length - 1 ||
              !isLoading;

            return (
              <div key={message.id}>
                <div className="shrink-0 bg-border h-[1px] w-full my-4 mx-auto max-w-2xl"></div>
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreamFinished={isStreamFinished}
                  className={cn(
                    "mx-auto max-w-2xl",
                    role === "user" && "justify-end",
                  )}
                />
              </div>
            );
          })}
          <div className="flex gap-2 flex-col max-w-2xl mx-auto w-full">
            <div className="bg-background overflow-hidden focus-within:border-white px-1 py-1 shadow-lg mb-2 sm:rounded-xl sm:border md:py-1 ">
              <AutosizeTextarea
                id="system-instructions"
                disabled={messages.length > 1}
                placeholder="System prompt"
                rows={1}
                value={systemMessage}
                minHeight={21}
                maxHeight={200}
                onChange={(e) => {
                  setSystemMessage(e.target.value);
                }}
                className="focus-visible:ring-0 resize-none bg-transparent focus-within:outline-none sm:text-sm border-none"
              />
            </div>
          </div>
        </div>
        <div className="bg-background w-full flex flex-col overflow-hidden focus-within:border-white relative px-3 py-1 shadow-lg mb-6 sm:rounded-xl sm:border md:py-3 max-w-2xl mx-auto">
          <AutosizeTextarea
            placeholder="Message ChatGPT"
            value={input}
            rows={1}
            style={{ height: 42 }}
            minHeight={42}
            maxHeight={200}
            onChange={handleInputChange}
            className="focus-visible:ring-0 resize-none bg-transparent focus-within:outline-none sm:text-base border-none"
          />
          <Button
            disabled={isLoading || !input}
            className="absolute right-0 bottom-3 sm:right-4"
            type="submit"
          >
            Run <Icons.return className="size-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};
