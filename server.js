import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./LogReg/authRoutes.js";
import productRoutes from "./Product/productRoutes.js";
import AboutRoutes from "./About-Us/AboutRoutes.js";
import teamRoutes from "./Team/teamRoutes.js";
import Testimonials from "./testimonial/TestimonialRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes); // Login Signup
app.use("/products", productRoutes); //Product CRUD
app.use("/aboutus", AboutRoutes); //About_Us CRUD
app.use("/team", teamRoutes); //Team CRUD
app.use("/testimonials", Testimonials); //Team CRUD

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT, () => console.log("Server on", process.env.PORT));
    })
    .catch(console.error);