export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const sql = useDb();
  const rows = await sql`
    SELECT id,
           data->>'updatedAt'    AS "updatedAt",
           data->'preheader'->>'text'         AS "preheaderText",
           data->'preheader'->>'invoiceNumber' AS "invoiceNumber"
    FROM invoices
    WHERE user_id = ${session.user.id}
    ORDER BY updated_at DESC
  `;

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    label: (r.preheaderText as string) || "Invoice",
    invoiceNumber: (r.invoiceNumber as string) ?? "",
    updatedAt: r.updatedAt as string,
  }));
});
