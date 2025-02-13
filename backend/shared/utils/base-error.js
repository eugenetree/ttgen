class BaseError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }
}

class NotFoundError extends BaseError {
  constructor(message, details = {}) {
    super(message, 'NOT_FOUND', details);
  }
}

class ValidationError extends BaseError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

class ExternalServiceError extends BaseError {
  constructor(message, details = {}) {
    super(message, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

module.exports = {
  BaseError,
  NotFoundError,
  ValidationError,
  ExternalServiceError,
}; 