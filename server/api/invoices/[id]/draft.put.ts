import { z } from "zod";

const bodySchema = z.object({
  draft: z.record(z.string(), z.unknown()),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const id = getRouterParam(event, "id");
  const { draft } = bodySchema.parse(await readBody(event));
  const sql = useDb();

  await sql`
    UPDATE invoices
    SET draft_data = ${JSON.stringify(draft)}::jsonb,
        updated_at = now()
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  return { ok: true };
});
