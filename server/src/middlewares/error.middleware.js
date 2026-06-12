const { ApiError } = require('../utils/ApiError');
const ERROR_CODES = require('../constants/error-codes');

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
        });
    }

    console.error(err);
    return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR.statusCode).json({
        success: false,
        message: ERROR_CODES.INTERNAL_SERVER_ERROR.message,
    });
};

module.exports = errorHandler;
