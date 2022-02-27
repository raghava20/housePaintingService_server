import express from "express"
import { body } from "express-validator"
import { postCart, postCartDelete, getCart, postOrder, getOrder } from "../controllers/userController.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

router.get("/cart", auth, getCart)

router.post("/cart", auth, postCart)

router.post("/delete-card-item", auth, postCartDelete)

router.post("/order", auth, postOrder)

router.get("/orders", auth, getOrder)

export const userRouter = router;