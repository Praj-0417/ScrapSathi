const ERROR_CODES = {
    // General Errors
    INTERNAL_SERVER_ERROR: { statusCode: 500, message: 'Internal Server Error' },
    NOT_FOUND: { statusCode: 404, message: 'Not Found' },
    BAD_REQUEST: { statusCode: 400, message: 'Bad Request' },
    UNAUTHORIZED: { statusCode: 401, message: 'Unauthorized' },
    FORBIDDEN: { statusCode: 403, message: 'Forbidden' },

    // Auth Errors
    USER_ALREADY_EXISTS: { statusCode: 400, message: 'User with this email already exists' },
    INVALID_CREDENTIALS: { statusCode: 401, message: 'Invalid email or password' },
    TERMS_NOT_ACCEPTED: { statusCode: 400, message: 'You must accept the Terms and Conditions to register' },
    USER_NOT_FOUND: { statusCode: 404, message: 'User not found' },

    // OTP Errors
    INVALID_OTP: { statusCode: 400, message: 'Invalid OTP' },
    OTP_SEND_FAILED: { statusCode: 500, message: 'Failed to send OTP' },

    // Validation Errors
    VALIDATION_ERROR: { statusCode: 422, message: 'Validation Error' },
};

module.exports = ERROR_CODES;
