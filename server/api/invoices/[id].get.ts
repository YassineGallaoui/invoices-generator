export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const id = getRouterParam(event, "id");
  const sql = useDb();

  const rows = await sql`
    SELECT data, draft_data FROM invoices
    WHERE id = ${id} AND user_id = ${session.user.id}
    LIMIT 1
  `;

  if (!rows[0]) {
    throw createError({ statusCode: 404, message: "Invoice not found" });
  }

  const row = rows[0] as { data: unknown; draft_data: unknown };
  return { data: row.data, draftData: row.draft_data ?? null };
});
