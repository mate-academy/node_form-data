/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 3000;
const server = new http.Server();

server.on('request', async(req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/expenses' && req.method.toUpperCase() === 'GET') {
    if (!fs.existsSync('./src/expenses.json')) {
      res.statusCode = 404;
      res.end('File does not exist');

      return;
    }

    res.setHeader('Content-Type', 'text/plain');

    const file = fs.createReadStream('./src/expenses.json');

    file.pipe(res);

    file.on('error', () => {
      res.statusCode = 500;
      res.end('Server error');
    });

    res.on('close', () => {
      file.destroy();
    });

    return;
  }

  if (pathname === '/send' && req.method.toUpperCase() === 'POST') {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const newData = {};
    const receivedData = Buffer.concat(chunks).toString();

    receivedData
      .split('&')
      .forEach(field => {
        const [ name, value ] = field.split('=');

        newData[name] = value;
      });

    fs.readFile('./src/expenses.json', 'utf-8', (error, fileData) => {
      if (error) {
        console.log('Error occurred when reading a file:', error);

        return;
      }

      const updatedData = JSON.parse(fileData);

      updatedData.expenses.push(newData);

      fs.writeFile(
        './src/expenses.json',
        JSON.stringify(updatedData, null, 2),
        err => {
          if (err) {
            console.log('Error occurred when writing a file:', error);
          }
        });
    });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  res.end(
    `<h1 class="title">Form data:</h1>

    <form
      action="/send"
      method="post"
    >
      <label>Date:
        <input name="date" type="date" required>
      </label>

      <label>Title:
        <input name="title" type="text" required>
      </label>

      <label>Amount:
        <input name="amount" type="number" required>
      </label>

      <button type="submit">Send</button>
    </form>

    <a href="/expenses" target="_blank">Get all expenses</a>`
  );
});

server.on('error', (error) => {
  console.log('Error occurred:', error);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
