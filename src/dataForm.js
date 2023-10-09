'use strict';

const fs = require('fs');
const formidable = require('formidable');

function dataForm(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields) => {
    if (err) {
      res.statusCode = 400;
      res.end(err);

      return;
    }

    const fieldsNormalized = JSON.stringify(fields);

    fs.writeFile('./src/data.json', fieldsNormalized, (error) => {
      if (error) {
        res.statusCode = 500;
        res.end('File error');

        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;

      res.write(
        `
        <h2>Date: ${fields.date}</h2>
        <h2>Title: ${fields.text}</h2>
        <h2>Amount: ${fields.amount}</h2>
      `
      );
      res.end();
    });
  });
}

module.exports = { dataForm };
