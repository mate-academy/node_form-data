/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
const server = new http.Server();

server.on('request', (req, res) => {
  const baseUrl = req.url.slice(1);

  if (!baseUrl) {
    const htmlStream = fs.createReadStream('public/index.html');

    pipeline(htmlStream, res, () => {
      res.statusCode = 500;
      res.end('something wrong with index.html');
    });
  } else if (baseUrl === 'form') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      body = querystring.parse(body);
      res.end(JSON.stringify(body));
    });
  } else {
    res.end('wrong url');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
