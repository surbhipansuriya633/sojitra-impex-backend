import express from "express";
import { AboutusUpload } from "../middlewere/multer.js";
import AboutUs from "./Schema.js";
import cloudinary from "../middlewere/cloudinary.js";

const AboutRoutes = express.Router();

// ➡️ Add About Us (1 single + multiple up to 2)
AboutRoutes.post(
    "/",
    AboutusUpload.fields([
        { name: "image", maxCount: 1 },   // Single image
        { name: "images", maxCount: 10 }, // Multiple images
    ]),
    async (req, res) => {
        try {
            const singleImage = req.files["image"]
                ? {
                    url: req.files["image"][0].path,
                    public_id: req.files["image"][0].filename,
                }
                : null;

            const multipleImages = req.files["images"]
                ? req.files["images"].map((file) => ({
                    url: file.path,
                    public_id: file.filename,
                }))
                : [];

            const about = new AboutUs({
                image: singleImage,
                images: multipleImages,
            });

            await about.save();
            res.status(201).json(about);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// ➡️ Get latest About Us
AboutRoutes.get("/", async (req, res) => {
    try {
        const abouts = await AboutUs.find();
        res.json(abouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ➡️ Update About Us
AboutRoutes.put(
    "/:id",
    AboutusUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    async (req, res) => {
        try {
            const about = await AboutUs.findById(req.params.id);
            if (!about) return res.status(404).json({ error: "Not found" });

            // Delete old images if new ones uploaded
            if (req.files["image"] && about.image?.public_id) {
                await cloudinary.uploader.destroy(about.image.public_id);
            }

            if (req.files["images"] && about.images?.length > 0) {
                for (const img of about.images) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }

            // Replace with new uploads
            const singleImage = req.files["image"]
                ? {
                    url: req.files["image"][0].path,
                    public_id: req.files["image"][0].filename,
                }
                : about.image;

            const multipleImages = req.files["images"]
                ? req.files["images"].map((file) => ({
                    url: file.path,
                    public_id: file.filename,
                }))
                : about.images;

            about.image = singleImage;
            about.images = multipleImages;

            await about.save();
            res.json(about);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// ➡️ Delete About Us
AboutRoutes.delete("/:id", async (req, res) => {
    try {
        const about = await AboutUs.findById(req.params.id);
        if (!about) return res.status(404).json({ error: "Not found" });

        // Delete images from Cloudinary
        if (about.image?.public_id) {
            await cloudinary.uploader.destroy(about.image.public_id);
        }
        if (about.images?.length > 0) {
            for (const img of about.images) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        await AboutUs.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default AboutRoutes;
