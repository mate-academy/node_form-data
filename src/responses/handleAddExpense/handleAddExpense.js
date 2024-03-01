/* eslint-disable no-var */
'use strict';

const { ERROR } = require('../../errors');
const { getExpenses } = require('./getExpenses');
const { getNewExpense } = require('./getNewExpense');
const { saveExpenses } = require('./saveExpenses');
const { getValidatedExpense } = require('./getValidatedExpense');

async function handleAddExpense(request, response) {
  let expenses, newExpense;

  try {
    expenses = await getExpenses();
  } catch (err) {
    response.statusCode = ERROR.SERVER_ERROR.code;
    /* eslint-disable no-console */
    console.error(err);
    response.end(ERROR.SERVER_ERROR.message);

    return;
  }

  try {
    newExpense = await getNewExpense(request);

    expenses.push(newExpense);
  } catch (err) {
    response.statusCode = ERROR.BAD_NEW_EXPENSE.code;
    response.end(ERROR.BAD_NEW_EXPENSE.message);

    return;
  }

  try {
    newExpense = getValidatedExpense(newExpense);
  } catch (error) {
    console.error(error);
    response.statusCode = ERROR.BAD_NEW_EXPENSE.code;
    response.end(error.message);

    return;
  }

  try {
    await saveExpenses(expenses);

    response.end('OK');
  } catch (err) {
    response.statusCode = ERROR.SERVER_ERROR.code;
    /* eslint-disable no-console */
    console.error(err);
    response.end(ERROR.SERVER_ERROR.message);
  }
}

module.exports = {
  handleAddExpense,
};
