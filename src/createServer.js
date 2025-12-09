/* eslint-disable no-useless-return */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/expense' && req.method === 'POST') {
      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields) => {
        if (err) {
          res.statusCode = 400;
          res.end('Invalid form data');

          return;
        }

        const date = fields.date ? fields.date[0] : null;
        const title = fields.title ? fields.title[0] : null;
        const amount = fields.amount ? fields.amount[0] : null;

        if (!date || !title || !amount) {
          res.statusCode = 400;
          res.end('Missing date or title or amount');

          return;
        }

        const newExpense = { date, title, amount };
        const dbPath = path.resolve('db', 'expense.json');

        const readStream = fs.createReadStream(dbPath, { encoding: 'utf8' });
        let fileData = '';

        readStream.on('error', (e) => {
          if (e.code === 'ENOENT') {
            processExpense([], newExpense, dbPath, res);
          } else {
            res.statusCode = 500;
            res.end('Database read error');
          }
        });

        readStream.on('data', (chunk) => {
          fileData += chunk;
        });

        readStream.on('end', () => {
          let expenses = [];

          try {
            expenses = fileData ? JSON.parse(fileData) : [];
          } catch (e) {
            expenses = [];
          }

          processExpense(expenses, newExpense, dbPath, res);
        });
      });

      return;
    }

    const fileName = url.pathname.slice(1) || 'index.html';
    const filePath = path.resolve('src', fileName);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File not found');

      return;
    }

    const fStream = fs.createReadStream(filePath);

    fStream.pipe(res);

    fStream.on('error', () => {
      res.statusCode = 500;
      res.end('Server error');
    });

    res.on('close', () => fStream.destroy());
  });

  server.on('error', () => {});

  return server;
}

function processExpense(expenses, newItem, dbPath, res) {
  expenses.push(newItem);

  const jsonString = JSON.stringify(expenses, null, 2);

  const dirPath = path.dirname(dbPath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const writeStream = fs.createWriteStream(dbPath);

  writeStream.write(jsonString);
  writeStream.end();

  writeStream.on('finish', () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Expense Added</title>
        <style>pre { background: #f4f4f4; padding: 15px; border-radius: 5px; }</style>
      </head>
      <body>
        <h1>Expense saved successfully</h1>
        <pre>${jsonString}</pre>
        <a href="/">Back to form</a>
      </body>
      </html>
    `);
  });

  writeStream.on('error', () => {
    res.statusCode = 500;
    res.end('Database write error');
  });
}

module.exports = {
  createServer,
};
