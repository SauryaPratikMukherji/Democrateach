import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-change-this-in-production"
);

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    return payload as { userId: string; email: string; name: string };
  } catch (error) {
    return null;
  }
}
