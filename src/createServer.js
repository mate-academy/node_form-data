'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      fs.readFile(path.join(__dirname, 'form.html'), 'utf8', (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading form');

          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
    } else if (req.method === 'POST' && req.url === '/add-expense') {
      let data = '';

      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const expense = JSON.parse(data);

          if (!expense.date || !expense.title || !expense.amount) {
            res.writeHead(400, { 'Content-Type': 'application/json' });

            res.end(
              JSON.stringify({
                error:
                  'Missing required fields: date, title, amount are required',
              }),
            );

            return;
          }

          const filePath = path.join(__dirname, '..', 'db', 'expense.json');

          // Initialize expenses array
          let expenses = [];

          // Read existing expenses if file exists
          if (fs.existsSync(filePath)) {
            try {
              const fileContent = fs.readFileSync(filePath, 'utf8');
              const parsedContent = JSON.parse(fileContent);

              expenses = Array.isArray(parsedContent) ? parsedContent : [];
            } catch (readError) {
              // If file is corrupted, start with empty array
              expenses = [];
            }
          }

          // Add new expense
          expenses.push(expense);

          // Write updated array back to file
          fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(expense));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });

          res.end(
            JSON.stringify({
              error: 'Failed to process request',
            }),
          );
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
}

module.exports = {
  createServer,
};
