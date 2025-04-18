import { Router } from "express";
import { createCompany, getCompanyByUser } from "../controllers/company.controller.js";

const router = Router()

router.post("/", createCompany)
router.get("/", getCompanyByUser)

export default router