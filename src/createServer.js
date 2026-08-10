'use strict';

const http = require('node:http');
const querystring = require('node:querystring');
const fs = require('node:fs');
const path = require('node:path');

function createServer() {
  const server = http.createServer();

  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <form method="POST" action="/add-expense">
          <input name="date" type="date" />
          <input name="title" type="text" />
          <input name="amount" type="number" />
          <button type="submit">Add</button>
        </form>
      `);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        const body = Buffer.concat(chunks).toString();

        let data;

        if (req.headers['content-type'] === 'application/json') {
          data = JSON.parse(body);
        } else {
          data = querystring.parse(body);
        }

        if (!data.date || !data.title || !data.amount) {
          res.statusCode = 400;
          res.end('All fields are required');

          return;
        }

        const dataPath = path.resolve(__dirname, `../db/expense.json`);

        await fs.promises.writeFile(dataPath, JSON.stringify(data));

        const formattedJson = JSON.stringify(data, null, 2);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        res.end(`
          <html>
            <body>
              <pre>${formattedJson}</pre>
            </body>
          </html>
        `);
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};
