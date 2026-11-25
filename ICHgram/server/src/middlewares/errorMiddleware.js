import multer from "multer";
import HttpError from "../utils/httpError.js";

export const notFound = (req, res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode ?? error.status ?? 500;
  let message = error.message;

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be 3 MB or smaller"
        : error.message;
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  } else if (error.name === "ValidationError") {
    statusCode = 400;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "Resource already exists";
  }

  if (statusCode >= 500) {
    console.error(error);
    message = "Internal server error";
  }

  res.status(statusCode).json({ message });
};
