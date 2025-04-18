import { Router } from "express";
import { createCompany } from "../controllers/company.controller.js";

const router = Router()

router.post("/", createCompany)

export default router