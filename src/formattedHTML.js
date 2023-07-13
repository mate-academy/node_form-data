'use strict';

const { Transform } = require('stream');

class FormattedHTML extends Transform {
  _transform(chunk, enc, cb) {
    const fileJSON = chunk.toString();
    const obj = JSON.parse(fileJSON);

    const pageHTML = `
      <div>
        <div>
          Date: ${obj.date}
        </div>

        <div>
          Name: ${obj.name}
        </div>

        <div>
          Amount: ${obj.amount}
        </div>
      </div>
    `;

    cb(null, pageHTML);
  }
}

module.exports = { FormattedHTML };
