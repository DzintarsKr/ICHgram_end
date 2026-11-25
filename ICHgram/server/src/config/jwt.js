import jwt from "jsonwebtoken";

const TOKEN_TTL = "7d";

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return process.env.JWT_SECRET;
};

export const signToken = (userId) =>
  jwt.sign({ id: userId }, getSecret(), { expiresIn: TOKEN_TTL });

export const verifyToken = (token) => jwt.verify(token, getSecret());
