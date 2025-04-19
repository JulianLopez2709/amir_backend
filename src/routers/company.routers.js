import { Router } from "express";
import { createCompany, getCompanyByUser } from "../controllers/company.controller.js";

const router = Router()

router.post("/", createCompany)
router.get("/:userId", getCompanyByUser)

export default router