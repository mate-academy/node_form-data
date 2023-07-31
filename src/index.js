/* eslint-disable no-console, no-console,max-len */
'use strict';

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

const PORT = 3030;

const server = http.createServer(async(req, res) => {
  if (req.url === '/api/form' && req.method.toLowerCase() === 'post') {
    const form = formidable();

    let fields;

    try {
      [fields] = await form.parse(req);
    } catch (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));

      return;
    }

    const expenseData = {
      date: fields.date[0],
      title: fields.title[0],
      amount: fields.amount[0],
    };

    const parseToJson = JSON.stringify(expenseData);
    const createPath = `src/expenses/history-${fields.date[0]}.json`;

    const streamHistory = fs.createWriteStream(
      createPath, { encoding: 'utf8' });

    streamHistory.write(parseToJson);
    streamHistory.end();

    streamHistory.on('finish', () => {
      console.log('JSON data has been saved to expenseData.json');
    });

    streamHistory.on('error', (err) => {
      console.error('Error writing to file:', err);
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.end(`<!DOCTYPE html>
                      <html>
                        <head>
                            <title>Data Display</title>
                            <style>

                            th, td {
                                padding: 10px;
                            }

                            </style>
                        </head>

                        <body>
                            <h1>Expense Saved Successfully</h1>

                           <table border="1" >
                              <tr>
                                  <th>Date</th>
                                  <th>Title</th>
                                  <th>Amount</th>
                              </tr>
                              <tr>
                                  <td>${expenseData.date}</td>
                                  <td>${expenseData.title}</td>
                                  <td>${expenseData.amount}</td>
                              </tr>
                          </table>
                        </body>
                      </html>`);
  }

  res.end();
});

server.listen(PORT, () => {
  console.log('Server is running');
});
