import { validationResult } from "express-validator"
import bcrypt from "bcrypt"
import sgMail from "@sendgrid/mail"
import jwt from "jsonwebtoken"

import { User } from "../models/user.js"
import { Account } from "../models/account.js"

const CLIENT_URL = "https://house-painting-service.herokuapp.com"

// signup the user 
export const signupUser = async (req, res) => {
    const errors = validationResult(req)
    try {
        if (!errors.isEmpty()) {
            return res.status(402).send({ errors: errors.array() })
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
            from: process.env.SENDGRID_ACC_EMAIL, // Change to your verified sender
            subject: "Verify your Account on House Paint Servicing",
            html: `<p>Please verify your email by clicking on the link below - House painting service</p>
                    <a href=${CLIENT_URL}/verify/${token}>link</a>
                    `
        }
        sgMail.send(msg).then(() => {

            return res.status(201).json({
                message: "User Signed-up successfully, please verify your email before logging in",
                userId: result._id
            })
        }).catch(err => {
            res.status(500).send({ message: err })
        })
    }
    catch (err) {
        res.send({ message: err })
    }
}

// verify the users email address
export const verifyAccount = (req, res) => {
    const token = req.params.token;
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (err) {
                return res.send({ message: "Token expired!" })
            }
            Account.findOne({ accountVerifyToken: token })
                .then(account => {
                    if (!account) {
                        return res.send({ message: "User with this token doesn't exists" })
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
    catch (err) {
        return res.json({ message: err.message })
    }

}

// login the user once the email has been verified
export const loginUser = (req, res) => {
    const { email, password } = req.body;
    let loadedUser;
    Account.findOne({ email: email })
        .then(account => {
            if (!account) {
                return res.status(401).send({ message: "Invalid Credentials." });
            }
            loadedUser = account;
            return bcrypt.compare(password, account.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                return res.status(401).send({ message: "Invalid Credentials." });
            }
            if (loadedUser.isVerified === false) {
                return res.status(401).send({ message: "Verify your email before accessing the platform!" });
            }
            const token = jwt.sign({ accountId: loadedUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "10h" })
            res.status(200).json({ message: "Logged-in successfully", token: token })

        }).catch(err => {
            return res.status(500).send({ message: err });

        })
}