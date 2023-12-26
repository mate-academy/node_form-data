'use strict';

const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

let expenses = [];

try {
  let fileData = '';

  if (fs.existsSync('./public/expenses.json')) {
    fileData = fs.readFileSync('./public/expenses.json', 'utf-8');
  }

  if (fileData.trim()) {
    expenses = JSON.parse(fileData);
  }
} catch (err) {
  throw new Error('Unable to read from json file. Data may be corrupted.');
}

app.post('/expenses', (req, res) => {
  expenses.push(req.body);

  fs.writeFile('./public/expenses.json', JSON.stringify(expenses), (err) => {
    if (err) {
      throw new Error('Unable to write to json file');
    }
  });

  res.send(expenses);
});

app.listen(3005);
