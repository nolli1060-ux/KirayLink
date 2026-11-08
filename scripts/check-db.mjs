import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const sql = neon(connectionString);
const rows = await sql.query("SELECT * FROM kiraylink_properties");
console.log(JSON.stringify(rows, null, 2));
