import { z } from "zod";

const schema = z.object({
  id: z.string().uuid(),
  data: z.record(z.string(), z.unknown()),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: "Invalid invoice data" });
  }

  const { id, data } = result.data;
  const sql = useDb();

  await sql`
    INSERT INTO invoices (id, user_id, data, draft_data, updated_at)
    VALUES (${id}, ${session.user.id}, ${JSON.stringify(data)}, null, now())
    ON CONFLICT (id) DO UPDATE
      SET data       = EXCLUDED.data,
          draft_data = null,
          updated_at = now()
  `;

  return { ok: true };
});
