import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

export const createUserService = async (name, email, password, username, telefon) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name, email, password: hashedPassword, username, telefon
            }
        })
        return newUser
    } catch (error) {
        throw error
    }
}