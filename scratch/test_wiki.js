const fetch = require('node-fetch');

async function fetchWikipedia(query) {
  try {
    const headers = { 'User-Agent': 'Democrateach/1.0 (https://democrateach.org; contact@democrateach.org)' };
    const wikiSearchQuery = query + " politician Indian TMC";
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(wikiSearchQuery)}&format=json&origin=*`;
    
    console.log("Searching Wiki:", searchUrl);
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();
    
    console.log("Results:", searchData.query?.search?.length);
    if (searchData.query?.search?.length > 0) {
      console.log("Best result:", searchData.query.search[0].title);
    }
  } catch (error) {
    console.error("[WIKI] Error:", error);
  }
}

fetchWikipedia("Mamata Banerjee");
