import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SEARCH_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Initialize Gemini lazily to ensure env is loaded
let genAI: any = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY is missing in environment variables");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

async function fetchWebSearch(query: string) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    const response = await fetch(url, {
      headers: { 'User-Agent': SEARCH_USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(id);
    const html = await response.text();
    const $ = cheerio.load(html);
    const snippets: string[] = [];
    $('.result__snippet, .web-result__snippet').each((i, el) => {
      snippets.push($(el).text().trim());
    });
    if (snippets.length === 0) {
      // Fallback for different DDG versions
      $('td.result-snippet').each((i, el) => {
        snippets.push($(el).text().trim());
      });
    }
    return snippets.slice(0, 5).join("\n");
  } catch (error) {
    console.error("[SEARCH] Error:", error);
    return null;
  }
}

async function fetchWikipedia(query: string) {
  try {
    const headers = { 'User-Agent': 'Democrateach/1.0 (https://democrateach.org; contact@democrateach.org)' };
    const wikiSearchQuery = query + " politician Indian TMC";
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(wikiSearchQuery)}&format=json&origin=*`;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const searchRes = await fetch(searchUrl, { headers, signal: controller.signal });
    const searchData = await searchRes.json();
    clearTimeout(id);
    
    if (searchData.query?.search?.length > 0) {
      let bestResult = searchData.query.search[0];
      const politicalMatch = searchData.query.search.find((s: any) => 
        s.snippet.toLowerCase().includes("politician") || 
        s.snippet.toLowerCase().includes("parliament") ||
        s.snippet.toLowerCase().includes("trinamool")
      );
      if (politicalMatch) bestResult = politicalMatch;

      const pageTitle = bestResult.title;
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
      const extractController = new AbortController();
      const extractId = setTimeout(() => extractController.abort(), 5000);
      const extractRes = await fetch(extractUrl, { headers, signal: extractController.signal });
      const extractData = await extractRes.json();
      clearTimeout(extractId);
      const pages = extractData.query.pages;
      const pageId = Object.keys(pages)[0];
      return pages[pageId].extract || "";
    }
    return "";
  } catch (error) {
    console.error("[WIKI] Error:", error);
    return "";
  }
}

function refineQuery(message: string) {
  return message
    .replace(/(give me some info on|who is|tell me about|what is|search for|information about|can you tell me)/gi, "")
    .trim();
}

export async function POST(request: Request) {
  console.log("[CHAT] POST request received");
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, language = "English", chatId, image } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1];
    const latestMessage = latestUserMessage?.content || "";
    
    console.time("Chat DB Operations");
    const dbUpdatePromise = (latestUserMessage && latestUserMessage.role === "user") ? (async () => {
      try {
        await prisma.message.create({
          data: {
            content: latestMessage,
            role: "user",
            chatId: chatId,
          },
        });
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() }
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    })() : Promise.resolve();

    const coreQuery = refineQuery(latestMessage);
    const queryLower = latestMessage.toLowerCase();
    
    // Categorize query
    const isProcedure = queryLower.includes("apply") || queryLower.includes("register") || 
                        queryLower.includes("link") || queryLower.includes("voter id") || 
                        queryLower.includes("portal") || queryLower.includes("how to");
                        
    const isPolitics = queryLower.includes("tmc") || queryLower.includes("bjp") || 
                        queryLower.includes("congress") || queryLower.includes("candidate") ||
                        queryLower.includes("constituency") || queryLower.includes("minister") ||
                        queryLower.includes("who is") || queryLower.includes("about");

    console.time("RAG Operations");
    const [webResults, wikiResults] = await Promise.all([
      (isProcedure || isPolitics || coreQuery.length > 2) ? (async () => {
        let searchQuery = `${coreQuery} Indian elections`;
        if (isProcedure) searchQuery = `${coreQuery} official ECI NVSP portal link`;
        if (isPolitics) searchQuery = `${coreQuery} Indian politician news candidate bio`;
        
        const results = await Promise.all([
          fetchWebSearch(searchQuery),
          fetchWebSearch(`${searchQuery} latest updates`)
        ]);
        return results.filter(Boolean).join("\n\n");
      })() : Promise.resolve(""),
      (isPolitics && coreQuery.length > 2) ? fetchWikipedia(coreQuery) : Promise.resolve("")
    ]);
    console.timeEnd("RAG Operations");
    console.timeEnd("Chat DB Operations");

    let contextBlock = "";
    if (wikiResults) contextBlock += `### WIKIPEDIA KNOWLEDGE:\n${wikiResults}\n\n`;
    if (webResults) contextBlock += `### LIVE WEB & NEWS UPDATES:\n${webResults}\n\n`;

    const systemPrompt = `You are "DEMOCRATEACH", a high-level digital authority on Indian Democracy and Electoral Systems. 
Your mission is to provide citizens with absolute clarity, official links, and real-time electoral intelligence.

OPERATIONAL PROTOCOLS:
1. HELP INITIALIZATION: Always be helpful, authoritative, and proactive.
2. DUAL KNOWLEDGE: 
   - Use the PROVIDED CONTEXT for real-time news, live candidates, and specific constituency data.
   - Use your INTERNAL TRAINING for general laws, voting procedures, constitutional rights, and official government portal links (e.g., ECI, NVSP).
3. MULTILINGUAL: Respond eloquently in ${language}.
4. NO PLACEHOLDERS: Provide actual official URLs (like voterportal.eci.gov.in) instead of saying you don't have links.

### REAL-TIME CONTEXT (PRIORITIZE FOR CANDIDATES/NEWS):
${contextBlock || "Searching for live updates... (No specific real-time data retrieved for this exact query yet)"}`;

    // Prepare inputs for Gemini
    const history = messages.slice(0, -1)
      .filter((m: any) => m.content && (m.role === "user" || m.role === "assistant"))
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    console.log("[GEMINI] Starting generation with model: gemini-flash-latest. History length:", history.length);
    const chat = getGenAI().getGenerativeModel({ model: "gemini-flash-latest" }).startChat({
      history: history,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      } as any,
    });

    try {
      const promptParts: any[] = [latestMessage];
      
      if (image) {
        // Remove the data:image/png;base64, prefix if it exists
        const base64Data = image.split(",")[1] || image;
        promptParts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg" // Default to jpeg, but works for most
          }
        });
      }

      const result = await chat.sendMessageStream(promptParts);
      const encoder = new TextEncoder();
      let assistantFullMessage = "";

      const stream = new ReadableStream({
        async start(controller) {
          try {
            console.log("[STREAM] Starting Plain Text Stream...");
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              assistantFullMessage += chunkText;
              controller.enqueue(encoder.encode(chunkText));
            }
            
            // Background DB update
            if (assistantFullMessage.trim()) {
              prisma.message.create({
                data: { content: assistantFullMessage, role: "assistant", chatId: chatId },
              }).catch(e => console.error("[DB] Error:", e));
            }
            
            controller.close();
          } catch (error: any) {
            console.error("[STREAM] Error:", error);
            controller.enqueue(encoder.encode(`\n\n[Error: ${error.message}]`));
            controller.close();
          }
        },
      });

      return new NextResponse(stream, { 
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
        } 
      });
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      return NextResponse.json({ 
        message: { content: `Gemini API Error: ${apiError.message}. Please check if the API is enabled and the key is correct.` } 
      });
    }
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
