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
        try {
          const contentType = req.headers['content-type'];
          let dataObj;

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

          const dbDir = path.resolve('db');

          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
          }

          const filePath = path.join(dbDir, 'expense.json');

          fs.readFile(filePath, (err, fileData) => {
            let newDataForFile;

            if (!err && fileData.length > 0) {
              try {
                const temp = JSON.parse(fileData);

                if (Array.isArray(temp)) {
                  temp.push(dataObj);
                  newDataForFile = temp;
                } else if (
                  typeof temp === 'object' &&
                  temp !== null &&
                  Object.keys(temp).length > 0
                ) {
                  newDataForFile = [temp, dataObj];
                } else {
                  newDataForFile = dataObj;
                }
              } catch (e) {
                newDataForFile = dataObj;
              }
            } else {
              newDataForFile = dataObj;
            }

            fs.writeFile(
              filePath,
              JSON.stringify(newDataForFile, null, 2),
              (error) => {
                if (error) {
                  res.writeHead(500, { 'Content-Type': 'text/plain' });

                  return res.end(`Server error: ${error}`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(dataObj));
              },
            );
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`Invalid request body: ${e.message}`);
        }
      });

      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  });

  return server;
}

module.exports = {
  createServer,
};
