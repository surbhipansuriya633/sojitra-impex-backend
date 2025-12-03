import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from './Schema.js'

const generateToken = (id) => {
    return jwt.sign({ id }, "SECRET_KEY", { expiresIn: "1d" });
};

// Register
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password,address } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ firstName, lastName, email, password: hashed,address });

        res.json({ success: true, token: generateToken(user._id), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        res.json({ success: true, token: generateToken(user._id), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const PayAddress = async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ message: "Address is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { address },
            { new: true } // returns the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Address updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};