import { createCompanyService } from "../services/company.services.js"

export const createCompany = async (req, res) => {
    try {
        const { name, slogan, logo, type, plan, primary_color, secondary_color, avalable } = req.body
        const newCompany = await createCompanyService(name, slogan, logo, type, plan, primary_color, secondary_color, avalable)
        res.status(201).send({message : "Se a creado correctamente", company : newCompany})
    } catch (error) {
        res.status(400)
    }
}