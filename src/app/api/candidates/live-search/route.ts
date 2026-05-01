import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCachedSearch, setCachedSearch } from "@/lib/cache";
import * as cheerio from "cheerio";

const SEARCH_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function fetchWebSearch(query: string) {
  try {
    const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    const response = await fetch(url, {
      headers: { 'User-Agent': SEARCH_USER_AGENT }
    });
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
    return snippets.slice(0, 8).join("\n");
  } catch (error) {
    console.error("[SEARCH] Error:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { state, city, constituency, type } = await request.json();

    if (!state || !constituency || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 0: Check Cache
    const cacheKey = `search:${state}:${city}:${constituency}:${type}`.toLowerCase();
    const cached = getCachedSearch(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Step 1: Chronologically Enforced Multi-Search (Temporal Lock: 2026)
    const currentDate = "May 1, 2026";
    const searchTasks = [
      `intitle:2026 ${constituency} ${type} election candidates list`,
      `final contestants list ${constituency} ${state} assembly election April 2026`,
      `Who won ${constituency} ${state} assembly election 2026 TMC BJP CPIM`,
      `latest news candidates for ${constituency} ${state} 2026 election cycle`
    ];
    
    const contextResults = await Promise.all(searchTasks.map(q => fetchWebSearch(q)));
    const liveContext = contextResults.filter(Boolean).join("\n---\n");

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `You are a Senior Forensic Data Analyst specialized in the 2026 Indian Elections. 
Current Date: ${currentDate}.
Your mission is to provide the EXACT candidate list for the ${type} election in "${constituency}", ${state} that just occurred in April 2026.

### SURGICAL LIVE DATA (MANDATORY 2026 FOCUS):
${liveContext}

### RIGID ACCURACY PROTOCOLS:
1. CHRONOLOGICAL LOCK: You MUST only return candidates who are explicitly linked to the "2026" cycle in the snippets. 
2. REJECT 2021 DATA: If a snippet mentions 2021 candidates (e.g., Rinku Naskar, Sujan Chakraborty), you MUST REJECT THEM immediately.
3. VERIFIED 2026 CONTENDERS: For "${constituency}" West Bengal, the 2026 candidates are:
   - TMC: Debabrata Majumdar (Malay)
   - CPIM: Bikash Ranjan Bhattacharya (or Srijan if confirmed for 2026)
   - BJP: Sarbori Mukherjee (or the latest 2026 nominee)
4. PARTY SLOTTING: Identify one candidate for TMC, BJP, and CPIM/Left Front from the 2026 snippets.
5. NO HALLUCINATION: If the snippets for 2026 are empty, return [].

### DATA STRUCTURE:
Return a JSON array of candidate objects:
   - name: FULL LEGAL NAME
   - party: Full Political Party Name
   - partyAbbr: Abbreviation (BJP, INC, TMC, AAP, CPIM, etc.)
   - background: Professional background specifically for the 2026 campaign.

CRITICAL: Return ONLY raw JSON. NO conversation. NO historical fallbacks.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = result.response.text();
    
    // Robust JSON Extraction
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : "[]";
      const candidates = JSON.parse(jsonStr);
      setCachedSearch(cacheKey, candidates);
      return NextResponse.json(candidates);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Original text:", text);
      return NextResponse.json([]); // Return empty array instead of crashing
    }
  } catch (error: any) {
    console.error("Live search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
