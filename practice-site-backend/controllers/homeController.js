import { pool } from "../db.js";
import { hashRefreshToken } from "../utils/auth.tokens.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export const playersList = async (req, res) => {
  const {sortBy, sortDir, currentPage, pageSize} = req.body
  const players = await pool.query("SELECT * FROM functions.get_players_list($1, $2, $3, $4)", [sortBy, sortDir, currentPage, pageSize]);
  const total_count = await pool.query("SELECT COUNT(*) FROM public.players");
  if (players.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No players found",
    });
  }
  res.status(200).json({
    success: true,
    players: players.rows,
    total_count: total_count.rows[0].count || 0
  });
};

export const userDetails = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const userRows = await pool.query('SELECT * FROM functions.get_user_by_token($1)', [hashRefreshToken(refreshToken)]);
  
  const userData = userRows.rows[0];
  if (!userData) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    })
  }
  return res.status(200).json({
    success: true,
    user: userData,
  });
};

export const deletePlayer = async (req, res) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({
      success: false,
      message: "Player ID is required",
    });
  }
  try {
    await pool.query('UPDATE public.players SET is_active = FALSE WHERE id = $1', [playerId]);
    return res.status(200).json({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting player:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
