// server/middleware/error.middleware.js
export default function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  return res.status(status).json({ message });
}
