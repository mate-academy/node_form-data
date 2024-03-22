/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function getAllExpenses() {
  const pathToFile = path.join(__dirname, '../../db', 'expense.json');

  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(pathToFile, { encoding: 'utf8' });

    let data = '';

    fileStream.on('data', (chunk) => {
      data += chunk;
    });

    fileStream.on('end', () => {
      try {
        const normalizedData = JSON.parse(data);

        console.log('File data received:', normalizedData);
        resolve(normalizedData);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        reject(err);
      }
    });

    fileStream.on('error', (err) => {
      console.error('Error reading file:', err);
      reject(err);
    });
  });
}

module.exports = getAllExpenses;
