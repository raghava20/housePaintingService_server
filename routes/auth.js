import express from "express"
import { body } from "express-validator"
import { Account } from "../models/account.js"
import { loginUser, signupUser, verifyAccount } from "../controllers/authController.js"

const router = express.Router()

router.post("/signup", [
    body("email", "Please enter a valid email to continue")
        .isEmail()
        .custom((value, { req }) => {
            return Account.findOne({ email: value }).then(account => {
                if (account) return Promise.reject("Email already exists!")
            })
        })
        .normalizeEmail(),
    body("password", "Password should be at 6 characters long")
        .trim().isLength({ min: 6 }),
    body("firstName", "First Name cannot be empty").trim().not().isEmpty(),
    body("lastName", "Last Name cannot be empty").trim().not().isEmpty(),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords have to match!");
            }
            return true;
        }),
], signupUser)

router.get("/verify/:token", verifyAccount)

router.post("/login", loginUser)

export const authRouter = router;