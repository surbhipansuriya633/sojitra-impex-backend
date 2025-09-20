import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from './Schema.js'

const generateToken = (id) => {
    return jwt.sign({ id }, "SECRET_KEY", { expiresIn: "1d" });
};

// Register
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ firstName, lastName, email, password: hashed });

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