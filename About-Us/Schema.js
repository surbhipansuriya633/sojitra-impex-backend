import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema(
    {
        // Single image
        image: {
            url: String,
            public_id: String,
        },
        // Multiple images
        images: [
            {
                url: String,
                public_id: String,
            },
        ],
    },
    { timestamps: true }
);

const AboutUs = mongoose.model("AboutUs", aboutUsSchema);

export default AboutUs;
