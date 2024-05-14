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
    await db.insert(ChatRequest).values({ userContent, systemContent });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error",
      }),
      { status: 400 },
    );
  }

  return new Response(
    JSON.stringify({
      message: "success",
    }),
    { status: 200 },
  );
};
