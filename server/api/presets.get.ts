export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const sql = useDb();
  const rows = await sql`
    SELECT data FROM user_presets
    WHERE user_id = ${session.user.id}
    LIMIT 1
  `;

  return (rows[0] as { data: unknown } | undefined)?.data ?? null;
});
