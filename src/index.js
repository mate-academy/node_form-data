'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const PORT = process.env.PORT || 3001;

const server = http.Server();

server.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/submit') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status = 400;
        res.end(JSON.stringify(err));
      }

      const { date, title, amount } = fields;

      const data = {
        date: date[0],
        title: title[0],
        amount: amount[0],
      };

      const jsonFilePath = path.join(__dirname, 'output.json');
      let allData;

      try {
        allData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8', (error) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
        }));
      } catch (error) {
        allData = [];
      }

      allData.push(data);

      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(allData, null, 2),
        (error) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
        }
      );

      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport"
            content="width=device-width, initial-scale=1.0">
            <title>Expense Saved</title>
          </head>
          <body>
            <h1>Expense info</h1>
            <pre>${JSON.stringify(allData, null, 2)}</pre>
          </body>
        </html>
      `);
    });
  } else {
    const htmlContent = fs.readFileSync(
      path.join(__dirname, 'index.html')
    );

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is working on port http://localhost:${PORT}`);
});
