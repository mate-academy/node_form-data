'use strict';

const { Server } = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const querystring = require('querystring');

const dbPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const requestedPath = url.pathname.slice(1) || 'index.html';
      const realPath = path.join('public', requestedPath);
      const mimeType = mime.contentType(path.extname(realPath)) || 'text/plain';

      if (requestedPath === 'add-expense') {
        if (req.method === 'POST') {
          const chunks = [];

          req.on('data', (chunk) => chunks.push(chunk));

          req.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            const contentType = req.headers['content-type'] || '';
            const isJSON = contentType.includes('application/json');
            const { date, title, amount } = isJSON
              ? JSON.parse(body) || {}
              : querystring.parse(body) || {};

            if (!date || !title || !amount) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Invalid form');

              return;
            }

            fs.writeFileSync(
              dbPath,
              JSON.stringify({ date, title, amount }, null, 2),
            );

            if (isJSON) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ date, title, amount }));

              return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });

            res.end(`
              <!doctype html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <title>Expense saved</title>
                </head>
                <body>
                  <h1>Expense saved</h1>
                  <pre>${JSON.stringify({ date, title, amount }, null, 2)}</pre>
                  <a href="/">Back</a>
                </body>
              </html>
            `);
          });
        } else {
          res.statusCode = 400;
          res.end('Wrong method!');
        }

        return;
      }

      if (!fs.existsSync(realPath)) {
        res.statusCode = 404;
        res.end('Not Found');

        return;
      }

      const dataStream = fs.createReadStream(realPath);

      res.statusCode = 200;
      res.setHeader('Content-Type', mimeType);
      dataStream.pipe(res);
    } catch (error) {
      res.statusCode = 500;
      res.end('Server Error');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
