import {
  buildBillPayloadFromOrder,
  destroyUnvalidatedBillForCompany,
  downloadBillPdfForCompany,
  getOrderForInvoice,
  listNumberingRangesForCompany,
  loadCompanyForFactus,
  sendBillEmailForCompany,
  updateFactusCompanyForCompany,
  updateFactusCompanyLogoForCompany,
  validateBillForCompany,
} from "../services/factus.services.js";

function isFactusAccessError(message) {
  return message.includes("Sin acceso") || message.includes("no tiene facturación");
}

function respondFactusProxy(res, { ok, status, data }, successStatus = 200) {
  if (!ok) {
    return res.status(status >= 400 ? status : 502).json(data);
  }
  return res.status(status === 201 ? 201 : successStatus).json(data);
}

function resolvePdfFileName(fileName, billNumber) {
  const base = (fileName && String(fileName).trim()) || `factura-${billNumber}`;
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

/**
 * POST /factus/bills/validate
 * Body: { companyId, ...payloadFactus } — companyId obligatorio (credenciales por negocio).
 */
export const postValidateBill = async (req, res) => {
  try {
    const { companyId, ...payload } = req.body;
    if (companyId == null) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }
    if (!payload || typeof payload !== "object" || Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Body de factura inválido" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const { ok, status, data } = await validateBillForCompany(Number(companyId), company, payload);

    if (!ok) {
      return res.status(status >= 400 ? status : 502).json(data);
    }

    return res.status(status === 201 ? 201 : 200).json(data);
  } catch (error) {
    console.error("postValidateBill:", error.message);
    const code = isFactusAccessError(error.message) ? 403 : 500;
    return res.status(code).json({ message: error.message || "Error al validar factura" });
  }
};

/**
 * PUT /factus/companies
 * Body: { companyId, legal_organization_code, municipality_code, ...campos Factus }
 */
export const putFactusCompany = async (req, res) => {
  try {
    const { companyId, ...payload } = req.body;
    if (companyId == null) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Envía los campos a actualizar según la API de Factus" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const result = await updateFactusCompanyForCompany(Number(companyId), company, payload);
    return respondFactusProxy(res, result);
  } catch (error) {
    console.error("putFactusCompany:", error.message);
    return res.status(isFactusAccessError(error.message) ? 403 : 500).json({
      message: error.message || "Error al actualizar empresa en Factus",
    });
  }
};

/**
 * POST /factus/companies/logo
 * multipart: campo `image` (png/jpg/jpeg) + companyId (body o query)
 */
export const postFactusCompanyLogo = async (req, res) => {
  try {
    const companyId = req.body?.companyId ?? req.query?.companyId;
    if (companyId == null) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Archivo image requerido (png, jpg o jpeg)" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const result = await updateFactusCompanyLogoForCompany(Number(companyId), company, req.file);
    return respondFactusProxy(res, result);
  } catch (error) {
    console.error("postFactusCompanyLogo:", error.message);
    const isMulter = error.message?.includes("Solo se permiten");
    return res.status(isMulter ? 400 : isFactusAccessError(error.message) ? 403 : 500).json({
      message: error.message || "Error al actualizar logo en Factus",
    });
  }
};

/**
 * POST /factus/bills/:number/send-email
 * Body: { companyId, email, pdf_base_64_encoded? }
 */
export const postBillSendEmail = async (req, res) => {
  try {
    const { number } = req.params;
    const { companyId, email, pdf_base_64_encoded } = req.body;

    if (companyId == null) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }
    if (!number?.trim()) {
      return res.status(400).json({ message: "Número de factura inválido" });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: "email es obligatorio" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const payload = { email: String(email).trim() };
    if (pdf_base_64_encoded) {
      payload.pdf_base_64_encoded = pdf_base_64_encoded;
    }

    const result = await sendBillEmailForCompany(
      Number(companyId),
      company,
      String(number).trim(),
      payload
    );
    return respondFactusProxy(res, result);
  } catch (error) {
    console.error("postBillSendEmail:", error.message);
    return res.status(isFactusAccessError(error.message) ? 403 : 500).json({
      message: error.message || "Error al enviar correo",
    });
  }
};

/**
 * DELETE /factus/bills/reference/:reference_code?companyId=
 * Elimina factura no validada por DIAN (por reference_code de creación).
 */
export const deleteBillByReference = async (req, res) => {
  try {
    const { reference_code } = req.params;
    const companyId = req.query.companyId ?? req.body?.companyId;

    if (companyId == null) {
      return res.status(400).json({ message: "companyId es obligatorio (query o body)" });
    }
    if (!reference_code?.trim()) {
      return res.status(400).json({ message: "reference_code inválido" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const result = await destroyUnvalidatedBillForCompany(
      Number(companyId),
      company,
      String(reference_code).trim()
    );
    return respondFactusProxy(res, result);
  } catch (error) {
    console.error("deleteBillByReference:", error.message);
    return res.status(isFactusAccessError(error.message) ? 403 : 500).json({
      message: error.message || "Error al eliminar factura",
    });
  }
};

/**
 * GET /factus/numbering-ranges?companyId=&document=01
 */
export const getNumberingRanges = async (req, res) => {
  try {
    const companyId = req.query.companyId;
    if (companyId == null) {
      return res.status(400).json({ message: "Query companyId es obligatorio" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const { companyId: _c, document, ...factusQuery } = req.query;
    const query = { ...factusQuery };
    if (document) query.document = document;

    const { ok, status, data } = await listNumberingRangesForCompany(Number(companyId), company, query);

    if (!ok) {
      return res.status(status >= 400 ? status : 502).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("getNumberingRanges:", error.message);
    return res.status(isFactusAccessError(error.message) ? 403 : 500).json({
      message: error.message || "Error al listar rangos",
    });
  }
};

/**
 * GET /factus/bills/:number/download-pdf?companyId=
 * Por defecto devuelve el PDF (application/pdf). ?format=json devuelve la respuesta cruda de Factus.
 * ?disposition=inline abre en el navegador en lugar de forzar descarga.
 */
export const getBillDownloadPdf = async (req, res) => {
  try {
    const { number } = req.params;
    const { companyId, format, disposition } = req.query;

    if (companyId == null) {
      return res.status(400).json({ message: "Query companyId es obligatorio" });
    }
    if (!number || !String(number).trim()) {
      return res.status(400).json({ message: "Número de factura inválido" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);
    const billNumber = String(number).trim();
    const { ok, status, data } = await downloadBillPdfForCompany(
      Number(companyId),
      company,
      billNumber
    );

    if (!ok) {
      return res.status(status >= 400 ? status : 502).json(data);
    }

    if (format === "json") {
      return res.status(200).json(data);
    }

    const pdfBase64 = data?.data?.pdf_base_64_encoded;
    if (!pdfBase64) {
      return res.status(502).json({
        message: "Factus no devolvió el PDF",
        factus: data,
      });
    }

    const fileName = resolvePdfFileName(data?.data?.file_name, billNumber);
    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const disp = disposition === "inline" ? "inline" : "attachment";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `${disp}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("getBillDownloadPdf:", error.message);
    return res.status(isFactusAccessError(error.message) ? 403 : 500).json({
      message: error.message || "Error al descargar PDF",
    });
  }
};

/**
 * POST /factus/orders/:orderId/invoice
 * body: { companyId, customer, payment_details, observation?, numbering_range_id?, reference_code?, ... }
 */
export const postInvoiceFromOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { companyId, customer, payment_details, ...extra } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId es obligatorio" });
    }
    if (!customer || typeof customer !== "object") {
      return res.status(400).json({ message: "customer es obligatorio (objeto Factus)" });
    }
    if (!Array.isArray(payment_details) || payment_details.length === 0) {
      return res.status(400).json({ message: "payment_details debe ser un array no vacío" });
    }

    const company = await loadCompanyForFactus(req.userId, companyId);

    const order = await getOrderForInvoice(orderId, req.userId, companyId);

    if (!order.products?.length) {
      return res.status(400).json({ message: "La orden no tiene líneas para facturar" });
    }

    const payload = buildBillPayloadFromOrder(order, {
      customer,
      payment_details,
      extra,
      company,
    });

    const { ok, status, data } = await validateBillForCompany(Number(companyId), company, payload);

    if (!ok) {
      return res.status(status >= 400 ? status : 502).json({
        message: "Factus rechazó la petición",
        factus: data,
        payloadSent: payload,
      });
    }

    return res.status(status === 201 ? 201 : 200).json({
      factus: data,
      reference_code: payload.reference_code,
    });
  } catch (error) {
    console.error("postInvoiceFromOrder:", error.message);
    const code = isFactusAccessError(error.message) ? 403 : 500;
    const notFound = error.message.includes("no encontrada");
    return res.status(notFound ? 404 : code).json({
      message: error.message || "Error al emitir factura",
    });
  }
};
