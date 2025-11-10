export const sanitizeName = (value = "") =>
  value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ'\s]/g, "").replace(/\s{2,}/g, " ");

export const sanitizeMessage = (value = "") => value.replace(/\s{2,}/g, " ");

export const sanitizeAlphanumeric = (value = "") => value.replace(/[^A-Za-z0-9._-]/g, "");

export const sanitizeNumeric = (value = "") => value.replace(/\D/g, "");

export const sanitizePhone = (value = "") =>
  value
    .replace(/[^0-9+]/g, "")
    .replace(/(?!^)[+]/g, "")
    .slice(0, 16);

export const sanitizeCardNumber = (value = "") => sanitizeNumeric(value).slice(0, 19);

export const sanitizeCardExpiry = (value = "") => {
  const digits = sanitizeNumeric(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const sanitizeCVV = (value = "") => sanitizeNumeric(value).slice(0, 4);

export const sanitizeDecimal = (value = "") => {
  const normalized = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  if (!normalized.includes(".")) {
    return normalized;
  }
  const [enteros, ...decimales] = normalized.split(".");
  return `${enteros}.${decimales.join("")}`;
};

export const isValidName = (value = "") =>
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:['\s][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(value.trim());

export const isValidEmail = (value = "") => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value.trim());

export const isValidPhone = (value = "") => /^\+?\d{6,15}$/.test(value.trim());

export const isValidDocument = (value = "") => /^\d{6,12}$/.test(value.trim());

export const isValidCardNumber = (value = "") => /^\d{13,19}$/.test(value.trim());

export const isValidExpiry = (value = "") => /^\d{2}\/\d{2}$/.test(value.trim());

export const isValidCVV = (value = "") => /^\d{3,4}$/.test(value.trim());