const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Set the WebSocket implementation for neondatabase/serverless
const connectionString = "postgresql://neondb_owner:npg_QpJIj34Erewy@ep-snowy-violet-aorb0s9w.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  console.log("Starting DB test...");
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Connecting to prisma...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (err) {
    console.error("DB Test Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
