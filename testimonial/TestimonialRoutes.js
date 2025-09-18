Testimonial
import express from "express";
import Testimonial from "./Testimonial.js";

const Testimonials = express.Router();

Testimonials.get("/", async (req, res) => {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
});

// Add
Testimonials.post("/", async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        await testimonial.save();
        res.status(201).json(testimonial);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update
Testimonials.put("/:id", async (req, res) => {
    try {
        const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
Testimonials.delete("/:id", async (req, res) => {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
});

export default Testimonials;

