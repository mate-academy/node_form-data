'use strict';

const fs = require('fs');
const http = require('http');

const server = new http.Server();

server.on('request', (req, res) => {
  const file = fs.createReadStream('./public/index.html');

  if (req.url === '/') {
    file.pipe(res);
  }

  if (req.method === 'POST' && req.url === '/submit') {
    let data = '';

    req.on('data', chunk => {
      data += chunk.toString();
    });

    req.on('end', () => {
      const formattedData = `<pre>${data}</pre>`;

      const htmlResponse = `
        <html>
        <head>
          <title>Received Data</title>
        </head>
        <body>
          ${formattedData}
        </body>
        </html>
      `;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlResponse);
    });
  }

  res.on('error', (err) => {
    res.statusCode = 500;
    res.end(`Server error: ${err}`);
  });

  res.on('close', () => file.destroy());
});

server.on('error', () => { });

server.listen(3010);
