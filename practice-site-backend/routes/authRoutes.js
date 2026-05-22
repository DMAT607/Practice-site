import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/authController.js";
import { refresh } from "../utils/auth.refresh.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/refresh", refresh);
router.post("/signup", registerUser);

export default router;
