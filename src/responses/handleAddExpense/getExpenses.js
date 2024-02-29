'use strict';

const fs = require('fs/promises');
const { getDBpath } = require('../../helpers/getDBpath');

async function getExpenses() {
  const file = await fs.readFile(getDBpath(), 'utf-8');
  const expenses = JSON.parse(file);

  return expenses;
}

module.exports = {
  getExpenses,
};
