import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    items: [{
        item: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    status: {
        type: String,
        required: true,
        enum: ["Placed,Cancelled,Accepted,Completed"]
    },
    user: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: Object,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }
})

export const Order = mongoose.model('Order', orderSchema, "order")