import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    console.log("[SIGNUP] Received request for:", email);
    const hashedPassword = await bcrypt.hash(password, 4);
    console.log("[SIGNUP] Password hashed. Saving to SQLite...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("[SIGNUP] Success! User ID:", user.id);

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("NUCLEAR SIGNUP ERROR:", error);
    return NextResponse.json(
      { error: `Signup failed: ${error.message}` },
      { status: 500 }
    );
  }
}
