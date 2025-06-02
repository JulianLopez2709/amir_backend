import { CreateUser, loginService } from '../services/authServices.js';

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
        const user = await loginService(identifier, password)

        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const { token, ...safeUserData } = user;
        res.cookie("token", token, {
            httpOnly: true,
        })

        res.status(201).json(safeUserData);
    } catch (error) {
        res.status(401).send({ message: error.message });
    }
}