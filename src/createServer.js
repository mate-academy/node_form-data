/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((req, res) => {
    const { method, url } = req;

    if (url === '/' && method === 'GET') {
      const filePath = path.join(__dirname, 'index.html');

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);

          return res.end('Server error');
        }

        res.writeHead(200, {
          'Content-type': 'text/html',
        });
        res.end(content);
      });
    } else if (url === '/submit-expense' && method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const params = new URLSearchParams(body);
        const newExpense = {
          date: params.get('date'),
          title: params.get('title'),
          amount: params.get('amount'),
        };

        const dbPath = path.join(__dirname, '../db', 'expense.json');

        fs.readFile(dbPath, 'utf-8', (err, data) => {
          let expenses = [];

          if (!err && data) {
            try {
              const parsedData = JSON.parse(data);

              expenses = Array.isArray(parsedData) ? parsedData : [parsedData];
            } catch (parseErr) {
              expenses = [];
            }
          }

          expenses.push(newExpense);

          const jsonToSave = JSON.stringify(expenses, null, 2);

          fs.writeFile(dbPath, jsonToSave, (writeErr) => {
            if (writeErr) {
              res.writeHead(500);

              return res.end('Error saving to the file');
            }

            res.writeHead(200, { 'Content-type': 'text/html' });

            res.end(`
              <!DOCTYPE html>
              <html>
                <body>
                  <h1>Expense Saved Successfully</h1>
                  <p>Here is the saved data:</p>
                  <pre style="background: #f4f4f4; padding: 10px; border: 1px solid #ddd;">${jsonToSave}</pre>
                  <a href="/">Add another expense</a>
                </body>
              </html>
            `);
          });
        });
      });
    } else {
      res.statusCode = 404;
      res.end('Invalid url');
    }
  });
}

module.exports = {
  createServer,
};
