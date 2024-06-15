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
import { getMaskedKey } from "@/lib/maskKey";
import { cn } from "@/lib/utils";
import { nanoid, type Message } from "ai";
import { useChat } from "ai/react";
import * as React from "react";
import * as R from "remeda";
import {
  AutosizeTextarea,
  type AutosizeTextAreaRef,
} from "../ui/custom/AutosizeTextarea";
import { EmptyState } from "./EmptyState";

const IS_SERVER = typeof window === "undefined";
const CHAT_OPENAI_API_KEY = "CHAT_OPENAI_API_KEY";
const LAST_MODEL = "LAST_MODEL";
const CHAT_GPT_MODELS = ["gpt-3.5-turbo", "gpt-4-turbo", "gpt-4o"];

const CONTAINER_CLASSES = "mx-auto max-w-2xl container";

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
          "flex space-y-2 min-w-0", // min-w-0 stops overflows
          role === "user" && "bg-background rounded-lg px-4 py-1",
          role !== "user" && "flex-1",
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
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const messagesDivRef = React.useRef<HTMLInputElement>(null);
  const messageTextAreaRef = React.useRef<AutosizeTextAreaRef>(null);
  const storage = !IS_SERVER ? window.localStorage : null;
  const [currentApiKey, setCurrentApiKey] = React.useState<string>(
    storage?.getItem(CHAT_OPENAI_API_KEY) ?? "",
  );
  const [selectedChatGptModel, setSelectedChatGptModel] =
    React.useState<string>(storage?.getItem(LAST_MODEL) ?? CHAT_GPT_MODELS[0]);
  const [systemMessage, setSystemMessage] = React.useState<string>("");
  const [missingApiKey, setMissingApiKey] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error>();

  React.useEffect(() => {
    const textArea = messageTextAreaRef.current?.textArea;
    if (textArea) {
      textArea.focus();
    }
  }, []);

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
      onError: (error: Error) => {
        setError(JSON.parse(error.message));
      },
    });

  const scrollToBottom = () => {
    if (messagesDivRef.current) {
      messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
    }
  };

  const handleUpdateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setCurrentApiKey(newApiKey);

    e.currentTarget.blur();
  };

  const handleUpdateChatGptModel = (value: string) => {
    setMissingApiKey(false);
    setSelectedChatGptModel(value);
    storage?.setItem(LAST_MODEL, value);
  };

  const onSubmit = (e: React.FormEvent) => {
    console.log("zzz subbmitting");
    if (
      currentApiKey.length === 0 &&
      selectedChatGptModel != CHAT_GPT_MODELS[0]
    ) {
      setMissingApiKey(true);
    } else {
      setError(undefined);
      setMissingApiKey(false);
      storage?.setItem(CHAT_OPENAI_API_KEY, currentApiKey);
      scrollToBottom();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const messagesWithoutSystem = messages.slice(1);
  const reversedMessagesWithoutSystem = R.reverse(messagesWithoutSystem);
  return (
    <div className="flex flex-col bg-muted/50 relative w-full h-full">
      <div
        className={`flex flex-col items-start min-[1150px]:absolute min-[1150px]:pl-4 pt-4 max-[1150px]:mx-auto max-[1150px]:max-w-2xl max-[1150px]:container`}
      >
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
        {selectedChatGptModel !== CHAT_GPT_MODELS[0] && (
          <>
            <Input
              value={getMaskedKey(currentApiKey)}
              onKeyDown={(e) => {
                if (!((e.ctrlKey || e.metaKey) && e.key === "v")) {
                  e.preventDefault();
                }
              }}
              onFocus={(e) => {
                e.currentTarget.select();
              }}
              autoComplete="off"
              className={cn(
                "focus-within:border-white",
                missingApiKey && "border-destructive",
              )}
              placeholder="Paste Your API Key"
              onChange={handleUpdateApiKey}
              onDragStart={(e) => e.preventDefault()}
              onDragOver={(e) => e.preventDefault()}
              onMouseDown={(e) => {
                e.preventDefault();
                e.currentTarget.focus();
              }}
            />
            {missingApiKey && (
              <label className="w-full text-center mt-2 text-destructive">
                Please paste an API key
              </label>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col flex-1 overflow-y-hidden">
        {/* Col-reverse is used to enable automatic scrolling as content populates the div */}
        <div
          ref={messagesDivRef}
          className="flex flex-1 flex-col-reverse overflow-y-auto pt-4 pb-3"
        >
          {/* This div takes up all the remaining space so the messages start at the top */}
          <div className={`flex flex-1 flex-col justify-center`}>
            {messages.length <= 1 && (
              <EmptyState
                onExampleClick={(example) => {
                  setSystemMessage(example.systemPrompt);
                  if (example.userPrompt) {
                    handleInputChange({
                      target: { value: example.userPrompt },
                    } as React.ChangeEvent<HTMLTextAreaElement>);
                    if (submitButtonRef?.current) {
                      setTimeout(() => submitButtonRef?.current?.click(), 1);
                    }
                  }
                }}
              />
            )}
          </div>
          {reversedMessagesWithoutSystem.map((message, index) => {
            const { role } = message;
            const isStreamFinished =
              ["user", "system"].includes(role) ||
              index > reversedMessagesWithoutSystem.length - 1 ||
              !isLoading;

            return (
              <div key={message.id}>
                <div
                  className={`shrink-0 bg-border h-[1px] w-full my-4 ${CONTAINER_CLASSES}`}
                ></div>
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreamFinished={isStreamFinished}
                  className={cn(
                    CONTAINER_CLASSES,
                    role === "user" && "justify-end",
                  )}
                />
              </div>
            );
          })}
          <div className={`flex gap-2 flex-col w-full ${CONTAINER_CLASSES}`}>
            <div className="bg-background overflow-hidden focus-within:border-white px-1 py-1 shadow-lg mb-2 sm:rounded-xl sm:border md:py-1 ">
              <AutosizeTextarea
                id="system-instructions"
                disabled={messages.length > 1}
                placeholder="System prompt"
                rows={1}
                autoComplete="off"
                value={systemMessage}
                style={{ height: 36 }}
                minHeight={36}
                maxHeight={200}
                onChange={(e) => {
                  setSystemMessage(e.target.value);
                }}
                className="focus-visible:ring-0 resize-none bg-transparent focus-within:outline-none sm:text-sm border-none"
              />
            </div>
          </div>
        </div>
        <div className={`flex flex-col w-full ${CONTAINER_CLASSES}`}>
          {error && (
            <div className="text-destructive text-center mb-4 font-bold p-2">
              <p>{error?.message}</p>
            </div>
          )}
          <div className="bg-background flex flex-row overflow-hidden focus-within:border-white px-3 py-1 shadow-lg mb-2 sm:mb-6 sm:rounded-xl sm:border md:py-3">
            <AutosizeTextarea
              ref={messageTextAreaRef}
              onKeyDown={(e) => {
                if (isLoading) {
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }}
              autoComplete="off"
              placeholder="Message ChatGPT"
              value={input}
              rows={1}
              style={{ height: 42 }}
              minHeight={42}
              maxHeight={200}
              onChange={handleInputChange}
              className="focus-visible:ring-0 pr-0 resize-none bg-transparent focus-within:outline-none sm:text-base border-none"
            />
            <Button
              ref={submitButtonRef}
              disabled={isLoading || !input}
              className="self-end"
              onClick={onSubmit}
            >
              Run <Icons.return className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
