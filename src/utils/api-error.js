class ApiError extends Error {
  constructor(
    statusCode,
    message = "An error occurred",
    errors = [],
    stack = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
