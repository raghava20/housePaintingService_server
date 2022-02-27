import mongoose from "mongoose";

const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
}, { timestamps: true })

export const Item = mongoose.model("Item", itemSchema, "item")