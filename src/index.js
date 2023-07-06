'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;

const createServer = () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      const pathToIndexHtml = path.join(__dirname, 'index.html');

      const readableStream = fs.createReadStream(pathToIndexHtml);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      readableStream.pipe(res);

      res.on('error', (err) => {
        res.statusCode = 404;

        res.end(err);
      });

      return;
    }

    if (req.url === '/expense') {
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        const formData = querystring.parse(data);
        const { date, title, amount } = formData;

        const expenseData = {
          date,
          title,
          amount,
        };

        const jsonData = JSON.stringify(expenseData, null, 2);
        const filePath = path.join(__dirname, 'expense.json');
        const writeableStream = fs.createWriteStream(filePath);

        writeableStream.write(jsonData, 'utf8');
        writeableStream.end();

        writeableStream.on('finish', () => {
          res.setHeader('Content-Type', 'text/html');

          res.end(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta
                  name="viewport"
                  content="width=device-width,
                  initial-scale=1.0"
                >
                <title>Expense Saved</title>
                <a href="/">Back Home </a>
              </head>
              <body>
                <h1>Expense Saved</h1>
                <pre>${jsonData}</pre>
              </body>
            </html>
          `);
        });

        writeableStream.on('error', () => {
          res.statusCode = 500;
          res.end('Internal Server Error');
        });
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

createServer();
