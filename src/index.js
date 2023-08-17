/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');

const form = `
  <form action="/expense" method="post">
    <label>Date: </label>
    <input type="date" name="date"><br>

    <label>Title: </label>
    <input type="text" name="title"><br>

    <label>Amount: </label>
    <input type="number" name="amount"><br>

    <button type="submit">Submit</button>
  </form>
`;

const PORT = 4200;
const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(form);
  } else if (pathname === '/expense' && req.method === 'POST') {
    handleExpense(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.on('error', () => {});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function handleExpense(req, res) {
  try {
    const body = await getRequestBody(req);
    const params = new URLSearchParams(body);
    const date = params.get('date');
    const title = params.get('title');
    const amount = parseFloat(params.get('amount'));

    if (!date || !title || isNaN(amount)) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error.');

      return;
    }

    const expense = {
      date, title, amount,
    };
    const expenses = await loadExpenses();

    expenses.push(expense);

    fs.writeFile('expenses.json', JSON.stringify(expenses, null, 2));

    res.writeHead(200, { 'Content-Type': 'text/html' });

    const successMessage = '<p>Expense saved successfully!</p>';

    res.end(successMessage);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error.');
  }
}

function loadExpenses() {
  try {
    const data = fs.readFileSync('expenses.json', 'utf8');

    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      resolve(body);
    });

    req.on('error', error => {
      reject(error);
    });
  });
}
