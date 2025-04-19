import { createUserService, loginUserService } from "../services/user.services.js"

export const createUser = async(req, res) => {
    try {
        const { name, email, password, username, phone } = req.body
        const newUser = await createUserService(name, email, password, username, phone) 
        res.status(201).send({user: newUser})
        
    } catch (error) {
        res.status(400).send(error.message)
        
    }
}

export const loginUser = async(req, res) => {
    try {
        const { username, password } = req.body
        const user = await loginUserService(username, password)
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error.message)
        
    }
}