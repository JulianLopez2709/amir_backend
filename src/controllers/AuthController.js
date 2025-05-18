import prisma from '../config/db.js';
import { CreateUser } from '../services/authServices.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { email, password, username, name, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email ya en uso' });

    const user = await CreateUser(email, password, username, name, phone);

    console.log(user);

    if (!user) return res.status(500).json({ error: 'Error al crear el usuario' });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique(
        { where: { email }, include: { companies: true } },
    );
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name }, companies: user.companies });  
}