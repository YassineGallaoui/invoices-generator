import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Generic message — never reveal whether the email exists
const INVALID_MSG = "Invalid email or password";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, message: INVALID_MSG });
  }

  const { email, password } = result.data;
  const sql = useDb();

  const rows = await sql`
    SELECT id, email, password_hash FROM users WHERE email = ${email} LIMIT 1
  `;

  const user = rows[0] as
    | { id: string; email: string; password_hash: string }
    | undefined;

  // Always run bcrypt compare to prevent timing attacks even when user not found
  const hashToCompare = user?.password_hash ?? "$2b$12$invalidhashpadding000000000000000000000000000000000000";
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!user || !valid) {
    throw createError({ statusCode: 401, message: INVALID_MSG });
  }

  await sql`UPDATE users SET last_login_at = now() WHERE id = ${user.id}`;
  await setUserSession(event, { user: { id: user.id, email: user.email } });
  return { ok: true };
});
