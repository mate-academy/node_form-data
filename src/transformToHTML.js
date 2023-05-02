'use strict';

const { Transform } = require('stream');

class TransformToHTML extends Transform {
  _transform(chunk, encoding, callback) {
    const json = chunk.toString();
    const obj = JSON.parse(json);

    const html = `<div>
      <div>
        Date: ${obj.date}
      </div>
      <br/>
      <div>
        Title: ${obj.title}
      </div>
      <br/>
      <div>
        Amount: ${obj.amount}
      </div>
    </div>`;

    callback(null, html);
  }
};

module.exports = { TransformToHTML };
