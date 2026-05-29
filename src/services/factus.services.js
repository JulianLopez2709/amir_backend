import prisma from "../config/db.js";
import { decryptSecret } from "../utils/secretFields.js";

const DEFAULT_BASE_URL = "https://api-sandbox.factus.com.co";

function getBaseUrl() {
  return (process.env.FACTUS_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

/** @type {Map<number, { token: string; expiresAt: number }>} */
const tokenCacheByCompany = new Map();

export function isCompanyFactusConfigured(company) {
  if (!company) return false;
  return Boolean(
    company.factusClientId &&
      company.factusClientSecret &&
      company.factusUsername &&
      company.factusPassword
  );
}

export function decryptFactusCredentials(company) {
  if (!isCompanyFactusConfigured(company)) {
    throw new Error("Esta empresa no tiene facturación electrónica Factus configurada");
  }
  return {
    clientId: decryptSecret(company.factusClientId),
    clientSecret: decryptSecret(company.factusClientSecret),
    username: decryptSecret(company.factusUsername),
    password: decryptSecret(company.factusPassword),
  };
}

/**
 * @param {number} userId
 * @param {number} companyId
 */
export async function loadCompanyForFactus(userId, companyId) {
  const companyIdNum = Number(companyId);
  if (Number.isNaN(companyIdNum)) {
    throw new Error("companyId inválido");
  }

  const membership = await prisma.userCompany.findFirst({
    where: { userId, companyId: companyIdNum, available: true },
  });
  if (!membership) {
    throw new Error("Sin acceso a esta compañía");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyIdNum },
  });
  if (!company) {
    throw new Error("Compañía no encontrada");
  }

  if (!isCompanyFactusConfigured(company)) {
    throw new Error("Esta empresa no tiene facturación electrónica Factus configurada");
  }
  return company;
}

