const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchWebSearch(query) {
  const SEARCH_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  try {
    const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    console.log("Searching:", url);
    const response = await fetch(url, {
      headers: { 'User-Agent': SEARCH_USER_AGENT }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const snippets = [];
    $('.result__snippet').each((i, el) => {
      snippets.push($(el).text().trim());
    });
    console.log("Found", snippets.length, "snippets");
    return snippets.slice(0, 5).join("\n");
  } catch (error) {
    console.error("[SEARCH] Error:", error);
    return null;
  }
}

fetchWebSearch("Indian election 2026 latest news");
