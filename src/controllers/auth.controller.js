import { CreateUser, loginService, selectCompanyService } from '../services/authServices.js';
import { generateToken } from '../middleware/auth.js';

export const registerUser = async (req, res) => {
    try {
        const { email, password, username, name, phone } = req.body;

        const user = await CreateUser(email, password, username, name, phone);

        if (!user) return res.status(500).json({ error: 'Error al crear el usuario' });

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}

export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const { user, notifications, companies } = await loginService(identifier, password)
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const availableCompanies = companies.filter(c => c.available);

        if (!availableCompanies.length) {
            return res.status(403).json({ message: "No tienes compañías activas" });
        }

        const token = generateToken(user, availableCompanies[0].id, availableCompanies[0].role);


        //const { token, ...safeUserData } = user;

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 24 * 60 * 60 * 1000, // 7 días
        });

        res.status(201).json({
            user,
            notifications,
            companies,
            token
        });
    } catch (error) {
        res.status(401).send({ message: error.message });
    }
}


export const selectCompany = async (req, res) => {
    try {
        const userId = req.userId; // viene del token base
        const { companyId } = req.body;
        if (!companyId) {
            return res.status(400).json({ message: "companyId es requerido" });
        }

        const result = await selectCompanyService(userId, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error en selectCompany:", error);
        return res.status(403).json({ message: error.message || "No autorizado" });
    }
}