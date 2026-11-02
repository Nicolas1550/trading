import pg from "pg";
import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const line = env.split(/\r?\n/).find(x => x.trim().startsWith("DATABASE_URL="));

if (!line) throw new Error("DATABASE_URL no encontrada");

const url = line.substring(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");

const pool = new pg.Pool({
  connectionString: url,
  connectionTimeoutMillis: 10000
});

try {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log("CONEXION A NEON EXITOSA");
  console.table(result.rows);
} catch (err) {
  console.error("ERROR:", err.message);
} finally {
  await pool.end();
}
