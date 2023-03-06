'use strict';

const http = require('http');
const fs = require('fs');
const expenseService = require('./services/expense.service');

const server = new http.Server();

const parseForm = async(req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const formQuery = Buffer.concat(chunks).toString();

  return Object.fromEntries(
    new URLSearchParams(formQuery).entries()
  );
};

const sendFile = (res, filePath) => {
  const file = fs.createReadStream(filePath);

  file.pipe(res);

  res.on('close', () => {
    file.destroy();
  });
};

server.on('request', async(req, res) => {
  switch (req.url) {
    case '/':
      sendFile(res, 'src/public/index.html');

      return;

    case '/list':
      if (req.method.toLowerCase() === 'post') {
        const expense = await parseForm(req);

        await expenseService.create(expense);
      }

      sendFile(res, 'src/data/expenses.json');

      return;

    default:
      res.status = 404;
      res.end();
  }
});

module.exports = { server };
