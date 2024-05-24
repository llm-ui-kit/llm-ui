import z from "zod";

export const buttonsSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ text: z.string() })),
});
