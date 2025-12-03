// server.js or routes/order.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "./OrderSchema.js";

const Orderrouter = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
Orderrouter.post("/create-order", async (req, res) => {
    try {
        const { productId, userId, amount } = req.body;

        const options = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({ order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Order creation failed" });
    }
});

Orderrouter.get("/", async (req, res) => {
    try {
        const orders = await Order.find().populate("user product");
        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

// Verify payment
Orderrouter.post("/verify-payment", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId,
            userId,
            quantity,
            amount,
            address
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Save order with quantity and amount
            const newOrder = new Order({
                user: userId,
                product: productId,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                status: "Paid",
                quantity: quantity,        // ✅ Add quantity
                amount: amount,           // ✅ Add total amount
            });
            await newOrder.save();

            res.status(200).json({ success: true, message: "Payment verified and order saved", order: newOrder });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Payment verification failed" });
    }
});

export default Orderrouter;
