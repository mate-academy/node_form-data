'use strict';

const fs = require('fs/promises');
const path = require('path');

function saveExpenses(newExpenses) {
  return fs.writeFile(
    path.join('db', 'expense.json'),
    JSON.stringify(newExpenses),
    'utf-8',
  );
}

module.exports = {
  saveExpenses,
};
