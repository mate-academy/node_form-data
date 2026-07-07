'use strict';

const http = require('http');
const fs = require('fs/promises');

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' && req.url === '/send') {
      res.statusCode = 404;
      res.end();

      return;
    }

    if (req.method === 'GET' && req.url === '/') {
      try {
        const page = await fs.readFile('./public/index.html');

        res.setHeader('Content-Type', 'text/html');
        res.end(page);

        return;
      } catch (err) {
        res.end('Something went wrong');

        return;
      }
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const chunks = [];

      await req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      await req.on('end', async () => {
        const contentType = req.headers['content-type'];
        const text = Buffer.concat(chunks).toString();
        let paramsObj;

        if (contentType.includes('application/json')) {
          paramsObj = JSON.parse(text);
        } else {
          paramsObj = Object.fromEntries(new URLSearchParams(text));
        }

        if (!paramsObj.date || !paramsObj.title || !paramsObj.amount) {
          res.statusCode = 400;
          res.end('Bad request');

          return;
        }

        try {
          await fs.writeFile('./db/expense.json', JSON.stringify(paramsObj));
        } catch (err) {
          res.end();

          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.write(
          '<html><pre><code>' +
            JSON.stringify(paramsObj, null, 2) +
            '</code></pre></html>',
        );
        res.end();
      });

      return;
    }

    res.statusCode = 404;
    res.end();
  });
}

module.exports = {
  createServer,
};
