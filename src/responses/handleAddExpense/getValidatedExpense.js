'use strict';

const { ERROR } = require('../../errors');

function formatDateToMMDDYYYY(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

function getValidatedExpense(newExpense) {
  /* eslint-disable-next-line prefer-const */
  let { name, amount, date, category } = newExpense;

  name = name !== undefined ? name.trim() : undefined;
  category = category !== undefined ? category.trim() : undefined;
  date = date !== undefined ? date.trim() : undefined;

  if (!newExpense) {
    throw new Error(ERROR.BAD_NEW_EXPENSE.message);
  }

  if (!name) {
    throw new Error(ERROR.EXPENSE_NAME_REQUIRED.message);
  }

  if (!(name instanceof String)) {
    throw new Error(ERROR.EXPENSE_NAME_MUST_BE_STRING.message);
  }

  if (!amount) {
    throw new Error(ERROR.AMOUNT_REQUIRED.message);
  }

  if (!(amount instanceof Number) && amount > 0) {
    throw new Error(ERROR.AMOUNT_MUST_BE_NUMBER.message);
  }

  if (!category) {
    throw new Error(ERROR.CATEGORY_REQUIRED.message);
  }

  if (!(category instanceof String)) {
    throw new Error(ERROR.CATEGORY_MUST_BE_STRING.message);
  }

  if (!date) {
    throw new Error(ERROR.DATE_REQUIRED.message);
  }

  if (!(date instanceof String)) {
    throw new Error(ERROR.DATE_MUST_BE_STRING.message);
  }

  date = new Date(date);

  if (date.toString() === 'Invalid Date') {
    throw new Error(ERROR.DATE_MUST_BE_VALID.message);
  }

  return {
    name,
    amount,
    date: formatDateToMMDDYYYY(date),
    category,
  };
}

module.exports = { getValidatedExpense };
