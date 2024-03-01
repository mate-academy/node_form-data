'use strict';

const { ERROR } = require('../../errors');

function isValidDate(dateString) {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d\d$/;

  if (dateString.match(regex) === null) {
    return false;
  }

  const parts = dateString.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function getValidatedExpense(newExpense) {
  /* eslint-disable-next-line prefer-const */
  let { title, amount, date, category } = newExpense;

  title = title !== undefined ? title.trim() : undefined;
  category = category !== undefined ? category.trim() : undefined;
  date = date !== undefined ? date.trim() : undefined;

  if (!newExpense) {
    throw new Error(ERROR.BAD_NEW_EXPENSE.message);
  }

  if (!title) {
    throw new Error(ERROR.EXPENSE_NAME_REQUIRED.message);
  }

  if (!(typeof title === 'string')) {
    throw new Error(ERROR.EXPENSE_NAME_MUST_BE_STRING.message);
  }

  if (!amount) {
    throw new Error(ERROR.AMOUNT_REQUIRED.message);
  }

  if (!(typeof amount === 'number') && amount > 0) {
    throw new Error(ERROR.AMOUNT_MUST_BE_NUMBER.message);
  }

  if (!category) {
    throw new Error(ERROR.CATEGORY_REQUIRED.message);
  }

  if (!(typeof category === 'string')) {
    throw new Error(ERROR.CATEGORY_MUST_BE_STRING.message);
  }

  if (!date) {
    throw new Error(ERROR.DATE_REQUIRED.message);
  }

  if (!(typeof date === 'string')) {
    throw new Error(ERROR.DATE_MUST_BE_STRING.message);
  }

  if (!isValidDate(date)) {
    throw new Error(ERROR.DATE_IS_NOT_VALID.message);
  }

  return {
    title,
    amount,
    date,
    category,
  };
}

module.exports = { getValidatedExpense };
