import express from "express";
import Cart from "./cartSchema.js";
import Product from "../Schema.js";
const cartRoutes = express.Router();

// ➡ Add to cart
cartRoutes.post("/", async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let existing = await Cart.findOne({ userId, product: productId });
        if (existing) {
            existing.quantity += quantity || 1;
            await existing.save();
            return res.json(existing);
        }
        const product = await Product.findById(productId);
        const cartItem = new Cart({ userId, product: product._id, quantity });
        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ➡ Get user cart
cartRoutes.get("/:userId", async (req, res) => {
    try {
        const cart = await Cart.find({ userId: req.params.userId }).populate("product");
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ➡ Remove item
cartRoutes.delete("/:userId/:productId", async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.params.userId, product: req.params.productId });
        res.json({ message: "Removed from cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default cartRoutes