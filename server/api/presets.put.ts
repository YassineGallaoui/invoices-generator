import { z } from "zod";

const schema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { data } = schema.parse(await readBody(event));
  const sql = useDb();

  await sql`
    INSERT INTO user_presets (user_id, data, updated_at)
    VALUES (${session.user.id}, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (user_id) DO UPDATE
      SET data       = EXCLUDED.data,
          updated_at = now()
  `;

  return { ok: true };
});
