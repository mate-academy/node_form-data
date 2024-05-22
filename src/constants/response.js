const response = {
  200: {
    statusCode: 200,
  },
  400: {
    statusCode: 400,
    messages: {
      data: 'Please check if all data was sent: date, title, amount?',
    },
  },
  404: {
    statusCode: 404,
    messages: {
      notFound: 'Invalid URL',
    },
  },
};

module.exports = { response };
