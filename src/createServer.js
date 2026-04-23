'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function createServer() {
  const server = new http.Server();
  const filePath = path.join(__dirname, '..', 'db', 'expense.json');

  server.on('request', (req, res) => {
    if (req.method === 'POST' && req.url === '/submit-expense') {
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          JSON.stringify({ expenses: [] }, null, 2),
          'utf-8',
        );
      }

      let fields = '';

      req.on('data', (chunk) => {
        fields += chunk.toString();
      });

      req.on('end', () => {
        const params = new URLSearchParams(fields);
        const date = params.get('date');
        const title = params.get('title');
        const amount = params.get('amount');

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.end('Missing fields');

          return null;
        }

        const newExpense = {
          date,
          title,
          amount: parseFloat(amount),
        };

        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end('Error reading file');

            return null;
          }

          let expenseData;

          try {
            expenseData = JSON.parse(data);

            if (!Array.isArray(expenseData.expenses)) {
              expenseData.expenses = [];
            }
          } catch {
            expenseData = { expenses: [] };
          }

          expenseData.expenses.push(newExpense);

          fs.writeFile(
            filePath,
            JSON.stringify(expenseData, null, 2),
            'utf-8',
            (error) => {
              if (error) {
                res.statusCode = 500;
                res.end('Failed to write file');

                return null;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');

              res.end(
                JSON.stringify(
                  expenseData.expenses[expenseData.expenses.length - 1],
                  null,
                  2,
                ),
              );
            },
          );
        });
      });
    } else if (req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <h2>Add Expense</h2>
        <form method="POST" action="/submit-expense" enctype="application/x-www-form-urlencoded">
          <label for="date">Date:</label><br />
          <input type="date" name="date" id="date" /><br /><br />

          <label for="title">Title:</label><br />
          <input type="text" name="title" id="title" /><br /><br />

          <label for="amount">Amount:</label><br />
          <input type="number" name="amount" id="amount" /><br /><br />

          <button type="submit">Post</button>
        </form>
      `);
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  server.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Server error:', err);
  });

  return server;
}

module.exports = {
  createServer,
};
