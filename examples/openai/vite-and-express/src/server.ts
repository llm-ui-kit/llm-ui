import express from "express";
import ViteExpress from "vite-express";

import "dotenv/config";
import OpenAI from "openai";
import { MARKDOWN_PROMPT, NEWLINE } from "./constants";

const openai = new OpenAI();

const app = express();

app.get("/api/openai", async (req, response) => {
  response.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Access-Control-Allow-Origin": "*",
    Connection: "keep-alive",
  });
  response.flushHeaders(); // flush the headers to establish SSE with client

  // Start the async operation to get data
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: MARKDOWN_PROMPT,
      },
    ],
    stream: true,
  });

  (async () => {
    for await (const chunk of completion) {
      const content = chunk.choices[0].delta.content;
      if (content !== undefined && content !== null) {
        // avoid newlines getting messed up
        const contentWithNewlines = content.replace(/\n/g, NEWLINE);

        response.write(`event: token\ndata: ${contentWithNewlines}\n\n`);
      }
    }
    response.write(`event: finished\ndata: true\n\n`);
    response.end();
  })();

  // Handle if client closes the connection
  req.on("close", () => {
    response.end();
  });
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on http://localhost:3000"),
);
