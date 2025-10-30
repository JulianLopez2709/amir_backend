import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import {generateToken} from '../middleware/auth.js';

export const loginService = async (identifier, password) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }]
            },
            include: {
                companies: {
                    include: { company: true }
                },
                notification: {
                    where: { isRead: false },
                    orderBy: { createdAt: "desc" }
                }
            }
        });


        if (!user) throw new Error('User not found');
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) throw new Error('Invalid password');

        const companies = user.companies.map(userCompany => ({
            id: userCompany.company.id,
            role: userCompany.role,
            name: userCompany.company.name,
            slogan: userCompany.company.slogan,
            logo: userCompany.company.logo,
            type: userCompany.company.type,
            primary_color: userCompany.company.primary_color,
            secondary_color: userCompany.company.secondary_color,
        }))


        const token = generateToken({ id: user.id });

        console.log(token)

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: user.plan
            },
            notifications: user.notification,
            companies: user.companies.map(c => ({
                id: c.company.id,
                name: c.company.name,
                role: c.role
            })),
            token : token
        };
    } catch (error) {
        throw error
    }
}

export const selectCompanyService = async (userId, companyId) => {
    const relation = await prisma.userCompany.findFirst({
        where: { userId, companyId, available: true },
        include: { company: true }
    });

    if (!relation) {
        throw new Error("No tienes permiso para acceder a esta compañía");
    }

    // Genera nuevo token con companyId + role
    const token = generateToken({
        id: userId,
        companyId: relation.companyId,
        role: relation.role
    });

    return {
        message: "Compañía seleccionada correctamente",
        company: {
            id: relation.company.id,
            name: relation.company.name,
            role: relation.role
        },
        token
    };
}

export const CreateUser = async (email, password, username, name, phone) => {
    try {
        Validator.username(username)
        Validator.password(password)

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) throw new Error('Email ya en uso');

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword, username, name, phone },
        });

        if (!newUser) {
            throw new Error('Error al crear el usuario');
        }

        return newUser;
    } catch (error) {
        throw error
    }
}



class Validator {
    static username(username) {
        if (typeof username !== 'string') throw new Error('Username must be a string')
        if (username.length < 3) throw new Error('Username must be at least 3 characters long')
    }

    static password(password) {
        if (typeof password !== 'string') throw new Error('Password must be a string')
        if (password.length < 6) throw new Error('Password must be at least 6 characters long')
    }
}
