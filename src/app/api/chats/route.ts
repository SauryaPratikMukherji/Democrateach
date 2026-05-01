import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Fetch chats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      console.error("Chat POST: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists in DB to prevent foreign key errors if DB was reset
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      console.error("Chat POST: User in session not found in database", session.userId);
      return NextResponse.json({ error: "User not found. Please log in again." }, { status: 401 });
    }

    const { title } = await request.json();

    const chat = await prisma.chat.create({
      data: {
        title: title || "New Chat",
        userId: session.userId,
      },
    });

    return NextResponse.json(chat);
  } catch (error: any) {
    console.error("Create chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
