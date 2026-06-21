import {
    createCompanyService,
    getCompanyByUserService,
    getCompanyProfileService,
    updateCompanyFactusSettingsService,
    updateCompanyLogoService,
    updateCompanyProfileService,
} from "../services/company.services.js"

export const createCompany = async (req, res) => {
    try {
        const { name, slogan, logo, type, plan, primary_color, secondary_color, userId } = req.body
        const newCompany = await createCompanyService(name, slogan, logo, type, plan, primary_color, secondary_color, userId)
        res.status(201).send( newCompany)
    } catch (error) {
        res.status(400)
    }
}


export const getCompanyByUser = async (req, res) => {
    try {
        const { userId } = req.params
        const company = await getCompanyByUserService(userId)
        res.status(200).send(company)
    } catch (error) {
        res.status(400).send({ message: "Error al encontrar la compañia" })
    }
}

export const getCompanyProfile = async (req, res) => {
    try {
        const { companyId } = req.params
        const company = await getCompanyProfileService(req.userId, companyId)
        res.status(200).json(company)
    } catch (error) {
        const msg = error.message || "Error al obtener la compañía"
        const code = msg.includes("Sin acceso") ? 403 : msg.includes("no encontrada") ? 404 : 400
        res.status(code).json({ message: msg })
    }
}

export const patchCompanyProfile = async (req, res) => {
    try {
        const { companyId } = req.params
        const updated = await updateCompanyProfileService(req.userId, companyId, req.body)
        res.status(200).json(updated)
    } catch (error) {
        const msg = error.message || "Error al actualizar la compañía"
        const code = msg.includes("administrador") || msg.includes("Sin acceso") ? 403 : 400
        res.status(code).json({ message: msg })
    }
}

export const patchCompanyLogo = async (req, res) => {
    try {
        const { companyId } = req.params
        const logoUrl = req.file?.path ?? req.body?.logo
        const updated = await updateCompanyLogoService(req.userId, companyId, logoUrl)
        res.status(200).json(updated)
    } catch (error) {
        const msg = error.message || "Error al actualizar el logo"
        const code = msg.includes("administrador") || msg.includes("Sin acceso") ? 403 : 400
        res.status(code).json({ message: msg })
    }
}

export const patchCompanyFactus = async (req, res) => {
    try {
        const { companyId } = req.params
        const updated = await updateCompanyFactusSettingsService(req.userId, companyId, req.body)
        res.status(200).json(updated)
    } catch (error) {
        const msg = error.message || "Error al actualizar Factus"
        const code = msg.includes("administrador") || msg.includes("Solo el") ? 403 : 400
        res.status(code).json({ message: msg })
    }
}