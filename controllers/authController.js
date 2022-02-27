import { validationResult } from "express-validator"
import bcrypt from "bcrypt"
import sgMail from "@sendgrid/mail"
import jwt from "jsonwebtoken"

import { User } from "../models/user.js"
import { Account } from "../models/account.js"


const CLIENT_URL = "http://localhost:3000"


export const signupUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, Incorrect data entered.");
        error.errors = errors.array()
        throw error
    }
    const { email, firstName, lastName, password } = req.body;

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const token = jwt.sign({ id: email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

    const account = new Account({
        email: email,
        password: hashedPassword,
        accountVerifyToken: token
    })
    const response = await account.save()

    const user = new User({
        firstName: firstName,
        lastName: lastName,
        account: response
    })
    const result = await user.save()

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: email, // Change to your recipient
        from: process.env.ACC_EMAIL, // Change to your verified sender
        subject: "Verify your Account on Paint Servicing",
        html: `
                <p>Please verify your email by clicking on the link below - House painting service</p>
                <p>Click this <a href="${CLIENT_URL}/auth/verify/${token}">link</a> to verify your account.</p>
                `
    }
    sgMail.send(msg).then(
        res.status(201).json({
            message: "User Signed-up successfully, please verify your email before logging in",
            userId: result._id
        }))
        .catch(err => {
            res.json({ message: err })
        })

}

export const verifyAccount = (req, res) => {
    const { token } = req.params;
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {

        if (err) {
            return res.send({ message: "Token expired!" })
        }
        Account.findOne({ accountVerifyToken: token })
            .then(account => {
                if (!account) {
                    const error = new Error("User with this token doesn't exists")
                    error.statusCode = 403;
                    throw error
                }
                account.isVerified = true;
                account.accountVerifyToken = undefined;
                account.accountVerifyTokenExpiration = undefined;
                return account.save()
            })
            .then(account => {
                res.json({ message: "Account verified successfully" })
            })
            .catch(err => {
                res.json({ message: err.message })
            })

    })


}


export const loginUser = (req, res) => {
    const { email, password } = req.body;
    let loadedUser;
    Account.findOne({ email: email })
        .then(account => {
            if (!account) {
                const error = new Error("Invalid Credentials.")
                error.statusCode = 401
                throw error;
            }
            loadedUser = account;
            return bcrypt.compare(password, account.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error("Invalid Credentials");
                error.statusCode = 401;
                throw error
            }
            if (loadedUser.isVerified === false) {
                const error = new Error("Verify your email before accessing the platform!")
                error.statusCode = 401;
                throw error
            }
            const token = jwt.sign({ accountId: loadedUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "10h" })
            res.status(200).json({ message: "Logged-in successfully", token: token })

        })
}