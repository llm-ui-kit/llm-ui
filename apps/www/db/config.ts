import { column, defineDb, defineTable } from "astro:db";

const WaitingList = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { WaitingList },
});
