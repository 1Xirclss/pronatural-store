/**
 * Utilidades para formatear y validar números telefónicos de El Salvador (+503 XXXX-XXXX).
 */

/**
 * Formatea cualquier texto/número al formato oficial de El Salvador: +503 XXXX-XXXX
 * - Mantiene el prefijo +503 fijo
 * - Filtra cualquier carácter no numérico (letras, símbolos)
 * - Máximo 8 dígitos numéricos
 * - Inserta automáticamente un guion "-" después del cuarto dígito
 */
export function formatElSalvadorPhone(value) {
  if (value === null || value === undefined) return '+503 ';

  let str = String(value);

  // Extraer únicamente los dígitos numéricos
  let digits = str.replace(/\D/g, '');

  // Si incluye el prefijo '503' al inicio y tiene más de 8 dígitos o traía '+503'
  if (digits.startsWith('503') && (digits.length > 8 || str.includes('+503'))) {
    digits = digits.slice(3);
  }

  // Máximo 8 dígitos permitidos
  digits = digits.slice(0, 8);

  if (digits.length === 0) {
    return '+503 ';
  }

  if (digits.length <= 4) {
    return `+503 ${digits}`;
  }

  return `+503 ${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/**
 * Valida si el valor ingresado corresponde a un número válido de El Salvador (exactamente 8 dígitos numéricos).
 */
export function isValidElSalvadorPhone(value) {
  if (!value) return false;
  let str = String(value);
  let digits = str.replace(/\D/g, '');
  if (digits.startsWith('503') && (digits.length > 8 || str.includes('+503'))) {
    digits = digits.slice(3);
  }
  return digits.length === 8;
}

export function isValidPhoneNumber(value) {
  return isValidElSalvadorPhone(value);
}

export function parseFullPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const rawDigits = digits.startsWith('503') && (digits.length > 8 || String(value).includes('+503'))
    ? digits.slice(3)
    : digits;
  return {
    rawDigits: rawDigits.slice(0, 8),
    fullFormatted: formatElSalvadorPhone(value)
  };
}
