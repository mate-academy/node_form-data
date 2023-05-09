'use strict';

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Content-type', 'text/html');

  let date = '';
  let title = '';
  let amount = 0;
  let body = '';

  if (req.url === '/getJSON') {
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      const parts = body.split('&');
      const jsonObject = {};

      for (const part of parts) {
        const value = part.slice(part.indexOf('=') + 1);

        switch (true) {
          case part.includes('date'):
            date = value;
            jsonObject.date = value;
            break;
          case part.includes('title'):
            title = value.replace('+', ' ');
            jsonObject.title = value.replace('+', ' ');
            break;
          case part.includes('amount'):
            amount = value;
            jsonObject.amount = value;
            break;
        }
      }

      const writeStream = fs.createWriteStream('./src/result.json');

      writeStream.write(JSON.stringify(jsonObject));

      writeStream.on('error', () => {
        res.statusCode = 500;
        res.end('Server error');
      });

      res.end(`
        <main>
          <h3>Date - ${date}</h3>
          <h3>Title - ${title}</h3>
          <h3>Amount - ${amount}</h3>
        </main>
    `);
    });
  } else {
    const fileStream = fs.createReadStream('./public/index.html');

    fileStream.pipe(res);

    fileStream.on('end', () => {
      // eslint-disable-next-line no-console
      console.log('Completed');
    });

    fileStream.on('error', () => {
      res.statusCode = 500;
      res.end('Server error');
    });
  }
});

server.on('error', () => {});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started! 🚀');
});
