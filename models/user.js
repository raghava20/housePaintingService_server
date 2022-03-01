import mongoose from "mongoose";

const Schema = mongoose.Schema

const deliveryInfo = {
    street: String,
    locality: String,
    aptName: String,
    zip: String,
    phoneNo: Number
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
                }
            },
        ],
    },
})

userSchema.methods.addToCart = function (item) {

    const updatedCartItems = [...this.cart.items];

    updatedCartItems.push({
        itemId: item._id,
    })
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