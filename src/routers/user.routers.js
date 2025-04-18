import { Router } from "express";
import { createUser } from "../controllers/user.controller.js";

const router = Router()

router.get("/", async (req, res) => {
    //const responde = await prisma.user.findMany()
    //res.json(responde)
})

router.post("/", createUser)

export default router