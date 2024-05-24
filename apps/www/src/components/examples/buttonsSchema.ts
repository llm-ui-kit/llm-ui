import z from "zod";

export const buttonsSchema = z.object({
  t: z.literal("btn"),
  btns: z.array(z.object({ text: z.string() })),
});
