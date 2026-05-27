const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new AppError('Error de validación', 422, errorMessages));
  }
  next();
};

module.exports = validate;