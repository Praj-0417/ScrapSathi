class ApiError extends Error {
    constructor(errorCode, errors = [], stack = "") {
        super(errorCode.message);
        this.statusCode = errorCode.statusCode;
        this.message = errorCode.message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = { ApiError };
