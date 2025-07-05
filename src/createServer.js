'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function createServer() {
  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;

    if (req.method === 'GET' && pathname === '/') {
      const indexPath = path.resolve('public', 'index.html');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(indexPath).pipe(res);

      return;
    }

    if (req.method === 'GET' && pathname === '/add-expense') {
      res.statusCode = 400;

      return res.end('Only POST method allowed');
    }

    if (req.method === 'POST' && pathname === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let dataObj;

        try {
          const contentType = req.headers['content-type'];

          if (contentType.includes('application/json')) {
            dataObj = JSON.parse(body);
          } else if (
            contentType.includes('application/x-www-form-urlencoded')
          ) {
            const parsed = new URLSearchParams(body);

            dataObj = Object.fromEntries(parsed.entries());
          } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });

            return res.end('Unsupported content type');
          }

          const { date, title, amount } = dataObj;

          if (!date || !title || !amount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });

            return res.end('Invalid data format');
          }

          const filePath = path.resolve('db', 'expense.json');

          fs.readFile(filePath, (err, fileData) => {
            let parsedFileData = [];

            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });

              return res.end(`Server error: ${err}`);
            } else {
              parsedFileData = JSON.parse(fileData);

              if (typeof parsedFileData === 'object') {
                if (Object.keys(parsedFileData).length) {
                  parsedFileData = [parsedFileData];
                  parsedFileData.push(dataObj);
                } else if (!Object.keys(parsedFileData).length) {
                  parsedFileData = dataObj;
                } else if (Array.isArray(parsedFileData)) {
                  parsedFileData.push(dataObj);
                }
              }

              const newData = JSON.stringify(parsedFileData, null, 2);

              fs.writeFile(filePath, newData, (error) => {
                if (error) {
                  res.writeHead(500, { 'Content-Type': 'text/plain' });

                  return res.end(`Server error: ${error}`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(newData);
              });
            }
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`Invalid request body: ${e.message}`);
        }
      });
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
