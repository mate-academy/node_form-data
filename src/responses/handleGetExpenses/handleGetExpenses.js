'use strict';

const fs = require('fs');
const { ERROR } = require('../../errors');
const { getDBpath } = require('../../helpers/getDBpath');

async function handleGetExpenses(request, response) {
  try {
    const expenses = fs.createReadStream(getDBpath());

    expenses.pipe(response);
  } catch (err) {
    response.statusCode = ERROR.SERVER_ERROR.code;
    /* eslint-disable no-console */
    console.error(err);
    response.end(ERROR.SERVER_ERROR.message);
  }
};

module.exports = {
  handleGetExpenses,
};
