'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/add-expense') {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const formData = Buffer.concat(chunks).toString();

      let expense;

      try {
        expense = JSON.parse(formData);
      } catch (err) {
        res.statusCode = 400;

        return res.end('Invalid JSON format');
      }

      const { date, title, amount } = expense;

      if (!date || !title || !amount) {
        res.statusCode = 400;

        return res.end('Missing required fields');
      }

      const filePath = path.join(__dirname, '../db/expense.json');

      let expenses = [];

      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');

        expenses = JSON.parse(fileContent);

        if (!Array.isArray(expenses)) {
          expenses = [];
        }
      } catch (err) {
        // Dacă fișierul nu există sau e invalid, începem cu un array gol
        expenses = [];
      }

      expenses.push(expense);

      try {
        fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2), 'utf8');
      } catch (err) {
        res.statusCode = 500;

        return res.end('Failed to save data');
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');

      return res.end(JSON.stringify(expense, null, 2));
    }

    if (req.method === 'GET' && url.pathname === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      return res.end(`

      <form method="POST" action="/add-expense">
        <label>Date: <input name="date" type="text" /></label><br/>
        <label>Title: <input name="title" type="text" /></label><br/>
        <label>Amount: <input name="amount" type="text" /></label><br/>
        <button type="submit">Submit</button>
      </form>
    `);
    }

    res.statusCode = 404;
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};
