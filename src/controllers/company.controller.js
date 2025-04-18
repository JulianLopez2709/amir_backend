import { createCompanyService,getCompanyByUserService } from "../services/company.services.js"

export const createCompany = async (req, res) => {
    try {
        const { name, slogan, logo, type, plan, primary_color, secondary_color, userId } = req.body
        const newCompany = await createCompanyService(name, slogan, logo, type, plan, primary_color, secondary_color, userId)
        res.status(201).send({message : "Se a creado correctamente", company : newCompany})
    } catch (error) {
        res.status(400)
    }
}


export const getCompanyByUser = async (req, res) => {
    try {
        const { userId } = req.params
        const company = await getCompanyByUserService(userId)
        res.status(200).send({ message: "Se a encontrado correctamente", company })
    } catch (error) {
        res.status(400).send({ message: "Error al encontrar la compañia" })
    }
}