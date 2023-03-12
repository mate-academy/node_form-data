'use strict';

const fs = require('fs');

const updateJSON = (newData) => {
  let dataFromJSON = {};

  try {
    const data = fs.readFileSync('src/public/expenses.json');

    dataFromJSON = JSON.parse(data.toString());
    dataFromJSON.expenses.push(newData);

    const preparedJSON = JSON.stringify(dataFromJSON, null, 2);

    fs.writeFileSync('src/public/expenses.json', preparedJSON);

    return preparedJSON;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  updateJSON,
};
