import express from 'express';
import { registerUser,login, selectCompany } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/register',registerUser);

router.post("/select_company", authenticateToken, selectCompany);
router.post('/login', login);

export default router;
