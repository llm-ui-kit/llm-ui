export const prerender = false;

import type { APIRoute } from "astro";
import { ChatRequest, db, eq } from "astro:db";
import OpenAI from "openai";

const NEWLINE = "$NEWLINE$";

// export const dynamic = "force-dynamic";

export const GET: APIRoute = async ({ request }) => {
  const { url } = await request;
  const params = new URL(url).searchParams;
  const id = Number(params.get("id"));
  const apiKey = params.get("apiKey") || "";
  const openai = new OpenAI({
    apiKey,
  });
  const chat = await db
    .select()
    .from(ChatRequest)
    .where(eq(ChatRequest.id, id));
  const { userContent, systemContent } = chat[0];
  if (!chat || !chat.length) {
    return new Response(
      JSON.stringify({
        message: "Not found",
      }),
      { status: 400 },
    );
  }

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemContent },
      {
        role: "user",
        content: userContent,
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
        await writer.write(
          encoder.encode(`event: token\ndata: ${contentWithNewlines}\n\n`),
        );
      }
    }

    await writer.write(encoder.encode(`event: finished\ndata: true\n\n`));
    await writer.close();
  })();
  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
};
