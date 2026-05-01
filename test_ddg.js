const https = require('https');
const cheerio = require('cheerio');

const query = "Jadavpur Lok Sabha TMC candidate 2024";
const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const snippets = [];
    $('.result__snippet').each((i, el) => {
      snippets.push($(el).text().trim());
    });
    console.log("DuckDuckGo Results:");
    console.log(snippets.slice(0, 3));
  });
}).on('error', (e) => {
  console.error(e);
});
