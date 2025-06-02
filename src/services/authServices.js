import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const loginService = async (identifier, password) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: identifier,
            },
            include: {
                companies: {
                    select: {
                        role: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                                slogan: true,
                                logo: true,
                                type: true,
                                primary_color: true,
                                secondary_color: true,
                            },
                        },
                    },
                },
            },
        })

        if (!user) throw new Error('User not found');
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) throw new Error('Invalid password');

        const companies = user.companies.map(userCompany => ({
            id: userCompany.company.id,
            role : userCompany.role,
            name: userCompany.company.name,
            slogan: userCompany.company.slogan,
            logo: userCompany.company.logo,
            type: userCompany.company.type,
            primary_color: userCompany.company.primary_color,
            secondary_color: userCompany.company.secondary_color,
        }))

        const token = jwt.sign({ userId: user.id, email: user.email, name: user.name, }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        return { token, user: { id: user.id, email: user.email, name: user.name }, companies: companies }
    } catch (error) {
        throw error
    }
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
