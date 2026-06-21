import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  authorizeCompanyAccess,
  requireCompanyAdmin,
} from "../middleware/companyAuth.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createCompany,
  getCompanyByUser,
  getCompanyProfile,
  patchCompanyFactus,
  patchCompanyLogo,
  patchCompanyProfile,
} from "../controllers/company.controller.js";

const router = Router()

router.post("/", createCompany)
router.get("/user/:userId", getCompanyByUser)
router.get("/:companyId/profile", authenticateToken, authorizeCompanyAccess, getCompanyProfile)
router.patch("/:companyId/profile", authenticateToken, authorizeCompanyAccess, requireCompanyAdmin, patchCompanyProfile)
router.post("/:companyId/logo", authenticateToken, authorizeCompanyAccess, requireCompanyAdmin, upload.single("logo"), patchCompanyLogo)
router.patch("/:companyId/factus", authenticateToken, authorizeCompanyAccess, requireCompanyAdmin, patchCompanyFactus)

export default router
