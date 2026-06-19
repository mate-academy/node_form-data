'use strict';

/* eslint-disable no-console */

const { createReadStream, createWriteStream, mkdirSync } = require('fs');
const http = require('http');
const path = require('path');

function createServer() {
  const server = new http.Server();

  function getHandler(req, res) {
    if (req.method !== 'GET') {
      return;
    }

    if (req.url !== '/' && req.url !== '') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');

      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const form = createReadStream(path.join(__dirname, 'index.html'));

    form.on('error', (err) => {
      console.error('Read stream error:', err);

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        res.end();
      } else {
        res.destroy();
      }
    });

    res.on('close', () => {
      form.destroy();
    });

    form.pipe(res);
  }

  function postHandler(req, res) {
    if (req.method !== 'POST') {
      return;
    }

    if (req.url !== '/add-expense' && req.url !== '/submit-expense') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');

      return;
    }

    const file = path.resolve('db', 'expense.json');

    let raw = '';

    req.setEncoding('utf8');

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      let payload;

      try {
        if (contentType.includes('application/json')) {
          payload = raw ? JSON.parse(raw) : {};
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(raw);

          payload = Object.fromEntries(params.entries());
        } else {
          payload = {};
        }
      } catch (parseErr) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Bad Request');

        return;
      }

      const expense = {
        date: payload.date,
        title: payload.title,
        amount: payload.amount,
      };

      // Validation
      const parsedAmount =
        typeof expense.amount === 'string'
          ? parseFloat(expense.amount)
          : Number(expense.amount);
      const parsedDate = new Date(expense.date);

      const hasAll = Boolean(expense.date && expense.title && expense.amount);
      const amountValid =
        !Number.isNaN(parsedAmount) && Number.isFinite(parsedAmount);
      const dateValid = !Number.isNaN(parsedDate.getTime());

      if (!hasAll || !amountValid || !dateValid) {
        if (contentType.includes('application/json')) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Invalid payload');
        } else {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');

          res.end(
            `<!doctype html><html><head><meta charset="utf-8"><title>Error</title></head><body><h1>Invalid input</h1><p>Please provide a valid date, title, and numeric amount.</p></body></html>`,
          );
        }

        return;
      }

      const normalizedExpense = {
        date: expense.date,
        title: expense.title,
        amount: String(expense.amount),
      };

      try {
        mkdirSync(path.dirname(file), { recursive: true });
      } catch (mkdirErr) {
        console.error('Directory create error:', mkdirErr);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');

        return;
      }

      const writer = createWriteStream(file);

      writer.on('error', (error) => {
        console.error('Write stream error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      });

      const pretty = JSON.stringify(normalizedExpense, null, 2);

      writer.end(pretty, () => {
        res.statusCode = 200;

        if (contentType.includes('application/json')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(normalizedExpense));
        } else {
          const escaped = pretty
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          res.setHeader('Content-Type', 'text/html; charset=utf-8');

          res.end(
            `<!doctype html><html><head><meta charset="utf-8"><title>Saved</title></head><body><h1>Expense saved</h1><pre>${escaped}</pre></body></html>`,
          );
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Bad Request');
    });
  }

  server.on('request', getHandler);
  server.on('request', postHandler);

  server.on('request', (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Method Not Allowed');
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};
