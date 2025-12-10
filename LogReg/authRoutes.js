import express from "express";
import { loginUser, registerUser, updateUser } from "./authController.js";

const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.put("/update/:id", updateUser);

export default authRoutes;