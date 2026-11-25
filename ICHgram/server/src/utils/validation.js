const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export const toText = (value) =>
  typeof value === "string" ? value.trim() : "";

export const isValidEmail = (value) => EMAIL_PATTERN.test(value);

export const isValidUsername = (value) => USERNAME_PATTERN.test(value);

export const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
