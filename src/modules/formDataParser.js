'use strict';

const fromDataParser = (data) => {
  const result = {};
  const dataChunks = data.replace(/\+/g, ' ').split('&');

  for (let i = 0; i < dataChunks.length; i++) {
    const chunk = dataChunks[i].split('=');

    result[chunk[0]] = chunk[1];
  }

  return result;
};

module.exports = {
  fromDataParser,
};
