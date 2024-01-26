/* eslint-disable no-console */
'use strict';

const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
      if (err) {
        res.statusCode = 400;
        res.end(err.message);
      }

      const filePath = path.join(__dirname, 'expense.json');

      console.log(fields.amount);
      console.log(fields);

      try {
        fs.writeFileSync(filePath, JSON.stringify(fields), 'utf8');
      } catch (error) {
        console.error(error);
      }

      const data = `
          <div>
           <h3>${fields.date}</h3>
           <p>Expense for ${fields.title} was ${fields.amount}</p>
          </div>
        `;

      res.end(data);
    });
  }
});

server.on('error', (err) => console.log(err.message));

server.listen(3000, () => {
  console.log('server run');
});
