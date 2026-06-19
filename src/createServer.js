'use strict';

const http = require('http');
const fs = require('fs');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Bad request');
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const formData = Buffer.concat(chunks).toString();

    try {
      const { date, title, amount } = JSON.parse(formData);

      if (!date || !title || !amount) {
        res.statusCode = 404;

        res.end('No data recieved');

        return;
      }

      fs.writeFile('./db/expense.json', formData, (error) => {
        if (error) {
          res.statusCode = 500;

          res.end('error saving data');

          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(formData);
      });
    } catch (error) {
      res.statusCode = 400;
      res.end(`${error} error`);
    }
  });

  return server;
}

module.exports = {
  createServer,
};
