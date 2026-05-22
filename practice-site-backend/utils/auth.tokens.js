import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_TTL = "1m"; // short-lived
const REFRESH_TOKEN_TTL_DAYS = 7;

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiry() {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return expires;
}