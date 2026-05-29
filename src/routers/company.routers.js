import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { createCompany, getCompanyByUser, patchCompanyFactus } from "../controllers/company.controller.js";

const router = Router()

router.post("/", createCompany)
router.patch("/:companyId/factus", /*authenticateToken,*/ patchCompanyFactus)
router.get("/:userId", getCompanyByUser)

export default router