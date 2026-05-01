import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { title, description, location, image, userId } = await request.json();

    if (!title || !description || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let imageAnalysis = null;
    let imageUrl = null;

    // Process image with Gemini if provided
    if (image) {
      imageUrl = image;
      const base64Data = image.split(",")[1];
      
      if (base64Data) {
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const prompt = `You are an expert AI observing potential election malpractice. 
Analyze the provided image in the context of an election complaint.
The complaint states: "${title} - ${description}" at "${location}".
Identify any suspicious activities, illegal campaigning, bribery, booth capturing, or violence in the image.
Provide a professional, objective analysis of what is visible to be used for official reporting.`;

        try {
          const result = await model.generateContent({
            contents: [{
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: image.split(";")[0].split(":")[1]
                  }
                }
              ]
            }]
          });
          imageAnalysis = result.response.text();
        } catch (err) {
          console.error("Gemini connection error during complaint analysis", err);
        }
      }
    }

    // Resolve user ID
    let resolvedUserId = userId;
    
    // If anonymous, ensure we have an anonymous user in the DB to satisfy foreign key
    if (resolvedUserId === "anonymous") {
      let anonUser = await prisma.user.findUnique({ where: { email: "anonymous@democrateach.org" }});
      if (!anonUser) {
        anonUser = await prisma.user.create({
          data: {
            name: "Anonymous User",
            email: "anonymous@democrateach.org",
            password: "no-password", // Dummy password
          }
        });
      }
      resolvedUserId = anonUser.id;
    }

    // Save complaint
    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        location,
        imageUrl,
        imageAnalysis,
        userId: resolvedUserId,
      },
    });

    return NextResponse.json({
      message: "Complaint recorded successfully",
      id: complaint.id,
      imageAnalysis: complaint.imageAnalysis,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Complaint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process complaint" },
      { status: 500 }
    );
  }
}
