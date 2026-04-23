/* eslint-disable no-console */
'use strict';

const http = require('node:http');
const { formidable } = require('formidable');
const fs = require('node:fs');
const path = require('node:path');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    if (req.url === '/' || req.url === '/favicon.ico') {
      res.on('error', (err) => {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });

        return res.end('Failed form parse!');
      });
      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.write(`
        <form action='/submit-expense' method="POST" style='display:flex; flex-direction:column; width:300px; justify-content:flex-end;'>
            <label for='date'>Date:</label>
            <input type='date' name='date' id='date' required />

            <label for='title'>Title:</label>
            <input type='text' name='title' id='title' required />

            <label for='amount'>Amount:</label>
            <input type='number' name='amount' id='amount' required />

            <button type='submit'>Submit</button>
        </form>
    `);

      return res.end('');
    }

    if (req.method === 'POST') {
      const form = formidable({});

      form.parse(req, (err, { date, title, amount }) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });

          return res.end('Form parse error!');
        }

        if (!date || !title || !amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });

          return res.end('All fields must be filled!');
        }

        const data = {
          date: date,
          title: title,
          amount: amount,
        };

        const jsonData = JSON.stringify(data);
        const normilizePath = path.resolve(__dirname, '../db/expense.json');

        if (!fs.existsSync(normilizePath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });

          return res.end('File not exist!');
        }

        const streamJson = fs.createWriteStream(normilizePath);

        streamJson.write(jsonData, () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });

          return res.end(jsonData);
        });
      });
    } else {
      res.statusCode = 404;

      return res.end('Form cannot load!');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
