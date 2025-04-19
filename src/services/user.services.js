import prisma from "../config/prisma.js"
import bcrypt from 'bcrypt';


export const createUserService = async (name, email, password, username, phone) => {
    try {

        Validator.username(username)
        Validator.password(password)

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.findUnique({
            where: {
                username
            }
        })
        if (user) {
            throw new Error('User created')
        }

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

export const loginUserService = async (username, password) => {
    try {

        Validator.username(username)
        Validator.password(password)

        const user = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if (!user) {
            throw new Error('User not found')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            throw new Error('Invalid password')
        }

        return user
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