import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import * as React from "react";

export const Chat = () => {
  const [userContent, setUserContent] = React.useState<string>("");
  const [currentId, setCurrentId] = React.useState<number>();
  const [currentApiKey, setCurrentApiKey] = React.useState<string>();
  const [output, setOutput] = React.useState<string>("");
  // const [isStreamFinished, setIsStreamFinished] =
  //   React.useState<boolean>(false);

  React.useEffect(() => {
    setOutput("");
    if (currentId && currentApiKey) {
      const eventSource = new EventSource(
        `/api/chat/openai?id=${currentId}&apiKey=${currentApiKey}`,
      );

      eventSource.addEventListener("error", () => eventSource.close());

      eventSource.addEventListener("token", (e) => {
        // avoid newlines getting messed up
        const token = e.data.replaceAll("$NEWLINE$", "\n");
        setOutput((prevResponse) => `${prevResponse}${token}`);
      });

      eventSource.addEventListener("finished", (e) => {
        console.log("finished", e);
        eventSource.close();
        // setIsStreamFinished(true);
      });

      () => eventSource.close();
    }
  }, [currentId, currentApiKey]);

  const handleUpdateUserContent = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newUserContent = e.target.value;
    setUserContent(newUserContent);
  };

  const handleUpdateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setCurrentApiKey(newApiKey);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = { userContent, systemContent: "You are a helpful assistant." };
    const response = await fetch("/api/chatRequest", {
      method: "POST",
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const { id } = data;
    setCurrentId(id);
  };

  console.log(output);

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Textarea
          placeholder="What would you like to know?"
          value={userContent}
          onChange={handleUpdateUserContent}
        />
        <label>API Key</label>
        <Input onChange={handleUpdateApiKey} />
        <Button type="submit">Start</Button>
      </form>
    </div>
  );
};
