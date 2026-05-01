// This script tests the app's prisma client configuration
const { prisma } = require('../src/lib/prisma');

async function test() {
  console.log("Testing app prisma client...");
  try {
    const count = await prisma.user.count();
    console.log("Success! User count:", count);
  } catch (err) {
    console.error("Prisma Client Error:", err);
  }
}

test();
