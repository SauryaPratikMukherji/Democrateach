import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      include: {
        candidates: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(parties, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate data" },
      { status: 500 }
    );
  }
}
