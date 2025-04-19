import prisma from "../config/prisma.js"

export const createCompanyService = async(name, slogan, logo, type, plan, primary_color, secondary_color, userId) => {
    try {
        const newCompany = await prisma.company.create({
            data: {
                name, slogan, logo, type, plan, primary_color, secondary_color,
                users: {
                    create: { userId, role: "admin" }
                }
            },
            /*include: {
                users: {
                    include: { user: true },
                },
            },*/
        })
        return newCompany
    } catch (error) {
        throw error
    }
}

export const getCompanyByUserService = async(userId) => {
    try {
        const company = await prisma.company.findMany({
            where: {
                users: {
                    some: {
                        userId: parseInt(userId),
                    },
                },
            },
        })
        return company
    } catch (error) {
        throw error
    }
}