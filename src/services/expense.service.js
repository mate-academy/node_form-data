'use strict';

const fs = require('fs/promises');
const path = require('path');

const filePath = path.resolve('src', 'data', 'expenses.json');

const getNewId = expenses => (
  Math.max(
    ...expenses.map(({ id }) => id), 0
  ) + 1
);

const read = async() => {
  const data = await fs.readFile(filePath, 'utf-8');

  return JSON.parse(data);
};

const write = async(expenses) => {
  const data = JSON.stringify(expenses, null, 2);

  await fs.writeFile(filePath, data, 'utf-8');
};

const create = async({
  date,
  title,
  amount,
}) => {
  const expenses = await read();

  const newExpense = {
    id: getNewId(expenses),
    date,
    title,
    amount,
  };

  expenses.push(newExpense);

  await write(expenses);
};

module.exports = {
  create,
};
