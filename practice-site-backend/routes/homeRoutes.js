import express from "express";
import { userDetails, playersList, deletePlayer } from "../controllers/homeController.js";
import { checkAuth } from "../middlewares/checkAuth.js";

const router = express.Router();

router.post("/players_list", checkAuth, playersList);
router.post("/delete_player", checkAuth, deletePlayer);
router.get("/user_details", checkAuth, userDetails);

export default router;
