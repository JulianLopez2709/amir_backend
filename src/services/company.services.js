import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const createCompanyService = (name, slogan, logo, type, plan, primary_color, secondary_color, avalable) => {
    try {
        const newCompany = prisma.company.create({ 
            data: { name, slogan, logo, type, plan, primary_color, secondary_color, avalable } })
        return newCompany
    } catch (error) {
        throw error
    }
}