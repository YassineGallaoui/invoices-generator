export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const id = getRouterParam(event, "id");
  const sql = useDb();

  await sql`
    UPDATE invoices
    SET draft_data = null,
        updated_at = now()
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  return { ok: true };
});
