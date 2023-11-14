/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const PORT = process.env.PORT || '3000';

const server = http.Server();

server.on('request', (req, res) => {
  if (req.url === '/data' && req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.statusCode = 400;
        res.end(JSON.stringify(err));

        return;
      }

      const filePath = path.join(__dirname, 'data.json');

      fs.writeFile(filePath, JSON.stringify(fields), (error) => {
        if (error) {
          console.error(error);
        } else {
          res.setHeader('Content-Type', 'text/html');

          const data = `
            <div>
              <div>Date: ${fields.date}</div>
              <br/>
              <div>Title: ${fields.title}</div>
              <br/>
              <div>Amount: ${fields.amount}</div>
            </div>
          `;

          res.end(data);
        }
      });
    });
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>App</title>
        </head>
        <body>
          <form action="/data" method="POST" enctype="multipart/form-data">
            <label for="date">
              Date:
              <input id="date" type="date" name="date" required />
            </label>
            <label for="title">
              Title:
              <input id="title" type="text" name="title" required />
            </label>
            <label for="sum">
              Amount:
              <input id="amount" type="number" name="amount" required />
            </label>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
    `);
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
