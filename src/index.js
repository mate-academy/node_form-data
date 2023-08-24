'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const { getHtmlResponse } = require('./utils');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');

    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else if (req.method === 'POST' && req.url === '/submit') {
    const chunks = [];

    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const formData = Buffer.concat(chunks);
      const formFields = formData.toString().split('&');
      const expenseData = {};

      for (const field of formFields) {
        const [key, value] = field.split('=');

        expenseData[key] = decodeURIComponent(value);
      }

      const jsonData = JSON.stringify(expenseData, null, 2);

      const writableStream = fs.createWriteStream('expense.json');

      writableStream.write(jsonData);
      writableStream.end();

      const responseHtml = getHtmlResponse(jsonData);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(responseHtml);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
