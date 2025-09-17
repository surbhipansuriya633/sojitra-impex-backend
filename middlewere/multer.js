import multer from "multer";
import cloudinary from "./cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/* Product */
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;

/* Aboutus Multer */

// Multer storage with Cloudinary
const aboutusStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "aboutus", // 📂 specific folder
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

export const AboutusUpload = multer({ storage: aboutusStorage });