import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const sql = neon(connectionString);

const newImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
];

// Fetch current row
const rows = await sql.query("SELECT id, data FROM kiraylink_properties WHERE id = 'prop-custom-1793453047583'");
if (rows.length > 0) {
  const currentData = rows[0].data;
  currentData.imageUrl = newImages[0];
  currentData.images = newImages;

  await sql.query(
    "UPDATE kiraylink_properties SET data = $1 WHERE id = 'prop-custom-1793453047583'",
    [JSON.stringify(currentData)]
  );
  console.log("Updated prop-custom-1793453047583 with valid Unsplash photos.");
} else {
  console.log("Property not found.");
}
