/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 8080;

const server = new http.Server();

server.on('request', async(req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fileName = url.pathname.slice(1) || 'index.html';

  if (fileName === 'index.html') {
    fs.readFile(`./public/${fileName}`, 'utf-8', (err, content) => {
      if (err) {
        res.statusCode = 404;
        res.end('Error 404: Page not found');

        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    });
  } else {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const text = Buffer.concat(chunks).toString();
    const objectData = Object.fromEntries(
      new URLSearchParams(text).entries()
    );

    fs.writeFile('api.json', JSON.stringify(objectData), (error) => {
      if (error) {
        console.log('Something went wrong', error);
      }
    });

    const file = fs.createReadStream('api.json');

    file.pipe(res);

    file.on('error', () => {
      res.statusCode = 500;
      res.end('Error occurred');
    });
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
