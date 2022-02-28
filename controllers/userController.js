import { User } from "../models/user.js"
import { Account } from "../models/account.js"
import { Item } from "../models/item.js"
import shortid from "shortid"
import Razorpay from "razorpay"
import dotenv from "dotenv"

dotenv.config()

// get all the items in the user cart
export const getCart = (req, res) => {
    Account.findById(req.user).then(account => {
        return User.findOne({ account: account._id })
    })
        .then(user => {
            return user.populate("cart.items.itemId")
        })
        .then(user => {
            const cartItems = user.cart.items;
            let totalPrice = 0;
            cartItems.forEach(item => {
                totalPrice = +totalPrice + +item.itemId.price;
            })
            return res.json({ cart: cartItems, totalPrice: totalPrice })
        })
        .catch(err => {
            res.json({ message: err })
        })
}

// post item to the cart
export const postCart = (req, res) => {
    const itemId = req.body.itemId;
    console.log(itemId, "server")
    let targetItem;
    if (!itemId) {
        res.status(404).send({ message: "ItemId not provided" })
    }
    Item.findById(itemId).then(item => {
        targetItem = item;
        return Account.findById(req.user)
    })
        .then(account => {
            return User.findOne({ account: account._id })
        })
        .then(user => {
            return user.addToCart(targetItem)
        })
        .then((result) => res.status(200).json({ message: "Item added to cart" }))
        .catch(err => res.status(500).json({ message: err }))
}

// remove item from the cart
export const postCartDelete = (req, res) => {
    console.log(req.body)
    const itemId = req.body.itemId;
    console.log(itemId, "server delte")
    if (!itemId) {
        return res.status(404).send({ message: "ItemId not provided" })
    }
    Account.findById(req.user)
        .then((account) => {
            return User.findOne({ account: account._id });
        })
        .then((user) => {
            return user.removeFromCart(itemId);
        })
        .then((result) => {
            res.status(200).json({ message: "Item successfully removed from cart." });
        })
        .catch(err => res.status(500).json({ message: err }));

}

// post order with selected item
export const postOrder = (req, res) => {
    let accountObj;
    let userObj;
    Account.findById(req.user)
        .then(account => {
            accountObj = account;
            return User.findOne({ account: account._id })
        })
        .then(user => {
            userObj = user;
            return user.populate("cart.items.itemId")
        })
        .then(result => {
            const order = new Order({
                user: {
                    email: accountObj.email,
                    name: result.firstName,
                    address: result.address,
                    userId: result
                },
                items: items,
                status: "placed"
            })
            order.save()
            return result;
        })
        .then(result => {
            return userObj.clearCart();
        })
        .then(result => {
            res.status(200).json({ result })
        })
        .catch(err => {
            res.send({ message: err })
        })
}

export const getOrder = (req, res) => {

    Account.findById(req.user.id)
        .then(account => {
            return User.findOne({ account: account._id })
        })
        .then(result => {
            if (result instanceof User)
                return Order.find({ "user.userId": result._id }).sort({ createdAt: -1 })
        })
        .then(order => {
            res.status(200).json({ order })
        })
        .catch(err => {
            res.send({ message: err })
        })
}

export const getLoggedInUser = (req, res) => {
    const accountId = req.user
    let accountObj;
    Account.findById(accountId).then(account => {
        if (!account) return res.send({ message: "Internal server error" })
        accountObj = account;
        return User.findOne({ account: account._id }).populate({
            path: "account",
            select: ["email"]
        })
    }).then(result => {
        res.json({ result })
    }).catch(err => {
        res.status(500).send({ message: err.message })
    })
}

// config razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const postRazorPay = async (req, res) => {

    const payment_capture = 1
    const amount = req.body.price
    const currency = 'INR'

    const options = {
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options)
        console.log(response)
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
    }
}