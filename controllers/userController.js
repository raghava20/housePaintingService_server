import { User } from "../models/user.js"
import { Account } from "../models/account.js"
import { Item } from "../models/item.js"

// get all the items in the user cart
export const getCart = (req, res) => {
    Account.findById(req.user.id).then(account => {
        return User.findOne({ account: account._id })
    })
        .then(user => {
            return user.populate("cart.items.itemId")
        })
        .then(user => {
            const cartItems = user.cart.items;
            let totalPrice = 0;
            cartItems.forEach(item => {
                totalPrice = totalPrice + item.quantity * item.itemId.price;
            })
            res.json({ cart: cartItems, totalPrice: totalPrice })
        })
        .catch(err => {
            res.json({ message: err })
        })
}

// post item to the cart
export const postCart = (req, res) => {
    const itemId = req.body.itemId;
    let targetItem;
    if (!itemId) {
        const error = new Error("ItemId not provided");
        error.statusCode = 404;
        throw error;
    }
    Item.findById(itemId).then(item => {
        targetItem = item;
        return Account.findById(req.user.id)
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
    const itemId = req.body.itemId;
    if (!itemId) {
        const error = new Error("ItemId not provided");
        error.statusCode = 404;
        throw error;
    }
    Account.findById(req.user.id)
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
    Account.findById(req.user.id)
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