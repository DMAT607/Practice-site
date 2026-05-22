import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import "./cron/cleanupCron.js";

const app = express();
app.use(cors({
    origin: "http://localhost:9999",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
