import mongoose from "mongoose";

const Schema = mongoose.Schema

const deliveryInfo = {
    street: String,
    locality: String,
    aptName: String,
    zip: String,
    phoneNo: Number,
    lat: Number,
    lng: Number,
};

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    address: deliveryInfo,
    account: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    cart: {
        items: [
            {
                _id: false,
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
})

userSchema.methods.addToCart = function (item) {
    const cartItemIndex = this.cart.items.findIndex((cp) => {
        return cp.itemId.toString() === item._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartItemIndex >= 0) {
        newQuantity = this.cart.items[cartItemIndex].quantity + 1;
        updatedCartItems[cartItemIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            itemId: item._id,
            quantity: newQuantity,
        });
    }
    const updatedCart = {
        items: updatedCartItems,
    };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (itemId) {
    const updatedCartItems = this.cart.items.filter((item) => {
        return item.itemId.toString() !== itemId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

export const User = mongoose.model("User", userSchema, "user")