import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export function useDb() {
  if (!_sql) {
    const config = useRuntimeConfig();
    if (!config.databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    _sql = neon(config.databaseUrl);
  }
  return _sql;
}
