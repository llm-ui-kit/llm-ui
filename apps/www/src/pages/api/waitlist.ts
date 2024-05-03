export const prerender = false;

import type { APIRoute } from "astro";
import { WaitingList, db, sql } from "astro:db";

export const GET: APIRoute = async () => {
  const waiting = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(WaitingList);

  if (!waiting) {
    return new Response(
      JSON.stringify({
        message: "Not found",
      }),
      { status: 400 },
    );
  }

  return new Response(
    JSON.stringify({
      count: waiting[0].count,
    }),
    { status: 200 },
  );
};

export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();

  if (!email) {
    return new Response(
      JSON.stringify({
        message: "Email field required.",
      }),
      { status: 400 },
    );
  }

  if (typeof email === "string") {
    try {
      await db.insert(WaitingList).values({ email });
    } catch (error) {
      // return error if user insert same email. email is unique!
      return new Response(
        JSON.stringify({
          message: "Already subscribed",
        }),
        { status: 400 },
      );
    }
  }

  return new Response(
    JSON.stringify({
      message: "success",
    }),
    { status: 200 },
  );
};
