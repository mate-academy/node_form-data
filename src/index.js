'use strict';

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve the HTML form
    res.setHeader('Content-Type', 'text/html');

    res.end(`
      <html>
        <head>
          <title>Expense Form</title>
        </head>
        <body>
          <h1>Expense Form</h1>
          <form method="post" action="/submit">
            Date: <input type="date" name="date"><br>
            Title: <input type="text" name="title"><br>
            Amount: <input type="text" name="amount"><br>
            <input type="submit" value="Submit">
          </form>
        </body>
      </html>
    `);
  } else if (req.method === 'POST' && req.url === '/submit') {
    // Handle the POST request
    let requestBody = '';

    req.on('data', (chunk) => {
      requestBody += chunk.toString();
    });

    req.on('end', () => {
      const formData = new URLSearchParams(requestBody);
      const expense = {
        date: formData.get('date'),
        title: formData.get('title'),
        amount: formData.get('amount'),
      };

      // Save the expense data to a JSON file
      const jsonExpense = JSON.stringify(expense, null, 2);

      fs.appendFile('expenses.json', jsonExpense + '\n', (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Error saving expense data:', err);
          res.statusCode = 500;
          res.end('Internal Server Error');
        } else {
          res.setHeader('Content-Type', 'text/html');

          res.end(`
            <html>
              <head>
                <title>Expense Saved</title>
              </head>
              <body>
                <h1>Expense Saved</h1>
                <pre>${jsonExpense}</pre>
              </body>
            </html>
          `);
        }
      });
    });
  } else {
    // Handle other routes
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const port = 3000;

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
