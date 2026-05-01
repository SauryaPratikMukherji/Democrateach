const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const connectionString = "postgresql://neondb_owner:npg_QpJIj34Erewy@ep-snowy-violet-aorb0s9w.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
process.env.DATABASE_URL = connectionString;

async function test() {
  // Try passing it directly to Pool if the object shorthand is failing for some reason
  const pool = new Pool({ connectionString: connectionString });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const email = "sauryapratikmukherji.official@gmail.com";
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log("User found:", JSON.stringify(user));
  } catch (err) {
    console.error("DB Test Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
