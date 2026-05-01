const { Client } = require("@neondatabase/serverless");
require("dotenv").config();

async function check() {
  console.log("DB URL:", process.env.DATABASE_URL?.substring(0, 20));
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();
    const res = await client.query("SELECT 1");
    console.log("Success:", res.rows);
    await client.end();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

check();
