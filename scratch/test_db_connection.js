const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { Pool } = require("@neondatabase/serverless");
require("dotenv").config();

async function testDB() {
  const url = process.env.DATABASE_URL;
  console.log("URL Start:", url ? url.substring(0, 20) : "UNDEFINED");
  
  if (!url) {
    console.error("FATAL: DATABASE_URL is not set!");
    return;
  }

  // FORCE use the string
  const pool = new Pool({ connectionString: url });
  
  try {
    const client = await pool.connect();
    console.log("✅ Pool Connection Successful");
    client.release();
  } catch (e) {
    console.error("❌ Pool Connection Failed:", e);
  }
}

testDB();
