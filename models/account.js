import mongoose from "mongoose"

const Schema = mongoose.Schema;

const accountSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accountVerifyToken: String,
    accountVerifyTokenExpiration: Date,
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export const Account = mongoose.model('Account', accountSchema, "account")