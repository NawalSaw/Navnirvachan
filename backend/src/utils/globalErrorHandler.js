// Import ApiError if needed
import { ApiError } from "./ApiError.js"; // adjust the path

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // Optional: log the error stack for debugging
  console.error("Global Error Handler:", err);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    data: null,
  });
};

export default globalErrorHandler;
