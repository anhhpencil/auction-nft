const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const auth = () => async (req, res, next) => {
  try {
    // Impelement auth here
    next();
  } catch (e) {
    // Should replace with logger
    console.error(`Error from auth: ${e}`);
    next(new ApiError(httpStatus.BAD_REQUEST, e.message));
  }
};

module.exports = { auth };
