'use strict';

const path = require('path');

function getDBpath() {
  return path.join('db', 'expense.json');
};

module.exports = {
  getDBpath,
};
