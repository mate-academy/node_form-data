/* eslint-disable no-console */
'use strict';

const path = require('path');
const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const server = http.Server();

function showPageWithForm(res) {
  const filePath = path.join(__dirname, 'index.html');
  const readFileStream = fs.createReadStream(filePath);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  readFileStream.pipe(res);

  readFileStream.on('error', (error) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error reading file:', error.message);
  });

  res.on('close', () => readFileStream.destroy());
}

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/') {
    showPageWithForm(res);
  } else if (url.pathname === '/submit' && req.method === 'POST') {
    req.setEncoding('utf-8');

    req.on('data', (data) => {
      try {
        const formData = querystring.parse(data);
        const isFormValid = Object.values(formData).every(value => value);

        if (!isFormValid) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please return and choose all params in form');
        } else {
          res.end(JSON.stringify(formData));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal server error parsing JSON: ${error}`);
      }
    });
  } else if (url.pathname === '/submit' && req.method === 'GET') {
    res.statusCode = 400;
    res.end('Please return to home page');
  } else {
    res.statusCode = 400;
    res.end('Invalid search link');
  }
});

server.on('error', (res, error) => {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(`Internal Server Error: ${error}`);
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log('Server started! 🚀');
  console.log(`Available at http://localhost:${PORT}`);
});
