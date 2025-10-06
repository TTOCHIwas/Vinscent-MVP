import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: "127.0.0.1",
    port: 3306,
    user: "vinscent",
    password: "vinscent",
    database: "vinscent",
  },
} satisfies Config;