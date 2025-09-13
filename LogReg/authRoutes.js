import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "./JWTmiddleware.js";
import User from "./Schema.js";

const authRoutes = express.Router();

// Register
authRoutes.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ msg: "All fields required" });
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: "Email already exists" });
        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed });
        res.status(201).json({ msg: "User registered" });
    } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Login
authRoutes.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid email or password" });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ msg: "Invalid email or password" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Protected example
authRoutes.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
});

export default authRoutes;
