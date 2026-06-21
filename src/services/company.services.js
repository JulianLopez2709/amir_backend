import prisma from "../config/prisma.js"
import { toPublicCompany } from "../utils/companyPublic.js"
import { encryptSecret } from "../utils/secretFields.js"

async function assertCompanyAdmin(userId, companyId) {
    const id = Number(companyId)
    if (Number.isNaN(id)) {
        throw new Error("companyId inválido")
    }

    const uc = await prisma.userCompany.findFirst({
        where: { userId, companyId: id, available: true },
    })
    if (!uc || uc.role !== "admin") {
        throw new Error("Solo el administrador de la empresa puede realizar esta acción")
    }

    return id
}

async function assertCompanyMember(userId, companyId) {
    const id = Number(companyId)
    if (Number.isNaN(id)) {
        throw new Error("companyId inválido")
    }

    const uc = await prisma.userCompany.findFirst({
        where: { userId, companyId: id, available: true },
    })
    if (!uc) {
        throw new Error("Sin acceso a esta compañía")
    }

    return { id, role: uc.role }
}

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
        return company.map(toPublicCompany)
    } catch (error) {
        throw error
    }
}

/**
 * Actualiza credenciales Factus (cifradas) y metadatos de numeración. Solo rol admin de la empresa.
 */
export const getCompanyProfileService = async (userId, companyId) => {
    const { id, role } = await assertCompanyMember(userId, companyId)

    const company = await prisma.company.findUnique({ where: { id } })
    if (!company) {
        throw new Error("Compañía no encontrada")
    }

    return { ...toPublicCompany(company), role }
}

export const updateCompanyProfileService = async (userId, companyId, body) => {
    const id = await assertCompanyAdmin(userId, companyId)

    const data = {}
    const stringFields = ["name", "nit", "address", "phone", "email", "slogan", "logo", "primary_color", "secondary_color"]
    for (const field of stringFields) {
        if (body[field] !== undefined) {
            const v = body[field]
            if (field === "name") {
                const trimmed = v != null ? String(v).trim() : ""
                if (!trimmed) throw new Error("El nombre del negocio es obligatorio")
                data[field] = trimmed
            } else if (field === "primary_color" || field === "secondary_color") {
                const trimmed = v != null ? String(v).trim() : ""
                if (!trimmed) throw new Error(`El color ${field === "primary_color" ? "primario" : "secundario"} es obligatorio`)
                data[field] = trimmed
            } else {
                data[field] = v != null && String(v).trim() !== "" ? String(v).trim() : null
            }
        }
    }

    if (Object.keys(data).length === 0) {
        throw new Error("No hay campos para actualizar")
    }

    const updated = await prisma.company.update({
        where: { id },
        data,
    })

    const uc = await prisma.userCompany.findFirst({
        where: { userId, companyId: id, available: true },
    })

    return { ...toPublicCompany(updated), role: uc?.role ?? "admin" }
}

export const updateCompanyLogoService = async (userId, companyId, logoUrl) => {
    const id = await assertCompanyAdmin(userId, companyId)

    if (!logoUrl || !String(logoUrl).trim()) {
        throw new Error("Logo inválido")
    }

    const updated = await prisma.company.update({
        where: { id },
        data: { logo: String(logoUrl).trim() },
    })

    const uc = await prisma.userCompany.findFirst({
        where: { userId, companyId: id, available: true },
    })

    return { ...toPublicCompany(updated), role: uc?.role ?? "admin" }
}

export const updateCompanyFactusSettingsService = async (userId, companyId, body) => {
    const id = await assertCompanyAdmin(userId, companyId)

    const data = {}
    const secretFields = ["factusClientId", "factusClientSecret", "factusUsername", "factusPassword"]
    for (const field of secretFields) {
        if (body[field] !== undefined) {
            const v = body[field]
            data[field] = v != null && String(v).trim() !== "" ? encryptSecret(String(v)) : null
        }
    }

    if (body.factusNumberingRangeId !== undefined) {
        const v = body.factusNumberingRangeId
        if (v === null || v === "") {
            data.factusNumberingRangeId = null
        } else {
            const n = Number(v)
            if (Number.isNaN(n)) throw new Error("factusNumberingRangeId inválido")
            data.factusNumberingRangeId = n
        }
    }

    if (body.factusPrefix !== undefined) {
        const v = body.factusPrefix
        data.factusPrefix = v != null && String(v).trim() !== "" ? String(v).trim() : null
    }

    if (Object.keys(data).length === 0) {
        throw new Error("No hay campos Factus para actualizar")
    }

    data.hasBilling = true

    const updated = await prisma.company.update({
        where: { id },
        data,
    })

    const uc = await prisma.userCompany.findFirst({
        where: { userId, companyId: id, available: true },
    })

    return { ...toPublicCompany(updated), role: uc?.role ?? "admin" }
}