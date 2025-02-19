'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
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

        return res.end('No data provided');
      }

      const filePath = path.resolve('db/expense.json');

      fs.writeFile(filePath, formData, (err) => {
        if (err) {
          res.statusCode = 500;

          return res.end('Error saving data');
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(formData);
      });
    } catch (err) {
      res.statusCode = 400;
      res.end('Invalid JSON format');
    }
  });
}

module.exports = {
  createServer,
};
