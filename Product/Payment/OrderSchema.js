// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        paymentId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Paid", "Failed", "Pending"],
            default: "Pending",
        },
        quantity: {
            type: Number,
            default: 1,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
