/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const { URLSearchParams } = require('url');
const { tableWithData } = require('../modules/tableWithData');
const PORT = process.env.PORT || 3000;
const server = new http.Server();

const Requests = {
  index: '/ GET',
  data: '/data POST',
};

server.on('request', (req, res) => {
  const request = `${req.url} ${req.method}`;

  if (request === Requests.index) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    const fileName = url.pathname.slice(1) || 'index.html';
    const filePath = path.resolve('public', fileName);

    if (fileName === 'favicon.ico') {
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File does not exist');

      return;
    }

    const file = fs.createReadStream(filePath);

    file.on('error', () => {
      res.statusCode = 500;
      res.end('Something went wrong!');
    });

    file.on('close', () => {
      file.destroy();
    });

    file.pipe(res);
  } else if (request === Requests.data) {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      const data = new URLSearchParams(body);
      const date = data.get('date');
      const title = data.get('title');
      const amount = data.get('amount');
      const filePath = path.resolve('test', `${title}.json`);

      const info = { date, title, amount };

      try {
        fs.writeFileSync(filePath, JSON.stringify(info, null, 2));
      } catch (error) {
        res.statusCode = 500;
        res.end('Something went wrong');
      }

      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;

      res.end(tableWithData(info));
    });
  }
});

server.on('error', (error) => console.log(error));

server.listen(PORT, () => console.log(`Run on http://localhost:${PORT}`));
