const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
}

const errorHandler = (error) => {
  try {
    // removed malicious Function.constructor code execution
    if (typeof error === 'string') {
      console.error('Error message:', error);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    } else {
      console.error('Error:', error);
    }
  } catch (globalError) {
    console.error('Unexpected error inside errorHandler:', globalError.message);
  }
};

// Express error handling middleware that uses errorHandler
const errorMiddleware = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  errorHandler(err);

  res.status(status).json({ error: message });
};

module.exports = { notFound, errorMiddleware };