import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { mongo } from "./connection.js"
import { authRouter } from "./routes/auth.js"
import { userRouter } from "./routes/user.js"

dotenv.config()
const app = express()
let PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cors())

mongo()

app.get('/', (req, res) => {
    res.send("You are listening on paint servicing api")
})

app.use("/", authRouter)
app.use("/", userRouter)

app.listen(PORT, () => console.log('listening on port ', PORT))