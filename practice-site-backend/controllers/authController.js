import bcrypt from "bcrypt";
import { pool } from "../db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "../utils/auth.tokens.js";
import { findUserByEmail } from "../utils/user.repository.js";
import { verifyPassword } from "../utils/auth.password.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // 1. Fetch user
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // 2. Verify password
  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // 3. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();

  // 4. Store refresh token
  await pool.query(
    `
    SELECT functions.create_refresh_token($1, $2, $3, $4, $5)
    `,
    [user.id, refreshTokenHash, expiresAt, req.ip, req.headers["user-agent"]],
  );

  // 5. Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: "lax",
    path: "/",
  });

  // 6. Respond
  return res.json({
    success: true,
    accessToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
};

export const registerUser = async (req, res) => {
  const { email, full_name, mobile, password } = req.body;

  if (!email || !password || !full_name || !mobile) {
    return res
      .status(400)
      .json({ success: false, message: "User registration failed!" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    const existing = await pool.query("SELECT functions.get_user_by_email($1)", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "SELECT functions.register_user($1, $2, $3, $4)",
      [full_name, mobile, email, passwordHash],
    );

    res.status(200).json({
      success: true,
      user: result.rows[0],
      message: "Account successfully created!",
    });
  } catch (error) {
    console.error("Register error: ", error);
    res.status(500).json({
      success: false,
      error: "Something went wrong!",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    await pool.query(
      `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1
      `,
      [refreshTokenHash],
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error: ", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout",
    });
  }
};
