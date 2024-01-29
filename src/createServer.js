/* eslint-disable no-console */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const { formidable } = require('formidable');

function createServer() {
  const server = http.createServer();

  server.on('request', async(req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const data = await fs.readFile(path.resolve(__dirname, 'index.html'));

      res.end(data);
    } else if (req.method === 'POST' && req.url === '/add-expense') {
      const form = formidable({});
      let fields;

      try {
        [fields] = await form.parse(req);
      } catch (err) {
        console.error(err);
        res.end(String(err));

        return;
      }

      const formData = Object.entries({ ...fields }).reduce((acc, curr) => {
        acc[curr[0]] = Array.isArray(curr[1]) ? curr[1][0] : curr[1];

        return acc;
      }, {});

      if (!formData.title || !formData.title.length > 0
        || !formData.date || !formData.date.length > 0
        || !formData.amount || !formData.amount.length > 0
      ) {
        await fs.writeFile('db/expense.json', '{}');
        res.statusCode = 400;

        return res.end('Invalid form data');
      }

      await fs.writeFile('db/expense.json', JSON.stringify(formData));

      res.writeHead(200, { 'Content-Type': 'application/json' });

      res.end(JSON.stringify(formData));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
