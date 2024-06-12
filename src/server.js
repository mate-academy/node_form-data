'use strict';

const http = require('http');
const fs = require('fs');

const server = new http.Server();

server.on('request', async(req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');

    const page = fs.createReadStream('src/public/index.html');

    page.on('error', () => {
      res.statusCode = 404;
      res.end('Something went wrong');
    });

    page.pipe(res);
  }

  if (req.url === '/favicon.ico') {
    res.setHeader('Content-Type', 'image/x-icon');

    const page = fs.createReadStream('src/public/favicon.png');

    page.on('error', () => {
      res.statusCode = 404;
      res.end('Something went wrong');
    });

    page.pipe(res);
  }

  if (req.url === '/expense' && req.method === 'POST') {
    const reqChunks = [];

    for await (const chunk of req) {
      reqChunks.push(chunk);
    }

    const dataText = Buffer.concat(reqChunks).toString();

    const myURL = new URL('http://localhost:3000/?' + dataText);
    const date = myURL.searchParams.get('date');
    const title = myURL.searchParams.get('title');
    const amount = myURL.searchParams.get('amount');

    const newExpense = {
      date,
      title,
      amount,
    };

    const expenseDataStream = fs.createReadStream('src/expense.json');

    expenseDataStream.on('error', () => {
      res.statusCode = 500;
      res.end('Something went wrong');
    });

    const expenseDataChunks = [];

    expenseDataStream.on('data', (chunk) => {
      expenseDataChunks.push(chunk);
    });

    expenseDataStream.on('end', () => {
      const text = Buffer.concat(expenseDataChunks).toString();
      const expenseData = JSON.parse(text);

      expenseData.expenses.push(newExpense);

      fs.writeFileSync('src/expense.json',
        (JSON.stringify(expenseData))
      );

      res.setHeader('Content-Type', 'text/html');

      res.end(
        `<h3>New expense succesfully added!</h3>
        <h4>All your expenses:</h4>
        ${JSON.stringify(expenseData)}`
      );
    });
  }
});

server.on('error', () => {});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started');
});
