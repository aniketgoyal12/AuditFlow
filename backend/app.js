require("dotenv").config()
const express = require("express")
const connectDB = require("./config/db")
const auditMiddleware = require("./middlewares/auditMiddleware")
const userRoutes = require("./routes/userRoutes")

const app = express()

connectDB()

app.use(express.json())
app.use(auditMiddleware)
app.use("/users", userRoutes)

app.listen(5000)
