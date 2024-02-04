'use strict';

const CORRECR_ENDPOINT = '/add-expense';
const FILE_PATH = './db/expense.json';

const PARAM_DATA = 'date';
const PARAM_TITLE = 'title';
const PARAM_AMOUNT = 'amount';

const http = require('http');
const fs = require('fs');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    if (pathname !== CORRECR_ENDPOINT) {
      res.statusCode = 404;
      res.end('Path is not correct');

      return;
    }

    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const text = Buffer.concat(chunks).toString();
      const data = JSON.parse(text);

      if (!data[PARAM_DATA] || !data[PARAM_TITLE] || !data[PARAM_AMOUNT]) {
        res.statusCode = 400;
        res.end('Data is nor correct');

        return;
      }

      // ---------- Synchronous recording
      // fs.writeFileSync(FILE_PATH, text); // change on stream
      // res.writeHead(200, { 'Content-Type': 'application/json' });
      // res.end(JSON.stringify(data));

      // ---------- Asynchronous recording
      const writeStream = fs.createWriteStream(FILE_PATH);

      writeStream.write(text);
      writeStream.end();

      writeStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(text);
      });

      writeStream.on('error', (err) => {
        res.statusCode = 500;
        res.end(`Error during writing: ${err}`);
      });
    });

    req.on('error', (err) => {
      res.statusCode = 400;
      res.end('Request error: ', err);
    });
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};
