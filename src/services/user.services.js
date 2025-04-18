import prisma from "../config/prisma.js"
import bcrypt from 'bcrypt';


export const createUserService = async (name, email, password, username, phone) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name, email, password: hashedPassword, username, phone
            }
        })
        return newUser
    } catch (error) {
        throw error
    }
}