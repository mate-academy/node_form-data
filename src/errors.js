const serverError = (res, err) => {
  res.statusCode = 500;

  res.setHeader('Content-Type', 'application/json');

  res.message = 'Internal server Error';

  return res.end(JSON.stringify({ error: { message: err.message } }));
};

module.exports = { serverError };