async function getFactusAccessTokenForCompany(companyId, creds) {
  const now = Date.now();
  const cached = tokenCacheByCompany.get(companyId);
  if (cached && now < cached.expiresAt - 60_000) {
    return cached.token;
  }

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    username: creds.username,
    password: creds.password,
  });

  const res = await fetch(`${getBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error_description || res.statusText;
    throw new Error(`Factus OAuth: ${msg}`);
  }

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 600;
  tokenCacheByCompany.set(companyId, {
    token: data.access_token,
    expiresAt: now + expiresIn * 1000,
  });

  return data.access_token;
}

/**
 * @param {number} companyId
 * @param {import('@prisma/client').Company} company
 */
async function parseFactusResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

function prepareRequestBody(body, headers) {
  if (body == null) return undefined;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
    return body;
  }

  if (Buffer.isBuffer(body) || body instanceof URLSearchParams) {
    return body;
  }

  if (typeof body === "object") {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    return JSON.stringify(body);
  }

  return body;
}

export async function factusRequestForCompany(companyId, company, path, options = {}) {
  const creds = decryptFactusCredentials(company);
  const token = await getFactusAccessTokenForCompany(companyId, creds);
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const body = prepareRequestBody(options.body, headers);

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
  });

  return parseFactusResponse(res);
}

/**
 * POST /v2/companies/logo — multipart campo `image`
 * @param {{ buffer: Buffer; mimetype: string; originalname: string }} file
 */
export async function updateFactusCompanyLogoForCompany(companyId, company, file) {
  if (!file?.buffer?.length) {
    throw new Error("Archivo de logo inválido");
  }

  const creds = decryptFactusCredentials(company);
  const token = await getFactusAccessTokenForCompany(companyId, creds);
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append("image", blob, file.originalname || "logo.jpg");

  const res = await fetch(`${getBaseUrl()}/v2/companies/logo`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseFactusResponse(res);
}

/** PUT /v2/companies */
export async function updateFactusCompanyForCompany(companyId, company, payload) {
  return factusRequestForCompany(companyId, company, "/v2/companies", {
    method: "PUT",
    body: payload,
  });
}

/** POST /v2/bills/:number/send-email */
export async function sendBillEmailForCompany(companyId, company, billNumber, payload) {
  const number = String(billNumber).trim();
  if (!number) throw new Error("Número de factura inválido");
  const path = `/v2/bills/${encodeURIComponent(number)}/send-email`;
  return factusRequestForCompany(companyId, company, path, {
    method: "POST",
    body: payload,
  });
}

/** DELETE /v2/bills/destroy/reference/:reference_code */
export async function destroyUnvalidatedBillForCompany(companyId, company, referenceCode) {
  const ref = String(referenceCode).trim();
  if (!ref) throw new Error("reference_code inválido");
  const path = `/v2/bills/destroy/reference/${encodeURIComponent(ref)}`;
  return factusRequestForCompany(companyId, company, path, { method: "DELETE" });
}

export async function listNumberingRangesForCompany(companyId, company, query = {}) {
  const qs = new URLSearchParams(query).toString();
  const path = `/v2/numbering-ranges${qs ? `?${qs}` : ""}`;
  return factusRequestForCompany(companyId, company, path, { method: "GET" });
}

export async function validateBillForCompany(companyId, company, payload) {
  return factusRequestForCompany(companyId, company, "/v2/bills/validate", {
    method: "POST",
    body: payload,
  });
}

/**
 * Descarga PDF de factura (Factus v2). Respuesta JSON con pdf_base_64_encoded y file_name.
 * @param {string} billNumber – Número de factura (data.number al crear/validar, ej. SETP990001103)
 */
export async function downloadBillPdfForCompany(companyId, company, billNumber) {
  const number = String(billNumber).trim();
  if (!number) {
    throw new Error("Número de factura inválido");
  }
  const path = `/v2/bills/${encodeURIComponent(number)}/download-pdf`;
  return factusRequestForCompany(companyId, company, path, { method: "GET" });
}

function formatMoney(n) {
  return Number(n).toFixed(2);
}

function priceBeforeTax(unitWithTax, ivaPercent) {
  const rate = ivaPercent / 100;
  return unitWithTax / (1 + rate);
}

/**
 * @param {import('@prisma/client').Order & { products: import('@prisma/client').ProductOrder[] }} order
 * @param {object} params
 * @param {import('@prisma/client').Company | null} [params.company]
 */
export function buildBillPayloadFromOrder(order, { customer, payment_details, extra = {}, company = null }) {
  const ivaPercent = Number(process.env.FACTUS_IVA_PERCENT || "19");
  const pricesIncludeTax =
    String(process.env.FACTUS_PRICES_INCLUDE_TAX || "true").toLowerCase() === "true";

  const reference_code =
    extra.reference_code || `AMIN-${order.id}-${Date.now()}`;

  const items = order.products.map((po, idx) => {
    const snap = po.product_snapshot || {};
    const name = snap.name || `Item ${idx + 1}`;
    const codeRef = String(snap.id || snap.code_reference || po.productId || `LINE-${po.id}`);

    const lineTotal = po.subtotal != null ? po.subtotal : Number(snap.price || 0) * po.quantity;
    const qty = po.quantity || 1;
    const unitTotalWithTax = lineTotal / qty;

    const unitPrice =
      pricesIncludeTax && ivaPercent > 0
        ? priceBeforeTax(unitTotalWithTax, ivaPercent)
        : unitTotalWithTax;

    return {
      code_reference: codeRef,
      name: String(name).slice(0, 300),
      quantity: formatMoney(qty),
      discount_rate: "0.00",
      price: formatMoney(unitPrice),
      unit_measure_code: process.env.FACTUS_UNIT_MEASURE_CODE || "94",
      standard_code: process.env.FACTUS_STANDARD_CODE || "999",
      taxes: [{ code: "01", rate: formatMoney(ivaPercent) }],
    };
  });

  const payload = {
    reference_code,
    document: extra.document || "01",
    operation_type: extra.operation_type || "10",
    send_email: extra.send_email !== false,
    observation: extra.observation,
    customer,
    payment_details,
    items,
  };

  const rangeFromRequest = extra.numbering_range_id;
  const rangeFromCompany = company?.factusNumberingRangeId ?? null;
  const rangeFromEnv = process.env.FACTUS_NUMBERING_RANGE_ID
    ? parseInt(process.env.FACTUS_NUMBERING_RANGE_ID, 10)
    : null;

  const numberingId = rangeFromRequest ?? rangeFromCompany ?? rangeFromEnv;
  if (numberingId != null && !Number.isNaN(Number(numberingId))) {
    payload.numbering_range_id = Number(numberingId);
  }

  return payload;
}

export async function getOrderForInvoice(orderId, userId, companyId) {
  const companyIdNum = Number(companyId);
  if (Number.isNaN(companyIdNum)) {
    throw new Error("companyId inválido");
  }

  const membership = await prisma.userCompany.findFirst({
    where: { userId, companyId: companyIdNum, available: true },
  });
  if (!membership) {
    throw new Error("Sin acceso a esta compañía");
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, companyId: companyIdNum },
    include: { products: true },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  return order;
}
