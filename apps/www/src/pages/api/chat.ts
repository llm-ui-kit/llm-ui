/* eslint-disable  @typescript-eslint/no-explicit-any */

import { OpenAIStream, StreamingTextResponse } from "ai";
import type { APIRoute } from "astro";
import OpenAI from "openai";
import z from "zod";

export const prerender = false;

const chatRequestSchema = z.object({
  messages: z.any(),
  apiKey: z.string(),
  model: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  const jsonBody = await request.json();
  const result = chatRequestSchema.safeParse(jsonBody);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        message: `Invalid request ${result.error.message}`,
      }),
      { status: 400 },
    );
  }
  const { apiKey, messages, model } = result.data;
  const isGptThreePointFive = model === "gpt-3.5-turbo";
  try {
    const openai = new OpenAI({
      apiKey:
        isGptThreePointFive && apiKey.length === 0
          ? process.env.OPENAI_API_KEY
          : apiKey,
    });
    const completion = await openai.chat.completions.create({
      model,
      messages: messages,
      stream: true,
    });
    const stream = OpenAIStream(completion);

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: `${error.message}`,
      }),
      { status: 500 },
    );
  }
};
