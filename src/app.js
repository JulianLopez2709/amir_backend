
import express from 'express'
import cors from 'cors'
import routerUser from './routers/user.routers.js'
import routerCompany from './routers/company.routers.js'
import routerProduct from './routers/product.routers.js'

const app = express()
app.use(express.json())
app.use(cors())

app.use("/order", (req, res)=>{res.send("Ordenes datail")})
app.use("/product", routerProduct)
app.use("/company", routerCompany)
app.use("/user", routerUser)

export default app