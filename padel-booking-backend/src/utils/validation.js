import mongoose from "mongoose";

export function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

export function normalizeText(value, maxLength = 80) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizePhone(value) {
  return String(value || "").replace(/[^\d+\-\s()]/g, "").trim().slice(0, 20);
}

export function isValidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}
