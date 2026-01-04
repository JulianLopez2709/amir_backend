import express from 'express';
import { registerUser,login, selectCompany } from "../controllers/auth.controller.js";
import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeCompany } from "../middleware/auth.js";

const router = express.Router();

router.post('/register',registerUser);

router.post("/select_company", authorizeCompany, selectCompany);
router.post('/login', login);

export default router;
