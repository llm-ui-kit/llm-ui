import { WaitingList, db } from "astro:db";

// https://astro.build/db/seed
export default async () => {
  await db
    .insert(WaitingList)
    .values([
      { email: "johndoe@example.com" },
      { email: "janedoe@example.com" },
    ]);
};
