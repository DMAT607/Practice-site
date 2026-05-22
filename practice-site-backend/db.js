import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "shree",
  database: "practicedb",
});

pool.on("connect", () => {
  console.log("🧬 Connected to Postgres");
});
