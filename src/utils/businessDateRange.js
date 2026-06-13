const BOGOTA_TZ = "America/Bogota";
const MAX_BUSINESS_DAYS = 31;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class BusinessDateRangeError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "BusinessDateRangeError";
    this.statusCode = statusCode;
  }
}

function parseDateString(dateString) {
  if (!dateString || !DATE_REGEX.test(dateString)) {
    throw new BusinessDateRangeError(
      `Fecha inválida: ${dateString ?? ""}. Use formato YYYY-MM-DD`
    );
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new BusinessDateRangeError(`Fecha inválida: ${dateString}`);
  }

  return parsed;
}

/**
 * Día operativo actual en Colombia (05:00–04:59:59). Antes de las 05:00 cuenta como el día anterior.
 * @returns {string} YYYY-MM-DD
 */
export function getCurrentBusinessDayColombia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type)?.value;

  let year = Number(get("year"));
  let month = Number(get("month"));
  let day = Number(get("day"));
  const hour = Number(get("hour"));

  if (Number.isNaN(hour) || hour < 5) {
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - 1);
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Rango UTC de un día operativo: 05:00 COL → 04:59:59 COL del día siguiente.
 * @param {string} dateString YYYY-MM-DD
 */
export function getUTCDateRangeForBusinessDay(dateString) {
  parseDateString(dateString);

  const [year, month, day] = dateString.split("-").map(Number);
  const startUTC = new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0));
  const endUTC = new Date(Date.UTC(year, month - 1, day + 1, 9, 59, 59, 999));

  return { startUTC, endUTC };
}

function countInclusiveBusinessDays(startDate, endDate) {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);

  if (end < start) {
    throw new BusinessDateRangeError("endDate no puede ser anterior a startDate");
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Construye el rango de consulta según día operativo AMIN (05:00–04:59:59 America/Bogota).
 *
 * @param {{ startDate?: string, endDate?: string }} params
 * @returns {{ startUTC: Date, endUTC: Date, startDate: string, endDate: string }}
 */
export function buildBusinessDateRange({ startDate, endDate } = {}) {
  let effectiveStart;
  let effectiveEnd;

  if (!startDate && !endDate) {
    effectiveStart = getCurrentBusinessDayColombia();
    effectiveEnd = effectiveStart;
  } else if (startDate && !endDate) {
    effectiveStart = startDate;
    effectiveEnd = startDate;
  } else if (startDate && endDate) {
    effectiveStart = startDate;
    effectiveEnd = endDate;
  } else {
    throw new BusinessDateRangeError("Si envía endDate debe enviar también startDate");
  }

  parseDateString(effectiveStart);
  parseDateString(effectiveEnd);

  const dayCount = countInclusiveBusinessDays(effectiveStart, effectiveEnd);
  if (dayCount > MAX_BUSINESS_DAYS) {
    throw new BusinessDateRangeError(
      `El rango máximo permitido es de ${MAX_BUSINESS_DAYS} días operativos (solicitados: ${dayCount})`
    );
  }

  const startRange = getUTCDateRangeForBusinessDay(effectiveStart);
  const endRange = getUTCDateRangeForBusinessDay(effectiveEnd);

  return {
    startUTC: startRange.startUTC,
    endUTC: endRange.endUTC,
    startDate: effectiveStart,
    endDate: effectiveEnd,
  };
}
