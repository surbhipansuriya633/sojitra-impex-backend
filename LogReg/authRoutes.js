import express from "express";
import { loginUser, PayAddress, registerUser } from "./authController.js";

const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.put("/update-address/:id", PayAddress);

export default authRoutes;