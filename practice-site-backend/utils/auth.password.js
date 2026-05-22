// auth.passwords.js
import bcrypt from "bcrypt";

export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}