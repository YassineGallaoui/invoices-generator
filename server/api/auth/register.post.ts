import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message ?? "Invalid input",
    });
  }

  const { email, password } = result.data;
  const sql = useDb();

  // Check for existing account
  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    throw createError({
      statusCode: 409,
      message: "An account with this email already exists",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const rows = await sql`
    INSERT INTO users (email, password_hash, last_login_at)
    VALUES (${email}, ${passwordHash}, now())
    RETURNING id, email
  `;

  const user = rows[0] as { id: string; email: string };
  await setUserSession(event, { user: { id: user.id, email: user.email } });

  return { ok: true };
});
