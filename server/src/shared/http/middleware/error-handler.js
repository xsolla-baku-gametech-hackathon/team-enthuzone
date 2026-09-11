const { AppError } = require('../../errors/app-error');

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

function errorHandler(error, _req, res, _next) {
  const isOperational = error instanceof AppError;
  const statusCode = isOperational ? error.statusCode : 500;

  if (!isOperational) {
    console.error(error);
  }

  const payload = {
    error: {
      code: isOperational ? error.code : 'INTERNAL_ERROR',
      message: isOperational ? error.message : 'An unexpected error occurred',
    },
  };

  if (isOperational && error.details) payload.error.details = error.details;
  res.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
