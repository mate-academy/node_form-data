/* eslint-disable no-console */
'use strict';

const { Server } = require('http');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  // створюємо файл, якщо його немає
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]), 'utf8');
  }

  const server = new Server();

  server.on('request', (req, res) => {
    // GET /add-expense - HTML форма
    if (req.url === '/add-expense' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.end(`
        <!doctype html>
        <html lang="en">
          <head><meta charset="UTF-8" /><title>Add Expense</title></head>
          <body>
            <form method="POST" action="/add-expense">
              <input type="date" name="date" required />
              <input type="text" name="title" placeholder="Title" required />
              <input type="text" name="amount" placeholder="Amount" required />
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);

      return;
    }

    // POST /add-expense - додаємо новий запис
    if (req.url === '/add-expense' && req.method === 'POST') {
      const bodyChunks = [];

      req.on('data', (chunk) => bodyChunks.push(chunk));

      req.on('end', () => {
        const json = Buffer.concat(bodyChunks);
        const expense = JSON.parse(json);

        if (!expense?.date || !expense?.title || !expense?.amount) {
          res.statusCode = 400;
          res.end('Bad user input');

          return;
        }

        fs.readFile(dbPath, 'utf8', (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Read error' }));

            return;
          }

          fs.writeFile(dbPath, JSON.stringify(expense, null, 2), (error) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Write error' }));

              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(expense));
          });
        });
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  return server;
}

module.exports = { createServer };
