import OpenAI from "openai";

const NEWLINE = "$NEWLINE$";

const openai = new OpenAI();

// should be declared (!)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: "Show me a demo of all the markdown header sizes",
      },
    ],
    stream: true,
  });

  (async () => {
    for await (const chunk of completion) {
      const content = chunk.choices[0].delta.content;
      if (content !== undefined && content !== null) {
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
}
