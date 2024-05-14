import { ChatRequest, WaitingList, db } from "astro:db";

// https://astro.build/db/seed
export default async () => {
  await db
    .insert(WaitingList)
    .values([
      { email: "johndoe@example.com" },
      { email: "janedoe@example.com" },
    ]);
  await db.insert(ChatRequest).values([
    {
      systemContent: "You are a helpful assistant.",
      userContent: "Show me a demo of all the markdown header sizes",
    },
  ]);
};
