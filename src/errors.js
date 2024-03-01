'use strict';

const ERROR = {
  NOT_FOUND: {
    code: 404,
    message: 'Not found',
  },
  SERVER_ERROR: {
    code: 500,
    message: 'Internal Server Error',
  },
  BAD_NEW_EXPENSE: {
    code: 400,
    message: 'Bad request. Your new expense is not valid',
  },
  EXPENSE_NAME_REQUIRED: {
    code: 400,
    message: 'Expense name is required. Name should not be empty',
  },
  EXPENSE_NAME_MUST_BE_STRING: {
    code: 400,
    message: 'Expense name must be a string',
  },
  AMOUNT_REQUIRED: {
    code: 400,
    message: 'Amount is required. Amount should not be empty',
  },
  AMOUNT_MUST_BE_NUMBER: {
    code: 400,
    message: 'Amount must be a number and it should be greater than 0',
  },
  CATEGORY_REQUIRED: {
    code: 400,
    message: 'Category is required. Category should not be empty',
  },
  CATEGORY_MUST_BE_STRING: {
    code: 400,
    message: 'Category must be a string',
  },
  DATE_REQUIRED: {
    code: 400,
    message: 'Date is required. Date should not be empty',
  },
  DATE_MUST_BE_STRING: {
    code: 400,
    message: 'Date must be a string',
  },
  DATE_IS_NOT_VALID: {
    code: 400,
    message: 'Date is not valid. It should be in the format mm/dd/yyyy',
  },
};

module.exports = {
  ERROR,
};
