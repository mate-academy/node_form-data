'use strict';
/* eslint-disable no-console */

const http = require('http');
const fs = require('fs');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    if (req.url !== '/add-expense') {
      res.statusCode = 404;
      res.statusMessage = 'Not found';
      res.end();

      return;
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const stringData = Buffer.concat(chunks).toString();
    const parsedData = JSON.parse(stringData);
    const { date, title, amount } = parsedData;

    const hasAllAvailableKeys =
      Boolean(date) && Boolean(title) && Boolean(amount);

    if (!hasAllAvailableKeys) {
      res.statusCode = 400;
      res.statusMessage = 'All keys were not provided';
      res.end(JSON.stringify([parsedData]));

      return;
    }

    res.setHeader('Content-Type', 'application/json');

    const writeStream = fs.createWriteStream('./db/expense.json');

    writeStream.write(JSON.stringify(parsedData));
    writeStream.end();

    writeStream.on('finish', () => {
      res.end(JSON.stringify(parsedData));
    });
  });

  return server;
}

module.exports = {
  createServer,
};
