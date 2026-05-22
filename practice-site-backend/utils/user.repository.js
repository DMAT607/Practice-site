// user.repository.js
import { pool } from "../db.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `
    SELECT id, email, password_hash
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}