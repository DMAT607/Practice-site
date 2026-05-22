import { pool } from "../db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from "./auth.tokens.js";

export const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  // 1. Find token in DB
  const { rows } = await pool.query(
    `
    SELECT *
    FROM refresh_tokens
    WHERE token_hash = $1
    `,
    [refreshTokenHash],
  );

  const tokenRow = rows[0];

  // 2. Token not found → invalid
  if (!tokenRow) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request, please login again.",
    });
  }

  // 3. Token already revoked → reuse detected
  if (tokenRow.revoked_at) {
    // 🚨 SECURITY EVENT: reuse detected
    await pool.query(
      `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1
        AND revoked_at IS NULL
      `,
      [tokenRow.user_id],
    );

    return res.status(401).json({
      success: false,
      message: "Refresh token reuse detected",
    });
  }

  // 4. Token expired
  if (new Date(tokenRow.expires_at) < new Date()) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired",
    });
  }

  // 5. Rotate token
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
  const newExpiresAt = getRefreshTokenExpiry();

  await pool.query(
    `
  INSERT INTO refresh_tokens (
    user_id,
    token_hash,
    expires_at,
    ip_address,
    user_agent
  )
  VALUES ($1, $2, $3, $4, $5)
  `,
    [
      tokenRow.user_id,
      newRefreshTokenHash,
      newExpiresAt,
      req.ip,
      req.headers["user-agent"],
    ],
  );
  // 6. Revoke old token
  await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW(),
        replaced_by_token = $1
    WHERE id = $2
    `,
    [newRefreshTokenHash, tokenRow.id],
  );

  // 7. Insert new token
  const { rows: userRows } = await pool.query(
    `
  SELECT id, email
  FROM users
  WHERE id = $1
  `,
    [tokenRow.user_id],
  );

  const user = userRows[0];

  // 8. Issue new access token
  const accessToken = generateAccessToken(user);

  // 9. Set new refresh token cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    success: true,
    accessToken,
  });
};
