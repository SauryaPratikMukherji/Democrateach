import { prisma } from "../src/lib/prisma";

async function test() {
  const email = "sauryapratikmukherji.official@gmail.com";
  console.log("Checking for user:", email);
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log("User found:", JSON.stringify(user));
  } catch (err) {
    console.error("Prisma Client Error:", err);
  } finally {
    process.exit(0);
  }
}

test();
