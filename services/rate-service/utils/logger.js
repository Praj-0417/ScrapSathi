const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'password',
  'token',
  'jwt',
  'secret',
  'otp',
]);

const redact = (value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  return JSON.parse(JSON.stringify(value, (key, currentValue) => {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      return '[REDACTED]';
    }

    if (currentValue instanceof Error) {
      return {
        name: currentValue.name,
        message: currentValue.message,
        stack: currentValue.stack,
      };
    }

    return currentValue;
  }));
};

const write = (level, message, metadata = {}) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...redact(metadata),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

module.exports = {
  info: (message, metadata) => write('info', message, metadata),
  warn: (message, metadata) => write('warn', message, metadata),
  error: (message, metadata) => write('error', message, metadata),
};
