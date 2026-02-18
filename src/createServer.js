'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const querystring = require('node:querystring');

const dataPath = path.resolve(__dirname, '../db/expense.json');

function createServer() {
  return http.createServer((req, res) => {
    /* ---------- GET FORM ---------- */
    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <h1>Add expense</h1>
        <form method="POST" action="/add-expense">
          <label>Date: <input name="date" type="date" required /></label><br />
          <label>Title: <input name="title" type="text" required /></label><br />
          <label>Amount: <input name="amount" type="number" required /></label><br />
          <button type="submit">Save</button>
        </form>
      `);

      return;
    }

    /* ---------- ONLY POST /add-expense ---------- */
    if (req.method !== 'POST' || req.url !== '/add-expense') {
      res.statusCode = 404;
      res.end('Not Found');

      return;
    }

    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');

      let expense;

      try {
        if (req.headers['content-type']?.includes('application/json')) {
          expense = JSON.parse(body);
        } else {
          expense = querystring.parse(body);
        }
      } catch {
        res.statusCode = 400;
        res.end('<h2>Invalid data</h2>');

        return;
      }

      if (!expense.date || !expense.title || !expense.amount) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h2>Missing required fields</h2>');

        return;
      }

      /* ---------- READ EXISTING FILE ---------- */
      fs.readFile(dataPath, 'utf-8', (readErr, fileData) => {
        let expenses = [];

        if (!readErr && fileData) {
          try {
            expenses = JSON.parse(fileData);
          } catch {
            expenses = [];
          }
        }

        if (!Array.isArray(expenses)) {
          expenses = [];
        }

        expenses.push(expense);

        /* ---------- WRITE UPDATED ARRAY ---------- */
        fs.writeFile(
          dataPath,
          JSON.stringify(expenses, null, 2),
          (writeErr) => {
            if (writeErr) {
              res.statusCode = 500;
              res.end('<h2>Server error</h2>');

              return;
            }

            /* ---------- HTML RESPONSE ---------- */
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');

            res.end(JSON.stringify(expense, null, 2));
          },
        );
      });
    });
  });
}

module.exports = { createServer };
