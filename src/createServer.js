'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function handleRequest(req, res) {
  if (req.url !== '/add-expense') {
    res.statusCode = 404;
    res.end('Wrong request url');

    return;
  }

  const chunks = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const text = Buffer.concat(chunks).toString();

    try {
      const data = JSON.parse(text);

      if (!data.date || !data.title || !data.amount) {
        res.statusCode = 400;
        res.end('Please provide full data');

        return;
      }

      const filePath = path.resolve('db/expense.json');

      fs.writeFile(filePath, text, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          // eslint-disable-next-line no-console
          console.error('Error writing to file:', err);

          return;
        }

        res.setHeader('Content-type', 'application/json');
        res.statusCode = 200;
        res.end(text);
      });
    } catch (err) {
      res.statusCode = 400;
      res.end('Invalid JSON data');
      // eslint-disable-next-line no-console
      console.error('Error parsing JSON:', err);
    }
  });

  req.on('error', (err) => {
    res.statusCode = 400;
    res.end('Error');
    // eslint-disable-next-line no-console
    console.error('Error:', err);
  });
}

function createServer() {
  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Server error:', err);
  });

  return server;
}

module.exports = {
  createServer,
};
