export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const sql = useDb();
  const rows = await sql`
    SELECT email, created_at, last_login_at
    FROM users
    WHERE id = ${session.user.id}
    LIMIT 1
  `;

  const user = rows[0] as
    | { email: string; created_at: string; last_login_at: string | null }
    | undefined;

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return {
    email: user.email,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  };
});
