import express from "express"
import { postCart, postCartDelete, getCart, postOrder, getOrder, getLoggedInUser, postRazorPay, postAddress } from "../controllers/userController.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

router.get("/cart", auth, getCart)

router.post("/cart", auth, postCart)

router.delete("/delete-cart-item", auth, postCartDelete)

router.post("/order", auth, postOrder)

router.get("/orders", auth, getOrder)

router.get("/user", auth, getLoggedInUser)

router.post("/user/address", auth, postAddress)

router.post("/razorpay", postRazorPay)

export const userRouter = router;