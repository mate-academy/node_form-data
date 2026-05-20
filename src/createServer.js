'use strict';

const http = require('node:http');

const path = require('node:path');

const fs = require('node:fs');

function createServer() {
  /* Write your code here */
  // Return instance of http.Server class
  const server = http.createServer((req, res) => {
    if (req.url === '/add-expense' && req.method.toLowerCase() === 'post') {
      let body = '';

      const dataPath = path.resolve(__dirname, '../db/expense.json');

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        // console.log('body: ', body);

        const expense = JSON.parse(body);

        if (!expense.date || !expense.title || !expense.amount) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });

          res.end(
            // eslint-disable-next-line max-len
            'Error: request is submitted without all params: date, title, amount.',
          );

          return;
        }

        fs.appendFileSync(dataPath, JSON.stringify(expense));

        // res.writeHead(200, { 'Content-Type': 'application/json' });
        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.write(`${JSON.stringify(expense)}`);

        res.end();
      });

      return;
    }

    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      res.write('<script type="text/javascript">');
      res.write('function submitForm(e) {');
      res.write('e.preventDefault();');
      res.write('const date = document.getElementById("date").value;');
      res.write('const title = document.getElementById("title").value;');
      res.write('const amount = document.getElementById("amount").value;');
      res.write('const body = { date: date, title: title, amount: amount };');

      res.write(
        // eslint-disable-next-line max-len
        'fetch("/add-expense", { method: "POST", body: JSON.stringify(body) })',
      );

      res.write('.then(response => response.json())');

      res.write(
        // eslint-disable-next-line max-len
        '.then(data => { document.getElementById("message").innerHTML = JSON.stringify(data) });',
      );

      res.write('return false;');

      res.write('}');

      res.write('</script>');

      res.write('<form onsubmit="return submitForm(event)">');

      res.write('<label for="date">Date: </label>');
      res.write('<input type="text" id="date" name="date"><br>');
      res.write('<label for="title">Title: </label>');
      res.write('<input type="text" id="title" name="title"><br>');
      res.write('<label for="amount">Amount: </label>');
      res.write('<input type="text" id="amount" name="amount"><br>');

      res.write('<input type="submit" value="submit"><br>');
      res.write('<label id="message"></label><br>');
      res.write('</form>');

      res.end();

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });

    res.end('Error: Invalid Url');
  });

  return server;
}

module.exports = {
  createServer,
};
