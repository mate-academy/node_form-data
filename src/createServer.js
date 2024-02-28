/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const endpoints = {
  ROOT: '/',
  EXPENSE: '/add-expense',
};

const EXPENSE_DB_PATH = path.resolve(__dirname, '../db/expense.json');
const ROOT_TEMPLATE_PATH = path.join(__dirname, 'public', 'index.html');

const allowedExpenseKeys = ['date', 'title', 'amount'];

function createServer() {
  const server = http.createServer((req, res) => {
    switch (req.url) {
      case endpoints.ROOT:
        handleIndexRequest(req, res);
        break;

      case endpoints.EXPENSE:
        handleAddExpenseRequest(req, res);
        break;

      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
  });

  server.on('error', (res, error) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Server Error: ${error}`);
  });

  return server;
}

function handleIndexRequest(req, res) {
  const readStream = fs.createReadStream(ROOT_TEMPLATE_PATH, 'utf8');

  readStream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });

  res.writeHead(200, { 'Content-Type': 'text/html' });
  readStream.pipe(res);
}

function handleAddExpenseRequest(req, res) {
  if (req.method.toLowerCase() !== 'post') {
    res.writeHead(400, { 'Content-Type': 'text/plain' });

    return res.end(`The ${req.method} method is not allowed`);
  }

  req.setEncoding('utf8');

  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const expense = JSON.parse(body);

      const isEveryKeyValid = allowedExpenseKeys.every(key => (
        key in expense && expense[key])
      );

      const isExpenseLengthValid
        = Object.keys(expense).length === allowedExpenseKeys.length;

      const isExpenseValid = isEveryKeyValid && isExpenseLengthValid;

      if (!isExpenseValid) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });

        return res.end('Invalid Expense');
      }

      const writeStream = fs.createWriteStream(EXPENSE_DB_PATH);

      writeStream.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error during writing: ${err}`);
      });

      writeStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense));
      });

      writeStream.write(JSON.stringify(expense, null, 2));
      writeStream.end();
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`error: ${err.message}`);
    }
  });
}

module.exports = {
  createServer,
};
