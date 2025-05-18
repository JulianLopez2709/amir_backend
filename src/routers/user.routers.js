import { Router } from "express";
import { createUser, loginUser } from "../controllers/user.controller.js";

const router = Router()

router.get("/", async (req, res) => {
    res.json({ message: "user" })
    //const responde = await prisma.user.findMany()
    //res.json(responde)
})

router.post("/", createUser)
router.post("/login", loginUser)

export default router