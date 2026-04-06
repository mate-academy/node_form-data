'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const baseUrl = req.url;
    const dbPath = path.resolve('db', 'expense.json');
    const mainPath = path.resolve('public', 'index.html');

    if (baseUrl === '/') {
      const stream = fs.createReadStream(mainPath);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      return res.pipe(stream);
    }

    if (baseUrl === '/add-expense') {
      if (req.method !== 'POST') {
        res.statusCode = 400;

        return res.end();
      }

      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks).toString();
          const data = JSON.parse(buffer);

          if (!data.date || !data.title || !data.amount) {
            fs.writeFileSync(dbPath, JSON.stringify({}));

            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');

            return res.end(JSON.stringify('Missing fields'));
          }

          fs.writeFileSync(dbPath, JSON.stringify(data));

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');

          return res.end(`<pre>${JSON.stringify(data)}</pre>`);
        } catch (e) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');

          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });

      return;
    }

    res.statusCode = 404;
    res.end();
  });

  return server;
}

module.exports = {
  createServer,
};
