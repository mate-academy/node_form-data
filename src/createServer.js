'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const htmlPath = path.join(__dirname, 'index.html');
const dbPath = path.join(__dirname, '..', 'db', 'expense.json');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const stream = fs.createReadStream(htmlPath);

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });

      stream.pipe(res);

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const chunks = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();

        let expense;

        if (req.headers['content-type']?.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          expense = Object.fromEntries(new URLSearchParams(body));
        }

        const { date, title, amount } = expense;

        if (!date || !title || !amount) {
          res.writeHead(400, {
            'Content-Type': 'text/plain',
          });

          res.end('Date, title and amount are required');

          return;
        }

        const savedExpense = { date, title, amount };

        fs.writeFile(dbPath, JSON.stringify(savedExpense), (err) => {
          if (err) {
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });

            res.end('Could not save expense');

            return;
          }

          const formattedJson = JSON.stringify(savedExpense, null, 2);

          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
          });

          res.end(`
              <html>
                <body>
                  <pre>${formattedJson}</pre>
                </body>
              </html>
            `);
        });
      });

      return;
    }

    res.writeHead(404, {
      'Content-Type': 'text/plain',
    });
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};
