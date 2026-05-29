import { createCompanyService, getCompanyByUserService, updateCompanyFactusSettingsService } from "../services/company.services.js"

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

export const patchCompanyFactus = async (req, res) => {
    try {
        const { companyId } = req.params
        const updated = await updateCompanyFactusSettingsService(req.userId, companyId, req.body)
        res.status(200).json(updated)
    } catch (error) {
        const msg = error.message || "Error al actualizar Factus"
        const code = msg.includes("Solo el administrador") ? 403 : 400
        res.status(code).json({ message: msg })
    }
}