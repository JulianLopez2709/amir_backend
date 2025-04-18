import { createUserService } from "../services/user.services.js"

export const createUser = async(req, res) => {
    try {
        const { name, email, password, username, phone } = req.body
        const newUser = await createUserService(name, email, password, username, phone) 
        res.status(201).send({ message: "user creado", user: newUser })
        
    } catch (error) {
        res.status(400).send({ message: "" })
        
    }
}