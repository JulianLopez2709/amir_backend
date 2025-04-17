
import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

app.use("/order", (req, res)=>{res.send("Ordenes datail")})
app.use("/product", ()=>{console.log("prouct")})
app.use("/company", ()=>{console.log("company")})

export default app