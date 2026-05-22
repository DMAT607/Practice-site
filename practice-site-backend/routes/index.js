import express from "express";
import authRoutes from "./authRoutes.js";
import homeRoutes from "./homeRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/home", homeRoutes);

export default router;
