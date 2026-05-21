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

async function getConstituencyWikiData(constituency: string, type: string): Promise<string> {
  try {
    const headers = { 'User-Agent': 'Democrateach/1.0 (https://democrateach.org; contact@democrateach.org)' };
    const searchQuery = `${constituency} ${type === "Lok Sabha" ? "Lok Sabha" : "Assembly"} constituency`;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
    
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();
    const results = searchData.query?.search || [];
    if (results.length === 0) return "";
    
    const constituencyLower = constituency.toLowerCase();
    const isLokSabha = type === "Lok Sabha";
    const bestResult = results.find((r: any) => {
      const titleLower = r.title.toLowerCase();
      const matchesConstituency = titleLower.includes(constituencyLower);
      const matchesTier = isLokSabha
        ? (titleLower.includes("lok sabha") || titleLower.includes("parliamentary") || titleLower.includes("mp"))
        : (titleLower.includes("assembly") || titleLower.includes("vidhan sabha") || titleLower.includes("legislative") || titleLower.includes("mla"));
      return matchesConstituency && matchesTier;
    }) || results.find((r: any) => r.title.toLowerCase().includes(constituencyLower)) || results[0];
    const bestTitle = bestResult.title;
    
    const wikiPageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(bestTitle.replace(/ /g, '_'))}`;
    
    const pageRes = await fetch(wikiPageUrl, { headers });
    const html = await pageRes.text();
    const $ = cheerio.load(html);
    
    const tablesText: string[] = [];
    let currentHeading = "";
    
    $('.mw-parser-output').find('h2, h3, h4, table.wikitable').each((i, el) => {
      const tagName = el.tagName ? el.tagName.toLowerCase() : "";
      if (['h2', 'h3', 'h4'].includes(tagName)) {
        currentHeading = $(el).text().trim().replace(/\[edit\]/g, '');
      } else if (tagName === 'table' && $(el).hasClass('wikitable')) {
        const rows: string[] = [];
        $(el).find('tr').each((j, rEl) => {
          const cells: string[] = [];
          $(rEl).find('td, th').each((k, cellEl) => {
            cells.push($(cellEl).text().trim().replace(/\s+/g, ' '));
          });
          if (cells.length > 0) {
            rows.push(cells.join(" | "));
          }
        });
        if (rows.length > 0) {
          tablesText.push(`### Section: ${currentHeading}\n` + rows.slice(0, 15).join("\n"));
        }
      }
    });
    
    return tablesText.join("\n\n");
  } catch (err) {
    console.error("[WIKI PARSE ERROR]:", err);
    return "";
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
    const searchTasks = [
      `intitle:2026 ${constituency} ${type} election candidates list`,
      `final contestants list ${constituency} ${state} assembly election April 2026`,
      `Who won ${constituency} ${state} assembly election 2026 TMC BJP CPIM`,
      `latest news candidates for ${constituency} ${state} 2026 election cycle`
    ];
    
    // Fetch Web Search and Wikipedia Constituency page HTML in parallel!
    const [webResults, wikiResults] = await Promise.all([
      Promise.all(searchTasks.map(q => fetchWebSearch(q))),
      getConstituencyWikiData(constituency, type)
    ]);
    
    const liveContext = [
      wikiResults ? `### WIKIPEDIA CONSTITUENCY DATA & ELECTION TABLES:\n${wikiResults}` : "",
      webResults.filter(Boolean).length > 0 ? `### LIVE WEB SEARCH SNIPPETS:\n${webResults.filter(Boolean).join("\n---\n")}` : ""
    ].filter(Boolean).join("\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    // Determine the expected latest election cycle year for constraints
    let expectedYear = "2026";
    if (type === "Lok Sabha") {
      expectedYear = "2024";
    } else if (state === "Uttar Pradesh") {
      expectedYear = "2022";
    } else if (state === "Maharashtra") {
      expectedYear = "2024";
    } else if (state === "Gujarat") {
      expectedYear = "2022";
    } else if (state === "Karnataka") {
      expectedYear = "2023";
    } else if (state === "Delhi") {
      expectedYear = "2025";
    }

    const prompt = `You are a Senior Political Data Analyst specialized in Indian Elections. 
Current Date: May 1, 2026.
Your mission is to provide the EXACT candidate list for the "${constituency}" constituency (${type} election tier) in ${state}.

We are targeting the most recent election cycle.
- Election Tier: ${type}
- Target/Expected Election Year: ${expectedYear} (For Vidhan Sabha/Assembly, this matches the state's latest assembly election. For Lok Sabha, this is the 2024 general election).

### ELECTORAL DATA CONTEXT (WIKIPEDIA TABLES & WEB SNIPPETS):
${liveContext || "No context data retrieved."}

### RIGID ACCURACY PROTOCOLS:
1. TARGET ELECTION YEAR: You MUST prioritize extracting candidate names from the latest election table matching the target year (${expectedYear}).
2. REJECT PREVIOUS ELECTIONS: You MUST NOT return candidates from older election cycles (e.g. if target year is 2026, reject candidates who ran in 2021 but did not contest in 2026, unless they contested in both).
3. DETECT PARTY REPRESENTATIVES: For the target election, extract one candidate representing each major contesting party (e.g., BJP, TMC, INC, CPIM, AAP, etc.) as listed in the results table or context.
4. NO HALLUCINATION: Extract candidate details ONLY from the provided Wikipedia tables and web snippets. If the context has no records for the constituency, return an empty array [].
5. SEPARATE TIERS: Do not mix Lok Sabha (MP) candidates and Vidhan Sabha (MLA) candidates. Use only the data that matches the requested tier (${type}).

### DATA STRUCTURE:
Return a JSON array of candidate objects:
   - name: FULL LEGAL NAME of the candidate
   - party: Full Political Party Name
   - partyAbbr: Abbreviation (e.g. BJP, INC, TMC, AAP, CPIM, DMK, SP, etc.)
   - background: A brief professional background or description of the candidate based on the context.

CRITICAL: Return ONLY raw JSON. Do not include markdown code block syntax (like \`\`\`json). Do not write any conversational text. Return exactly a valid JSON array or [].`;

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
