'use strict';

const fs = require('fs');

function writeLog(
  title,
  amount,
  date,
) {
  const tableRow = `
    <tr>
      <td class="tg-0lax">${date}</td>
      <td class="tg-0lax">${title}</td>
      <td class="tg-0lax">${amount}</td>
    </tr>
  `;

  if (fs.existsSync('./public/spendingsLog.html')) {
    fs.appendFileSync('./public/spendingsLog.html', tableRow);
  } else {
    const tableTemplate = fs.readFileSync('./public/tableTemplate.txt');
    const table = tableTemplate + tableRow;

    fs.writeFileSync('./public/spendingsLog.html', table);
  }
}

module.exports.writeLog = writeLog;
