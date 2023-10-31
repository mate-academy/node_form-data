'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('src/index.html', (err, data) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error reading index.html:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');

        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/submit') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error parsing form data:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      } else {
        const expense = {
          date: fields.date,
          title: fields.title,
          amount: fields.amount,
        };

        const jsonExpense = JSON.stringify(expense, null, 2);

        fs.appendFile('expenses.json', jsonExpense + '\n', (erro) => {
          if (erro) {
            // eslint-disable-next-line no-console
            console.error('Error saving expense data:', erro);
            res.statusCode = 500;
            res.end('Internal Server Error');
          } else {
            fs.readFile('src/expense_saved.html', (er, data) => {
              if (er) {
                // eslint-disable-next-line no-console
                console.error('Error reading expense_saved.html:', er);
                res.statusCode = 500;
                res.end('Internal Server Error');

                return;
              }

              res.setHeader('Content-Type', 'text/html');
              res.end(data.toString().replace('%jsonExpense%', jsonExpense));
            });
          }
        });
      }
    });
  } else {
    // Handle other routes
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const port = 3005;

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
