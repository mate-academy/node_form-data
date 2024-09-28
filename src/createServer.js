'use strict';

const { Server } = require('node:http');
const fs = require('fs');
const formidable = require('formidable');

function createServer() {
  const server = new Server();

  server.on('request', async (req, res) => {
    if (req.url === '/add-expense' && req.method === 'POST') {
      const FILE_WITH_DATA = './db/expense.json';

      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });

          return res.end('Error parsing form data');
        }

        if (!fields.date || !fields.title || !fields.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });

          return res.end('All filds should be filled');
        }

        const expensesData = {
          date: fields.date,
          title: fields.title,
          amount: fields.amount,
        };

        try {
          await fs.promises.writeFile(
            FILE_WITH_DATA,
            JSON.stringify(expensesData, null, 2),
          );
        } catch {
          res.writeHead(500, { 'Content-Type': 'text/plain' });

          return res.end('Error writing data to JSON file');
        }

        const fileStream = fs.createReadStream(FILE_WITH_DATA, 'utf8');

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': 'inline',
        });

        fileStream
          .on('error', () => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading ready file');
          })
          .pipe(res);

        res.on('finish', () => fileStream.destroy());
      });
    } else if (req.url === '/' && req.method === 'GET') {
      const FORM_PAGE = './public/index.html';

      if (!fs.existsSync(FORM_PAGE)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');

        return;
      }

      const fileStream = fs.createReadStream(FORM_PAGE, 'utf8');

      res.statusCode = 200;
      fileStream.pipe(res);

      fileStream.on('error', () => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('URL Not Found');
    }
  });

  server.on('error', () => {});

  return server;
}

module.exports = {
  createServer,
};
