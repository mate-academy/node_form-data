'use strict';

const querystring = require('querystring');

const queryParser = (queryData) => querystring.parse(queryData);

module.exports = queryParser;
