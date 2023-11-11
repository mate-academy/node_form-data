/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/response') {
    const data = [];

    req.on('data', chunk => {
      data.push(chunk);
    });

    req.on('end', () => {
      const params = {};

      data
        .join('')
        .split('&')
        .forEach(item => {
          const [ key, value ] = item.split('=');

          params[key] = value;
        });

      const postDataJson = JSON.stringify(params, null, 4);

      fs.writeFile('./params.json', postDataJson, (error) => {
        if (error) {
          console.log(error);
        }
      });

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<pre>${postDataJson}</pre>`);
    });

    return;
  }

  res.setHeader('Content-Type', 'text/html');

  res.end(`
  <form action="/response" method="post">
    <input type="date" name="date">
    <input type="text" name="title">
    <input type="number" name="amount">
    <button type="submit">submit</button>
  </form>
  `);
});

server.on('error', (error) => {
  console.log('Server error ', error);
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
