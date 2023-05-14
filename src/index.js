/* eslint-disable no-console */
'use strict';

const http = require('http');
// const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/') {
    // Show the HTML form
    res.setHeader('Content-Type', 'text/html');

    const form = `
      <form method="POST">
        <label>Date:</label>
        <input type="date" name="date"><br>
        <label>Title:</label>
        <input type="text" name="title"><br>
        <label>Amount:</label>
        <input type="number" name="amount"><br>
        <button type="submit">Submit</button>
      </form>
    `;

    res.end(form);
  } else if (req.method === 'POST' && pathname === '/') {
    // Handle form submission
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const { date, title, amount } = querystring.parse(
        Buffer.concat(chunks).toString()
      );

      // Save expense data to JSON file
      const data = {
        date, title, amount,
      };
      const jsonData = JSON.stringify(data, null, 2); // 2-space indentation
      const stream = fs.createWriteStream('expense.json');

      stream.on('error', (err) => {
        console.error(err);
        res.statusCode = 500;
        res.end('Error saving expense data');
      });

      stream.on('finish', () => {
        // Return HTML page with formatted JSON
        res.setHeader('Content-Type', 'text/html');

        const html = `
          <h2>Expense saved:</h2>
          <pre>${jsonData}</pre>
        `;

        res.end(html);
      });
      stream.write(jsonData);
      stream.end();
    });
  } else {
    // Handle 404 error
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.on('error', () => { });

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
