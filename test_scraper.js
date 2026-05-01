const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('wiki.html', 'utf8');
const $ = cheerio.load(html);

// Find the table that contains the members. Usually it has headers like 'Constituency', 'Name', 'Party'
let foundCount = 0;
$('table.wikitable').each((i, table) => {
  const headers = $(table).find('th').text();
  if (headers.includes('Constituency') && headers.includes('Party')) {
    $(table).find('tr').each((j, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 5) {
        const state = cols.eq(0).text().trim() || 'Unknown State'; // Often rowspanned
        const constituency = cols.eq(1).text().trim() || cols.eq(0).text().trim();
        const name = cols.eq(2).text().trim() || cols.eq(1).text().trim();
        const party = cols.eq(3).text().trim() || cols.eq(2).text().trim();
        
        if (name && party && foundCount < 5) {
          console.log(`[${party}] ${name} - ${constituency}`);
          foundCount++;
        }
      }
    });
  }
});
console.log(`Extracted sample.`);
