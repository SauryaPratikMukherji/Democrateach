const https = require('https');

https.get('https://en.wikipedia.org/wiki/List_of_members_of_the_18th_Lok_Sabha', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('wiki.html', data);
    console.log('Saved wiki.html');
  });
});
