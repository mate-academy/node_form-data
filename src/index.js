'use strict';
/* eslint-disable no-console */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { IncomingForm } = require('formidable');

const PORT = process.env.PORT || 8080;
const server = new http.Server();

server.on('request', (req, res) => {
  if (req.url === '/data' && req.method.toLowerCase() === 'post') {
    const form = new IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end(err);

        return;
      }

      const { date, title, amount } = fields;

      if (!date || !title || !amount) {
        res.statusCode = 400;
        res.end('All fields are required.');

        return;
      }

      const formData = {
        date: date[0],
        title: title[0],
        amount: amount[0],
      };

      const filepath = path.join(__dirname, 'history', `${date[0]}.json`);

      const formDataStream = fs.createWriteStream(filepath);

      formDataStream.on('error', () => {
        res.statusCode = 500;
        res.end('Server error');
      });

      formDataStream.write(JSON.stringify(formData, null, 2));
      formDataStream.end();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
            <title>Form data</title>
          </head>
          <body>
          <div class="container box is-max-desktop">
              <h1 class="title">Form data</h1>
    
              <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>${formData.date}</td>
                    <td>${formData.title}</td>
                    <td>${formData.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `);
    });

    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  const fileName = url.pathname.slice(1) || 'index.html';
  const filePath = path.resolve('public', fileName);
  const fileStream = fs.createReadStream(filePath);

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('File does not exist');
  }

  fileStream.pipe(res);

  fileStream.on('error', (error) => {
    res.statusCode = 500;
    res.end(`Server Error: ${error}`);
  });

  fileStream.on('close', () => {
    fileStream.destroy();
  });
});

server.on('error', (error) => {
  console.log(`Error occured: ${error}`);
});

server.listen(PORT, () => {
  console.log('Server started! 🚀');
  console.log(`http://localhost:${PORT}`);
});
