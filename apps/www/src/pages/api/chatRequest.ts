export const prerender = false;

import type { APIRoute } from "astro";
import { ChatRequest, db } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
  const { userContent, systemContent } = await request.json();
  if (!userContent) {
    return new Response(
      JSON.stringify({
        message: "Field required.",
      }),
      { status: 400 },
    );
  }

  try {
    const newChatEntry = await db
      .insert(ChatRequest)
      .values({ userContent, systemContent })
      .returning();
    const { id } = newChatEntry[0];
    return new Response(
      JSON.stringify({
        message: "success",
        id,
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error",
      }),
      { status: 400 },
    );
  }
};
