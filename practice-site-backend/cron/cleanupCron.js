import cron from "node-cron";
import { pool } from "../db.js";

cron.schedule("*/10 * * * * *", async () => {
  await pool.query(`
  UPDATE public.refresh_tokens SET revoked_at = NOW()
  WHERE expires_at < NOW() AND revoked_at IS NULL;
`);
console.log('Running cron cleanup')
});
