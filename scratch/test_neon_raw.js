const { neon, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const url = "postgresql://neondb_owner:npg_QpJIj34Erewy@ep-snowy-violet-aorb0s9w.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  console.log("Testing raw neon query...");
  const sql = neon(url);
  try {
    const result = await sql`SELECT 1 as result`;
    console.log("Success! Result:", result);
  } catch (err) {
    console.error("Neon Query Error:", err);
  }
}

test();
