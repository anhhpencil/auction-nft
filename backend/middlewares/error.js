const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line prefer-const
  let { statusCode, message } = err;
  // we alway return status code 200 for FE
  if (err.message === `Request failed with status code 429`) {
    message = 'Too many requests sent, wait and try again.';
  }
  const internalCode = statusCode;
  statusCode = 200;

  res.locals.errorMessage = err.message;

  const response = {
    hasError: true,
    statusCode,
    internalCode,
    message,
    data: {},
  };

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
