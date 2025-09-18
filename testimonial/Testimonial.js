import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 3 },
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;