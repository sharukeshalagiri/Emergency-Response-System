class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message = 'Internal Server Error' } = err;

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    path: req.path,
    method: req.method,
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Internal Server Error' 
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Validation error handler
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: 'Validation Error',
        details: errors
      }
    });
  }
  next(err);
};

// Not found handler
const notFoundHandler = (req, res, next) => {
  const error = new ErrorHandler(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

module.exports = {
  ErrorHandler,
  errorHandler,
  validationErrorHandler,
  notFoundHandler
};