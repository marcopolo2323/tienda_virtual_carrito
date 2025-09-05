/**
 * Custom error response class
 */

class ErrorResponse extends Error {
  /**
   * Create a new ErrorResponse instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} [errors] - Additional error details
   */
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; 
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   * @returns {Object} Formatted error response
   */
  toJSON() {
    const response = {
      success: false,
      status: this.statusCode,
      message: this.message
    };

    if (this.errors) {
      response.errors = this.errors;
    }

    return response;
  }
}

module.exports = ErrorResponse;