/* eslint-disable no-console */
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/submit', async(req, res) => {
  const { date, title, amount } = req.body;
  const expense = {
    date,
    title,
    amount,
  };

  try {
    let existingData;

    try {
      existingData = await fs.readFile('src/expenses.json', 'utf-8');
    } catch (readError) {
      console.error(readError);
      existingData = '[]';
    }

    let expenses;

    try {
      expenses = existingData.trim() ? JSON.parse(existingData) : [];
    } catch (parseError) {
      console.error(parseError);
      expenses = [];
    }

    expenses.push(expense);

    await fs.writeFile('src/expenses.json', JSON.stringify(expenses, null, 2));

    res.send(`<pre>${JSON.stringify(expense, null, 2)}</pre>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
