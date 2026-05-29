import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import factusLogoUpload from "../middleware/factusLogoUpload.js";
import {
  deleteBillByReference,
  getBillDownloadPdf,
  getNumberingRanges,
  postBillSendEmail,
  postFactusCompanyLogo,
  postInvoiceFromOrder,
  postValidateBill,
  putFactusCompany,
} from "../controllers/factus.controller.js";

const router = Router();

//router.use(authenticateToken);

// Empresa Factus
router.put("/companies", putFactusCompany);
router.post("/companies/logo", factusLogoUpload.single("image"), postFactusCompanyLogo);

// Facturas
router.delete("/bills/reference/:reference_code", deleteBillByReference);
router.get("/bills/:number/download-pdf", getBillDownloadPdf);
router.post("/bills/:number/send-email", postBillSendEmail);
router.post("/bills/validate", postValidateBill);

router.get("/numbering-ranges", getNumberingRanges);
router.post("/orders/:orderId/invoice", postInvoiceFromOrder);

export default router;
