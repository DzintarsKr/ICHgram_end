import { verifyToken } from "../config/jwt.js";
import HttpError from "../utils/httpError.js";

const authMiddleware = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Authentication required"));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }

  req.user = { id: payload.id };
  next();
};

export default authMiddleware;
