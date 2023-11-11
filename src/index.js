/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');

function getResponse(response, params) {
  const postDataJson = JSON.stringify(params, null, 4);

  fs.writeFile('./params.json', postDataJson, (error) => {
    if (error) {
      console.log(error);
    }
  });

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(`<pre>${postDataJson}</pre>`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/response') {
    if (req.method.toLowerCase() === 'get') {
      const params = Object.fromEntries(url.searchParams.entries());

      getResponse(res, params);
    } else {
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      console.log(data);
      console.log(data.toString());

      req.on('end', () => {
        const params = {};

        data
          .toString()
          .split('&')
          .forEach(item => {
            const [ key, value ] = item.split('=');

            params[key] = value;
          });

        getResponse(res, params);
      });
    }

    return;
  }

  res.setHeader('Content-Type', 'text/html');

  res.end(`
  <form action="/response" method="get">
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
  console.log('Server is running');
});
