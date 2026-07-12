'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const { writeFile } = require('fs/promises');

function createServer() {
  async function readRequestBody(req) {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString();

    return body;
  }

  function parseBody(body, contentType) {
    let obj = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);

      obj = {
        date: params.get('date'),
        title: params.get('title'),
        amount: params.get('amount'),
      };
    } else if (contentType.includes('application/json')) {
      obj = JSON.parse(body);
    }

    return obj;
  }

  return http.createServer(async (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    const expenseJsonPath = path.join(__dirname, '..', 'db', 'expense.json');

    if (req.method === 'GET' && req.url === '/add-expense') {
      res.statusCode = 404;

      return res.end('Method Not Allowed');
    }

    if (req.url !== '/add-expense' && req.url !== '/') {
      res.statusCode = 404;

      return res.end('Endpoint not exist');
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const body = await readRequestBody(req);

      const contentType = req.headers['content-type'] || '';

      try {
        const obj = parseBody(body, contentType);

        if (!obj.date || !obj.title || !obj.amount) {
          res.statusCode = 400;

          return res.end('Form is invalid');
        }

        const json = JSON.stringify(obj, null, 2);

        await writeFile(expenseJsonPath, json);

        const html = `
          <!DOCTYPE html>
            <html>
              <body>
                <pre>${json}</pre>
              </body>
            </html>`;

        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');

        return res.end(html);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-type', 'text/plain');
        res.end('Server error');
      }
    }

    if (req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');

      return fs.createReadStream(filePath).pipe(res);
    }
  });
}

module.exports = {
  createServer,
};
